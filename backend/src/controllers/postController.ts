import * as commentService from '@/services/commentService';
import * as postLikeService from '@/services/postLikeService';
import * as postService from '@/services/postService';
import * as postViewService from '@/services/postViewService';
import type { AuthorizedRequest } from '@/types/AuthorizedRequest';
import { fail, ok } from '@/utils/apiHelper';
import { getCurrentUser } from '@/utils/auth';
import type { PostViewInitializer } from '@shared/models/generated/PostView';
import type { DeviceFingerprint } from '@shared/types/DeviceFingerprint';
import { jsonBase64Decode } from '@shared/utils/encoding';
import type { Request, Response } from 'express';

export const create = async (req: Request, res: Response): Promise<Response> => {
    const authReq = req as AuthorizedRequest;
    const user = authReq.user;
    const { title, content, files } = authReq.body;
    //create post
    const result = await postService.create({ user_id: user.id, title, content, files });
    if (!result.id) return fail(res);

    return ok(res);
}

export const get = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const current_user_id = getCurrentUser(req)?.id;
    const post = await postService.getById(id!, {
        include: ['stats', 'images'],
        ...(current_user_id && { current_user_id })
    });

    return ok(res, post);
}

// export const get = async (req: Request, res: Response): Promise<Response> => {
//     const authReq = req as AuthorizedRequest;
//     const user = authReq.user;
//     const { page, rows } = req.query;
//     const posts = await getPosts({
//         user_id: user.id,
//         ...(page && { page_num: parseInt(String(page)) }),
//         ...(rows && { rows: parseInt(String(rows)) }),
//     });

//     return ok(res, posts);
// }

// export const getImages = async (req: Request, res: Response): Promise<Response> => {
//     const { id } = req.params;
//     const
// }

export const createComment = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const { comment } = req.body;
    const current_user_id = getCurrentUser(req)?.id;

    const result = await commentService.create({
        post_id: id!,
        user_id: current_user_id!,
        comment: String(comment).trim().replace(/\n{3,}/g, '\n\n')
    });
    if (!result.id) return fail(res);

    return ok(res, result);
}

export const getComments = async (req: Request, res: Response): Promise<Response> => {
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
}

export const logView = async (req: Request, res: Response): Promise<Response> => {
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
}

export const like = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const current_user_id = getCurrentUser(req)?.id;
    await postLikeService.like(id!, current_user_id!);
    return ok(res);
}

export const unlike = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const current_user_id = getCurrentUser(req)?.id;
    await postLikeService.unlike(id!, current_user_id!);
    return ok(res);
}