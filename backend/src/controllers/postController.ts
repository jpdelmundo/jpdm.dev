import { create as createPost, getImage as getPostImage, getImages as getPostImages } from '@/services/postService';
import type { AuthorizedRequest } from '@/types/AuthorizedRequest';
import { fail, ok } from '@/utils/apiHelper';
import type PostImageExtended from '@shared/models/extensions/PostImageExtended';
import type { Request, Response } from 'express';

export const create = async (req: Request, res: Response): Promise<Response> => {
    const authReq = req as AuthorizedRequest;
    const user = authReq.user;
    const { title, content, files } = authReq.body;
    //create post
    const result = await createPost({ user_id: user.id, title, content, files });
    if (!result.id) return fail(res);

    return ok(res);
}

// export const get = async (req: Request, res: Response): Promise<Response> => {
//     const authReq = req as AuthorizedRequest;
//     const user = authReq.user;
//     const { page, rows } = req.query;
//     const posts = await getPosts({
//         user_id: user.id,
//         ...(page && { page_num: parseInt(String(page)) }),
//         ...(rows && { rows: parseInt(String(rows)) }),
//     });

//     return ok(res, posts);
// }

// export const getImages = async (req: Request, res: Response): Promise<Response> => {
//     const { id } = req.params;
//     const
// }

export const getImage = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const { include_set } = req.query;

    const post_image = await getPostImage(String(id));
    let post_image_set: PostImageExtended[] = [];
    if (include_set && post_image.post_id) {
        post_image_set = await getPostImages(post_image.post_id);
    }

    const result = { post_image, post_image_set };

    return ok(res, result);
}

export const getComments = async (req: Request, res: Response): Promise<Response> => {
    return ok(res);
}