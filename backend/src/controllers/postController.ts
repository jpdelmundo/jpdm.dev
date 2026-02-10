import type { AppContext } from '@/infra/appContext.js';
import * as commentService from '@/services/commentService.js';
import * as postLikeService from '@/services/postLikeService.js';
import * as postService from '@/services/postService.js';
import * as postViewService from '@/services/postViewService.js';
import type { AuthorizedRequest } from '@/types/AuthorizedRequest.js';
import type { RouteParams } from '@/types/RouteParams.js';
import { fail, ok } from '@/utils/apiHelper.js';
import { getActor, getCurrentUser } from '@/utils/auth.js';
import type { PostId } from '@shared/models/generated/Post.js';
import type { PostViewInitializer } from '@shared/models/generated/PostView.js';
import type { DeviceFingerprint } from '@shared/types/DeviceFingerprint.js';
import { jsonBase64Decode } from '@shared/utils/encoding.js';
import type { Request, Response } from 'express';

export const createPostController = (app: AppContext) => ({

    create: async (req: Request, res: Response): Promise<Response> => {
        const { title, content, files } = req.body;
        //create post
        const result = await postService.create({ user_id: req.user!.id, title, content, files }, app.deps, req.user!);
        if (!result.id) return fail(res);

        return ok(res);
    },

    get: async (req: Request<RouteParams>, res: Response): Promise<Response> => {
        const { id } = req.params;
        const post = await postService.getById(id!, { include: ['stats', 'images'], }, req.user!);
        return ok(res, post);
    },

    createComment: async (req: AuthorizedRequest<RouteParams>, res: Response): Promise<Response> => {
        const { id } = req.params;
        const { comment } = req.body;

        const result = await commentService.create({
            post_id: id!,
            user_id: req.user.id,
            comment
        });
        if (!result.id) return fail(res);

        return ok(res, result);
    },

    getComments: async (req: Request, res: Response): Promise<Response> => {
        const { page_num } = req.query;
        const { id } = req.params;
        const current_user_id = getCurrentUser(req)?.id;
        const result = await commentService.get({
            ...(current_user_id && { current_user_id }),
            post_id: id!,
            page_num: page_num ? parseInt(String(page_num)) : 1,
            page_size: 10,
            order_by: 'created_at',
            order_dir: 'desc'
        });
        return ok(res, result);
    },

    logView: async (req: Request, res: Response): Promise<Response> => {
        const { id: post_id } = req.params;
        const { fp, referrer } = req.body;
        const { device_id, client_tz, screen_width, screen_height, cpu_count, client, os, device_type, device } = jsonBase64Decode(fp) as DeviceFingerprint;
        const current_user_id = getCurrentUser(req)?.id;
        const postView: PostViewInitializer = {
            ...(current_user_id && { user_id: current_user_id }),
            post_id: post_id!,
            ...(device_id && { device_id }),
            ...(client_tz && { tz: client_tz }),
            ...(screen_height && { screen_height }),
            ...(screen_width && { screen_width }),
            ...(cpu_count && { cpu_count }),
            ...(req.headers.referer && { referer: req.headers.referer }),
            ...(client && { client }),
            ...(req.ip && { ip: req.ip }),
            ...(os && { os }),
            ...(device && { device }),
            ...(device_type && { device_type }),
            ...(referrer && { referrer })
        };

        await postViewService.create(postView);
        return ok(res);
    },

    like: async (req: Request<RouteParams>, res: Response): Promise<Response> => {
        const { id } = req.params;
        await postLikeService.like(id, req.user!);
        return ok(res);
    },

    unlike: async (req: Request<RouteParams>, res: Response): Promise<Response> => {
        const { id } = req.params;
        await postLikeService.unlike(id, req.user!);
        return ok(res);
    },

    del: async (req: Request<RouteParams>, res: Response): Promise<Response> => {
        const { id } = req.params;
        const deleted = await postService.del(id, req.user!);
        return ok(res, deleted);
    },

    update: async (req: Request<RouteParams>, res: Response): Promise<Response> => {
        const { id } = req.params;
        const { title, content, files } = req.body;
        const result = await postService.update(id, {
            title,
            content,
            files
        }, req.user!);
        if (!result.id) return fail(res);

        return ok(res, result);
    },

    uploadImage: async (req: Request, res: Response): Promise<Response> => {
        const file = req.file;
        const id = req.params.id as PostId;
        const actor = getActor(req);

        const postImage = await postService.uploadImage(id, file!, actor!);

        return ok(res, postImage);
    }
});