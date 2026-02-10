import * as imageService from '@/services/imageService.js';
import type { RouteParams } from '@/types/RouteParams.js';
import { ok } from '@/utils/apiHelper.js';
import type ImageExtended from '@shared/models/extensions/ImageExtended.js';
import type { Request, Response } from 'express';

export const get = async (req: Request<RouteParams>, res: Response): Promise<Response> => {
    const { id } = req.params;
    const { include_set } = req.query;
    const post_image = await imageService.getById(id, req.user) as ImageExtended;
    let post_image_set: ImageExtended[] = [];
    if (include_set && post_image?.post_id) {
        post_image_set = (await imageService.get({ post_id: post_image.post_id }, req.user)) as ImageExtended[];
    }

    const result = { post_image, post_image_set };

    return ok(res, result);
}