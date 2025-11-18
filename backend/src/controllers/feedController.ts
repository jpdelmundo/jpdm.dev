import { getPosts } from '@/services/postService';
import { ok } from '@/utils/apiHelper';
import type { Request, Response } from 'express';

export const get = async (req: Request, res: Response): Promise<Response> => {
    const { page } = req.query;
    const posts = getPosts({
        visibility: 'public',
        is_published: true,
        ...(page && { page_num: parseInt(String(page)) }),
        rows: 30
    });

    return ok(res, posts);
}