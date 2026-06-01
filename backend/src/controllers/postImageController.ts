import type { AppContext } from '@/infra/appContext.js';
import { bindContext } from '@/infra/bindContext.js';
import { createPostImageService } from '@/services/postImageService.js';
import type { RouteParams } from '@/types/RouteParams.js';
import { ok } from '@/utils/apiHelper.js';
import type PostImageExtended from '@shared/models/extensions/PostImageExtended.js';
import type { PostImage } from '@shared/models/generated/PostImage.js';
import type { Request, Response } from 'express';

export const createPostImageController = (app: AppContext) => {
    const makeCtx = bindContext(app);

    return {
        get: async (req: Request<RouteParams>, res: Response): Promise<Response> => {
            const { id } = req.params;
            const { include_set } = req.query;
            const imageSvc = createPostImageService(makeCtx(req));

            const postImage = await imageSvc.getById(id) as PostImage;
            const [post_image] = (postImage ? await imageSvc.toDTO([postImage]) : []) as PostImageExtended[];

            let post_image_set: PostImageExtended[] = [];
            if (include_set && post_image?.post_id) {
                const postImages = await imageSvc.get({ post_id: post_image.post_id });
                post_image_set = (postImages ? await imageSvc.toDTO(postImages) : []) as PostImageExtended[];
            }

            const result = { post_image, post_image_set };

            return ok(res, result);
        }
    }
}