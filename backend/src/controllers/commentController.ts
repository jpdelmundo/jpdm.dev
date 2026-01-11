import * as commentService from '@/services/commentService';
import { fail, ok } from '@/utils/apiHelper';
import { getCurrentUser } from '@/utils/auth';
import type { Request, Response } from 'express';

export const create = async (req: Request, res: Response): Promise<Response> => {
    const { comment, post_id } = req.body;
    const current_user_id = getCurrentUser(req)?.id;

    const result = await commentService.create({
        post_id,
        user_id: current_user_id!,
        comment
    });
    if (!result.id) return fail(res);

    return ok(res, result);
}

export const get = async (req: Request, res: Response): Promise<Response> => {
    const { page_num, post_id } = req.query;
    const current_user_id = getCurrentUser(req)?.id;
    const result = await commentService.get({
        ...(current_user_id && { current_user_id }),
        // ...(id && { id }),
        post_id,
        page_num: page_num ? parseInt(String(page_num)) : 1,
        page_size: 10,
        order_by: 'created_at',
        order_dir: 'desc'
    });
    return ok(res, result);
}

export const update = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const { comment } = req.body;
    const current_user_id = getCurrentUser(req)?.id;

    const result = await commentService.update(id!, { comment }, { current_user_id });
    if (!result.id) return fail(res);

    return ok(res, result);
}

export const del = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const current_user_id = getCurrentUser(req)?.id;

    const result = await commentService.del(id!, {
        current_user_id: current_user_id!
    });

    return result.id ? ok(res) : fail(res);
}