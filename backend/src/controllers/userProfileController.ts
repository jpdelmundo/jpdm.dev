import * as userProfileService from '@/services/userProfileService.js';
import type { RouteParams } from '@/types/RouteParams.js';
import { ok } from '@/utils/apiHelper.js';
import { getActor } from '@/utils/auth.js';
import type { UserId } from '@shared/models/generated/User.js';
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
    const { id } = req.params;
    const result = (await userProfileService.get({ user_id: id }))[0];
    return ok(res, result);
}

export const update = async (req: Request<RouteParams>, res: Response): Promise<Response> => {
    const { first_name, last_name, gender, phone_number, date_of_birth, bio } = req.body;
    const { id } = req.params;
    const result = await userProfileService.updateByUserId(id, { first_name, last_name, gender, phone_number, date_of_birth, bio }, req.user!);

    return ok(res, result);
}

// export const del = async (req: Request, res: Response): Promise<Response> => {
//     const { id } = req.params;
//     const current_user_id = getCurrentUser(req)?.id;

//     const result = await userProfileService.del(id!, {
//         current_user_id: current_user_id!
//     });
//     if (!result.id) return fail(res);

//     return ok(res);
// }

export const uploadAvatar = async (req: Request, res: Response): Promise<Response> => {
    const file = req.file;

    const id = req.params.id as UserId;
    const actor = getActor(req);

    const avatarFile = await userProfileService.updateAvatar(id, file!, actor!);

    return ok(res, avatarFile);
}

export const deleteAvatar = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params.id as UserId;
    const actor = getActor(req);

    const avatarFile = await userProfileService.deleteAvatar(id, actor!);
    return ok(res, avatarFile);
}