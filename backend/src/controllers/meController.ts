import type { AppContext } from '@/infra/appContext.js';
import { bindContext } from '@/infra/bindContext.js';
import { createPostService } from '@/services/postService.js';
import { ok } from '@/utils/apiHelper.js';
import type { Request, Response } from 'express';

export const createMeController = (app: AppContext) => {
    const makeCtx = bindContext(app);

    return {

        getStats: async (req: Request, res: Response): Promise<Response> => {
            const postSvc = createPostService(makeCtx(req));
            const { start_date, end_date, client_tz } = req.query;
            const params = {
                user_id: req.user?.id,
                ...(start_date && { start_date }),
                ...(end_date && { end_date }),
                ...(client_tz && { client_tz })
            }
            const result = await postSvc.getStats(params);

            return ok(res, result);
        },

    };
};
