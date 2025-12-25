import * as userProfileService from '@/services/userProfileService';
import { ok } from '@/utils/apiHelper';
import { getCurrentUser } from '@/utils/auth';
import type { Request, Response } from 'express';

// export const create = async (req: Request, res: Response): Promise<Response> => {
//     const { profile, post_id } = req.body;
//     const current_user_id = getCurrentUser(req)?.id;

//     const result = await userProfileService.create({
//         user_id: current_user_id!,
//         profile
//     });
//     if (!result.id) return fail(res);

//     return ok(res, result);
// }

export const get = async (req: Request, res: Response): Promise<Response> => {
    const current_user_id = getCurrentUser(req)?.id;
    const result = (await userProfileService.get({
        user_id: current_user_id
    }))[0];
    return ok(res, result);
}

// export const update = async (req: Request, res: Response): Promise<Response> => {
//     const { id } = req.params;
//     const { profile } = req.body;
//     const current_user_id = getCurrentUser(req)?.id;

//     const result = await userProfileService.update(id!, {
//         ...(current_user_id && { current_user_id }),
//         profile
//     });
//     if (!result.id) return fail(res);

//     return ok(res, result);
// }

// export const del = async (req: Request, res: Response): Promise<Response> => {
//     const { id } = req.params;
//     const current_user_id = getCurrentUser(req)?.id;

//     const result = await userProfileService.del(id!, {
//         current_user_id: current_user_id!
//     });
//     if (!result.id) return fail(res);

//     return ok(res);
// }