import type { AppContext } from '@/infra/appContext.js';
import { bindContext } from '@/infra/bindContext.js';
import { botCheck } from '@/services/captchaService.js';
import { createUserProfileService } from '@/services/userProfileService.js';
import { createUserService } from '@/services/userService.js';
import type { AuthorizedRequest } from '@/types/AuthorizedRequest.js';
import type { RouteParams } from '@/types/RouteParams.js';
import type { User, UserId } from '@shared/models/generated/User.js';
import { jsonBase64Decode } from '@shared/utils/encoding.js';
import * as bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import { createRefreshTokenCookie } from '../services/authService.js';
import { fail, ok } from '../utils/apiHelper.js';
import { generateJwt, getCurrentUser } from '../utils/auth.js';

export const createUserController = (app: AppContext) => {
    const makeCtx = bindContext(app);

    return {
        get: async (req: Request, res: Response) => {
            const { name, email, date_from, date_to, page_num, page_size, order_by, order_dir } = req.query;
            const userSvc = createUserService(makeCtx(req));
            const result = await userSvc.get({
                is_admin: true,
                ...(email && { email }),
                ...(name && { name }),
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

        me: async (req: Request, res: Response) => {
            const id = getCurrentUser(req)?.id;
            const userSvc = createUserService(makeCtx(req));
            const user = await userSvc.findById(id!);
            const me = userSvc.toMe(user);
            return ok(res, me);
        },

        profile: async (req: Request, res: Response): Promise<Response> => {
            const authReq = req as AuthorizedRequest;
            const profile = await createUserService(makeCtx(req)).getProfile(authReq.user.id);
            return ok(res, profile);
        },

        create: async (req: Request, res: Response): Promise<Response> => {
            const { username, password, fp, token } = req.body;

            await botCheck(token);

            const userSvc = createUserService(makeCtx(req));

            //create user
            const newUser = await userSvc.createUser({ username, password: await bcrypt.hash(password, 12) });

            //create jwt and refresh token
            const payload = await userSvc.getTokenData({ username: newUser.username });
            if (!payload) throw new Error('Cannot get token data');

            const access_token = generateJwt(payload);
            const refreshToken = await userSvc.createRefreshToken({ ...jsonBase64Decode(fp), user_id: payload.id, request_ip: req.ip });

            createRefreshTokenCookie(refreshToken, true, req, res);

            return ok(res, { access_token, user_id: newUser.id });
        },

        emailCode: async (req: Request, res: Response): Promise<Response> => {
            const authReq = req as AuthorizedRequest;
            const { email } = req.body;
            await createUserService(makeCtx(req)).sendEmailConfirmCode(authReq.user.id, email);

            return ok(res);
        },

        emailCodeConfirm: async (req: Request, res: Response): Promise<Response> => {
            const authReq = req as AuthorizedRequest;
            const { code } = req.body;
            const userSvc = createUserService(makeCtx(req));

            //get user email code
            const result = await userSvc.confirmEmailCode(authReq.user.id, code);
            if (!result) return fail(res, 'That code doesn\'t look right. Please check and try again.');

            const user = await userSvc.findById(authReq.user.id);

            //TODO renew token

            return ok(res, { email: user?.email });
        },

        recoverAccount: async (req: Request, res: Response): Promise<Response> => {
            const { email, fp, token } = req.body;

            await botCheck(token);
            await createUserService(makeCtx(req)).recoverAccount(email, fp);

            return ok(res);
        },

        isResetPasswordTokenHashValid: async (req: Request, res: Response): Promise<Response> => {
            const { token_hash } = req.query;

            return await createUserService(makeCtx(req)).isResetPasswordTokenHashValid(String(token_hash))
                ? ok(res)
                : fail(res);
        },

        resetPassword: async (req: Request, res: Response): Promise<Response> => {
            const { password, token_hash } = req.body;

            await createUserService(makeCtx(req)).resetPassword(token_hash, password);

            return ok(res);
        },

        updatePassword: async (req: Request<RouteParams>, res: Response): Promise<Response> => {
            const { id } = req.params;
            const { old_password, new_password } = req.body;

            const result = await createUserService(makeCtx(req)).updatePassword(id, {
                old_password,
                new_password
            });

            return result ? ok(res) : fail(res);
        },

        update: async (req: Request<RouteParams>, res: Response): Promise<Response> => {
            const { id } = req.params;
            const { ids, deleted, username, email } = req.body;
            const { profile } = req.body;
            const { first_name, last_name, date_of_birth, bio, phone_number, gender } = profile;
            const targetIds = ids || id;
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