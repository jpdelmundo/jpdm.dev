import type { AppContext } from "@/infra/appContext.js";
import { bindContext } from "@/infra/bindContext.js";
import { createCommentService } from '@/services/commentService.js';
import type { RouteParams } from "@/types/RouteParams.js";
import { ok } from "@/utils/apiHelper.js";
import type { Request, Response } from "express";

export const createMeController = (app: AppContext) => {
    const makeCtx = bindContext(app);

    return {
        get: async (req: Request, res: Response): Promise<Response> => {
            const { page_num, page_size, comment, date_from, date_to } = req.query;
            const commentSvc = createCommentService(makeCtx(req));

            const result = await commentSvc.get({
                ...(req.user?.id && { user_id: req.user.id }),
                ...(comment && { comment: String(comment) }),
                ...(date_from && { date_from: { gte: new Date(String(date_from)) } }),
                ...(date_to && { date_to: { lte: new Date(String(date_to)) } }),
                page_num: page_num ? parseInt(String(page_num)) : 1,
                page_size: page_size ? parseInt(String(page_size)) : 30,
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
            const commentSvc = createCommentService(makeCtx(req));

            const updated = await commentSvc.update(id, { comment });
            if (!updated) return ok(res, null);

            const [result] = await commentSvc.enrich([updated], { include: ['post'] });

            return ok(res, result);
        },

        delete: async (req: Request<RouteParams>, res: Response): Promise<Response> => {
            const { id } = req.params;
            const commentSvc = createCommentService(makeCtx(req));

            const deleted = await commentSvc.delete(id);

            return ok(res, deleted);
        }
    }
};