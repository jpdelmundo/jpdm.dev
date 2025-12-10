import * as imageService from '@/services/imageService';
import { ok } from '@/utils/apiHelper';
import { getCurrentUser } from '@/utils/auth';
import type ImageExtended from '@shared/models/extensions/ImageExtended';
import type { Request, Response } from 'express';

export const get = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const { include_set } = req.query;
    const current_user_id = getCurrentUser(req)?.id;
    const post_image = await imageService.getById(id!, { ...(current_user_id && { current_user_id }) }) as ImageExtended;
    console.log({ post_image });
    let post_image_set: ImageExtended[] = [];
    if (include_set && post_image?.post_id) {
        post_image_set = (await imageService.get({
            post_id: post_image.post_id,
            ...(current_user_id && { current_user_id }),
        })) as ImageExtended[];
    }

    const result = { post_image, post_image_set };

    return ok(res, result);
}