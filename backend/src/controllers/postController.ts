import type { AppContext } from '@/infra/appContext.js';
import { bindContext } from '@/infra/bindContext.js';
import { createCommentService } from '@/services/commentService.js';
import { createPostLikeService } from '@/services/postLikeService.js';
import { createPostService } from '@/services/postService.js';
import { createPostViewService } from '@/services/postViewService.js';
import { createUserService } from '@/services/userService.js';
import type { RouteParams } from '@/types/RouteParams.js';
import { fail, ok } from '@/utils/apiHelper.js';
import { getCurrentUser } from '@/utils/auth.js';
import { escapeHtml } from '@/utils/helper.js';
import type { PostId } from '@shared/models/generated/Post.js';
import type { PostViewInitializer } from '@shared/models/generated/PostView.js';
import type { DeviceFingerprint } from '@shared/types/DeviceFingerprint.js';
import { jsonBase64Decode } from '@shared/utils/encoding.js';
import type { Request, Response } from 'express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { validate } from 'uuid';

export const createPostController = (app: AppContext) => {
    const makeCtx = bindContext(app);

    return {

        getUserPublished: async (req: Request<RouteParams>, res: Response): Promise<Response> => {
            const { page_num } = req.query;
            const { id } = req.params;

            const ctx = makeCtx(req);
            const userSvc = createUserService(ctx);
            const postSvc = createPostService(ctx);

            const user = validate(id) //if uuid format
                ? await userSvc.findById(id)
                : await userSvc.findByVanityId(id);
            if (!user) return fail(res);

            const user_id = user.id;
            const result = await postSvc.get({
                user_id,
                visibility: 'public',
                is_published: true,
                page_num: page_num ? parseInt(String(page_num)) : 1,
                page_size: 30,
                order_by: 'created_at',
                order_dir: 'desc'
            });
            const enriched = await postSvc.enrich(result.page_items);
            result.page_items = enriched;

            return ok(res, result);
        },

        create: async (req: Request, res: Response): Promise<Response> => {
            const { title, content, files } = req.body;
            const result = await createPostService(makeCtx(req)).create({
                user_id: req.user!.id,
                title,
                content,
                files
            });
            if (!result.id) return fail(res);

            return ok(res);
        },

        get: async (req: Request<RouteParams>, res: Response): Promise<Response> => {
            const { id } = req.params;
            const postSvc = await createPostService(makeCtx(req));
            const post = await postSvc.getById(id!);
            const [enriched] = await postSvc.enrich([post]);

            return ok(res, enriched);
        },

        createComment: async (req: Request<RouteParams>, res: Response): Promise<Response> => {
            const { id } = req.params;
            const { comment } = req.body;

            const result = await createCommentService(makeCtx(req)).create({
                post_id: id!,
                user_id: req.user!.id,
                comment
            });
            if (!result.id) return fail(res);

            return ok(res, result);
        },

        getComments: async (req: Request, res: Response): Promise<Response> => {
            const { page_num } = req.query;
            const { id } = req.params;

            const result = await createCommentService(makeCtx(req)).get({
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

            await createPostViewService(makeCtx(req)).create(postView);
            return ok(res);
        },

        like: async (req: Request<RouteParams>, res: Response): Promise<Response> => {
            const { id } = req.params;
            await createPostLikeService(makeCtx(req)).like(id);
            return ok(res);
        },

        unlike: async (req: Request<RouteParams>, res: Response): Promise<Response> => {
            const { id } = req.params;
            await createPostLikeService(makeCtx(req)).unlike(id);
            return ok(res);
        },

        del: async (req: Request<RouteParams>, res: Response): Promise<Response> => {
            const { id } = req.params;
            const deleted = await createPostService(makeCtx(req)).delete(id);
            return ok(res, deleted);
        },

        update: async (req: Request<RouteParams>, res: Response): Promise<Response> => {
            const { id } = req.params;
            const { title, content, files } = req.body;
            const postSvc = await createPostService(makeCtx(req));
            const result = await postSvc.update(id, {
                title,
                content,
                files
            });
            if (!result.id) return fail(res);

            const [enriched] = await postSvc.enrich([result]);

            return ok(res, enriched);
        },

        uploadImage: async (req: Request, res: Response): Promise<Response> => {
            const file = req.file;
            const id = req.params.id as PostId;
            const postImage = await createPostService(makeCtx(req)).uploadImage(id, file!);

            return ok(res, postImage);
        },

        getOG: async (req: Request<RouteParams>, res: Response): Promise<Response> => {
            const { id } = req.params;
            const postSvc = await createPostService(makeCtx(req));
            const post = await postSvc.getById(id!);
            const [enriched] = await postSvc.enrich([post]);
            const file = fileURLToPath(new URL('../../../frontend/dist/index.html', import.meta.url));
            const html = readFileSync(file, { encoding: 'utf-8' });
            const proto = req.headers['x-forwarded-proto'] ?? 'https';
            const host = req.headers['host'];
            const path = req.headers['x-original-uri'];

            const ogMeta = `${post.title ? `<title>${escapeHtml(post.title)}</title>` : ''}
<meta name="description" content="${escapeHtml(post.content).slice(0, 200)}" />
<meta property="og:title" content="${escapeHtml(post.title).slice(0, 100)}" />
<meta property="og:description" content="${escapeHtml(post.content).slice(0, 200)}" />
<meta property="og:image" content="${enriched?.images[0]?.url || ''}" />
<meta property="og:url" content="${proto}://${host}${path}" />`;

            return res.status(200).send(html.replace('<!-- OG_META -->', ogMeta));
        },
    }
};