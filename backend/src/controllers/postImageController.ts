import type { AppContext } from '@/infra/appContext.js';
import { bindContext } from '@/infra/bindContext.js';
import { createPostImageService } from '@/services/postImageService.js';
import type { RouteParams } from '@/types/RouteParams.js';
import { ok } from '@/utils/apiHelper.js';
import type PostImageExtended from '@shared/models/extensions/PostImageExtended.js';
import type { Request, Response } from 'express';

export const createPostImageController = (app: AppContext) => {
    const makeCtx = bindContext(app);

    return {
        get: async (req: Request<RouteParams>, res: Response): Promise<Response> => {
            const { id } = req.params;
            const { include_set } = req.query;
            const imageSvc = createPostImageService(makeCtx(req));

            const post_image = await imageSvc.getById(id) as PostImageExtended;
            let post_image_set: PostImageExtended[] = [];
            if (include_set && post_image?.post_id) {
                post_image_set = (await imageSvc.get({ post_id: post_image.post_id })) as PostImageExtended[];
            }

            const result = { post_image, post_image_set };

            return ok(res, result);
        }
    }
}