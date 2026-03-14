import type { AppContext } from '@/infra/appContext.js';
import { bindContext } from '@/infra/bindContext.js';
import { createUserProfileService } from '@/services/userProfileService.js';
import type { RouteParams } from '@/types/RouteParams.js';
import { ok } from '@/utils/apiHelper.js';
import type { UserId } from '@shared/models/generated/User.js';
import type { Request, Response } from 'express';

export const createUserProfileController = (app: AppContext) => {
    const makeCtx = bindContext(app);

    return {
        get: async (req: Request, res: Response): Promise<Response> => {
            const { id } = req.params;
            const result = (await createUserProfileService(makeCtx(req)).get({ user_id: id }))[0];
            return ok(res, result);
        },

        update: async (req: Request<RouteParams>, res: Response): Promise<Response> => {
            const { first_name, last_name, gender, phone_number, date_of_birth, bio } = req.body;
            const { id } = req.params;
            const result = await createUserProfileService(makeCtx(req)).updateByUserId(id, { first_name, last_name, gender, phone_number, date_of_birth, bio });

            return ok(res, result);
        },

        uploadAvatar: async (req: Request, res: Response): Promise<Response> => {
            const file = req.file;
            const id = req.params.id as UserId;
            const avatarFile = await createUserProfileService(makeCtx(req)).updateAvatar(id, file!);

            return ok(res, avatarFile);
        },

        deleteAvatar: async (req: Request, res: Response): Promise<Response> => {
            const id = req.params.id as UserId;
            await createUserProfileService(makeCtx(req)).deleteAvatar(id);
            return ok(res);
        }
    }
};