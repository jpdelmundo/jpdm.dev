import type { AppContext } from '@/infra/appContext.js';
import { bindContext } from '@/infra/bindContext.js';
import { createImageService } from '@/services/imageService.js';
import type { RouteParams } from '@/types/RouteParams.js';
import { ok } from '@/utils/apiHelper.js';
import type ImageExtended from '@shared/models/extensions/ImageExtended.js';
import type { Request, Response } from 'express';

export const createImageController = (app: AppContext) => {
    const makeCtx = bindContext(app);

    return {
        get: async (req: Request<RouteParams>, res: Response): Promise<Response> => {
            const { id } = req.params;
            const { include_set } = req.query;
            const imageSvc = createImageService(makeCtx(req));

            const post_image = await imageSvc.getById(id) as ImageExtended;
            let post_image_set: ImageExtended[] = [];
            if (include_set && post_image?.post_id) {
                post_image_set = (await imageSvc.get({ post_id: post_image.post_id })) as ImageExtended[];
            }

            const result = { post_image, post_image_set };

            return ok(res, result);
        }
    }
}