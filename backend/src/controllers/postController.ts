import { createPost, getPosts } from '@/services/postService';
import type { AuthorizedRequest } from '@/types/AuthorizedRequest';
import { fail, ok } from '@/utils/apiHelper';
import type { Request, Response } from 'express';

export const create = async (req: Request, res: Response): Promise<Response> => {
    const authReq = req as AuthorizedRequest;
    const user = authReq.user;
    const { title, content, files } = authReq.body;

    //create post
    const newPost = await createPost({ user_id: user.id, title, content }, { files });
    if (!newPost.id) return fail(res);

    return ok(res);
}

export const get = async (req: Request, res: Response): Promise<Response> => {
    const authReq = req as AuthorizedRequest;
    const user = authReq.user;
    const { page, rows } = req.query;
    const posts = getPosts({
        user_id: user.id,
        ...(page && { page_num: parseInt(String(page)) }),
        ...(rows && { rows: parseInt(String(rows)) }),
    });

    return ok(res, posts);
}