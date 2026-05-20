import type { AppContext } from '@/infra/appContext.js';
import { bindContext } from '@/infra/bindContext.js';
import { createPostCommentService } from '@/services/postCommentService.js';
import type { RouteParams } from '@/types/RouteParams.js';
import { ok } from '@/utils/apiHelper.js';
import { CommentStatus } from '@shared/types/CommentStatus.js';
import type { Request, Response } from 'express';

export const createPostCommentController = (app: AppContext) => {
    const makeCtx = bindContext(app);

    return {
        create: async (req: Request, res: Response): Promise<Response> => {
            const { comment, post_id } = req.body;
            const postCommentSvc = createPostCommentService(makeCtx(req));

            const result = await postCommentSvc.create({
                user_id: req.user!.id,
                post_id, comment
            });
            const [enriched] = await postCommentSvc.enrich([result]);

            return ok(res, enriched);
        },

        get: async (req: Request, res: Response): Promise<Response> => {
            const { page_num, page_size, comment, date_from, date_to } = req.query;
            const postCommentSvc = createPostCommentService(makeCtx(req));

            const result = await postCommentSvc.get({
                user_id: req.user!.id,
                status: [CommentStatus.AI_APPROVED, CommentStatus.USER_APPROVED],
                page_num: page_num ? parseInt(String(page_num)) : 1,
                page_size: page_size ? parseInt(String(page_size)) : 30,
                order_by: 'created_at',
                order_dir: 'desc',
                ...(comment && { comment: String(comment) }),
                ...(date_from && { date_from: { gte: new Date(String(date_from)) } }),
                ...(date_to && { date_to: { lte: new Date(String(date_to)) } }),
            });

            const enriched = await postCommentSvc.enrich(result.page_items, { include: ['post'], });
            result.page_items = enriched;

            return ok(res, result);
        },

        update: async (req: Request<RouteParams>, res: Response,): Promise<Response> => {
            const { id } = req.params;
            const { comment } = req.body;
            const { return_include } = req.query;
            const postCommentSvc = createPostCommentService(makeCtx(req));

            const result = await postCommentSvc.update(id, { comment });
            const [enriched] = await postCommentSvc.enrich([result], { ...(return_include && { include: String(return_include).split(',') }) });

            return ok(res, enriched);
        },

        delete: async (req: Request<RouteParams>, res: Response,): Promise<Response> => {
            const { id } = req.params;
            const commentSvc = createPostCommentService(makeCtx(req));
            const deleted = await commentSvc.delete(id);

            return ok(res, deleted);
        },
    }
}