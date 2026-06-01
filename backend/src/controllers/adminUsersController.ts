import type { AppContext } from '@/infra/appContext.js';
import { bindContext } from '@/infra/bindContext.js';
import { createUserProfileService } from '@/services/userProfileService.js';
import { createUserService } from '@/services/userService.js';
import type { RouteParams } from '@/types/RouteParams.js';
import type { User, UserId } from '@shared/models/generated/User.js';
import type { Request, Response } from 'express';
import { fail, ok } from '../utils/apiHelper.js';

export const createAdminUsersController = (app: AppContext) => {
    const makeCtx = bindContext(app);

    return {
        search: async (req: Request, res: Response) => {
            const { username, first_name, last_name, email, date_from, date_to, page_num, page_size, order_by, order_dir } = req.query;
            const userSvc = createUserService(makeCtx(req));
            const result = await userSvc.search({
                ...(username && { username }),
                ...(first_name && { first_name }),
                ...(last_name && { last_name }),
                ...(email && { email }),
                ...(page_num && { page_num: parseInt(String(page_num)) }),
                ...(page_size && { page_size: parseInt(String(page_size)) }),
                ...(date_from && { date_from: { gte: new Date(String(date_from)) } }),
                ...(date_to && { date_to: { gte: new Date(String(date_to)) } }),
                ...(order_by && { order_by }),
                ...(order_dir && { order_dir }),
            });

            let _result: unknown;
            if ('page_items' in result) {
                result.page_items = await userSvc.toDTO(result.page_items as User[]);
                _result = result;
            } else
                _result = await userSvc.toDTO(result);

            return ok(res, _result);
        },

        update: async (req: Request<RouteParams>, res: Response): Promise<Response> => {
            const { id } = req.params;
            const { ids, deleted, username, email } = req.body;
            const { profile } = req.body;
            const { first_name, last_name, date_of_birth, bio, phone_number, gender } = profile || {};
            const targetIds = ids || [id];
            const ctx = makeCtx(req);
            const userSvc = createUserService(ctx);
            const updated = new Set<UserId>();

            if (username || email || deleted !== undefined) {
                const result = await userSvc.update(targetIds, {
                    ...(username && { username }),
                    ...(email && { email }),
                    ...(deleted !== undefined && { deleted })
                });
                result.map(i => updated.add(i.id));
            }

            if (profile) {
                for (const id of targetIds) {
                    const result = await createUserProfileService(ctx).updateByUserId(id, {
                        first_name,
                        last_name,
                        date_of_birth,
                        bio,
                        phone_number,
                        gender
                    });
                    updated.add(result.user_id);
                }
            }

            const users = await userSvc.get({ ids: [...updated] });
            const [result] = await userSvc.toDTO(users);

            return result ? ok(res, result) : fail(res);
        },

        delete: async (req: Request<RouteParams>, res: Response): Promise<Response> => {
            const { id } = req.params;
            const { ids, password, token } = req.body;
            const targetIds = ids || id;
            const result = await createUserService(makeCtx(req)).delete(targetIds, { password, token });

            return result ? ok(res, { deleted_count: result.length }) : fail(res);
        },

        setTempPassword: async (req: Request<RouteParams>, res: Response): Promise<Response> => {
            const { id } = req.params;
            const tempPassword = await createUserService(makeCtx(req)).setTempPassword(id);

            return tempPassword ? ok(res, { password: tempPassword }) : fail(res);
        }
    }

}