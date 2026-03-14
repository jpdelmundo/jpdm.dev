import type { AppContext } from '@/infra/appContext.js';
import { bindContext } from '@/infra/bindContext.js';
import { createCommentService } from '@/services/commentService.js';
import type { RouteParams } from '@/types/RouteParams.js';
import { ok } from '@/utils/apiHelper.js';
import type { Request, Response } from 'express';

export const createCommentController = (app: AppContext) => {
    const makeCtx = bindContext(app);

    return {
        create: async (req: Request, res: Response): Promise<Response> => {
            const { comment, post_id } = req.body;

            const result = await createCommentService(makeCtx(req)).create({
                user_id: req.user!.id,
                post_id, comment
            });

            return ok(res, result);
        },

        get: async (req: Request, res: Response): Promise<Response> => {
            const { page_num, post_id } = req.query;
            const commentSvc = createCommentService(makeCtx(req));
            const result = await commentSvc.get({
                post_id,
                page_num: page_num ? parseInt(String(page_num)) : 1,
                page_size: 10,
                order_by: 'created_at',
                order_dir: 'desc'
            });
            const enriched = await commentSvc.enrich(result.page_items, { include: ['post'] });
            result.page_items = enriched;

            return ok(res, result);
        },

        update: async (req: Request<RouteParams>, res: Response): Promise<Response> => {
            const { id } = req.params;
            const { comment } = req.body;

            const result = await createCommentService(makeCtx(req)).update(id, { comment });

            return ok(res, result);
        },

        del: async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
            const { id } = req.params;

            const result = await createCommentService(makeCtx(req)).delete(id);

            return ok(res, result);
        }
    }
}