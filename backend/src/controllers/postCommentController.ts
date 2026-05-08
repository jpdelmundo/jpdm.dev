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
            const { page_num, post_id } = req.query;
            const commentSvc = createPostCommentService(makeCtx(req));
            const result = await commentSvc.get({
                post_id,
                status: [CommentStatus.AI_APPROVED, CommentStatus.USER_APPROVED],
                page_num: page_num ? parseInt(String(page_num)) : 1,
                page_size: 10,
                order_by: 'created_at',
                order_dir: 'asc'
            });
            const enriched = await commentSvc.enrich(result.page_items, { include: ['post'] });
            result.page_items = enriched;

            return ok(res, result);
        },

        update: async (req: Request<RouteParams>, res: Response): Promise<Response> => {
            const { id } = req.params;
            const { comment } = req.body;
            const postCommentSvc = createPostCommentService(makeCtx(req));

            const result = await postCommentSvc.update(id, { comment });
            const [enriched] = await postCommentSvc.enrich([result]);

            return ok(res, enriched);
        },

        del: async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
            const { id } = req.params;

            const result = await createPostCommentService(makeCtx(req)).delete(id);

            return ok(res, result);
        }
    }
}