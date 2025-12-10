import { get } from '@/services/postService';
import { ErrorCode } from '@shared/types/ErrorCode';
import { jsonBase64Decode } from '@shared/utils/encoding';
import { validatePassword } from '@shared/utils/validate';
import * as bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import type { AuthorizedRequest } from 'src/types/AuthorizedRequest';
import { validate } from 'uuid';
import { createRefreshTokenCookie } from '../services/authService';
import * as userService from '../services/userService';
import { fail, ok } from '../utils/apiHelper';
import { generateAccessToken, getCurrentUser } from '../utils/auth';

export const profile = async (req: Request, res: Response): Promise<Response> => {
    const authReq = req as AuthorizedRequest;
    const profile = await userService.getProfile(authReq.user.id);
    return ok(res, profile);
}

export const create = async (req: Request, res: Response): Promise<Response> => {
    const { username, password, fp, token } = req.body;

    const captchaVerifyResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'post',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            secret: process.env.RECAPTCHAV3_SECRET_KEY as string,
            response: token
        }).toString()
    });

    const captchaVerifyResult = await captchaVerifyResponse.json();
    if (captchaVerifyResult.score <= 0.5) return fail(res, 'Low captcha score', 406, ErrorCode.BOT_DETECTED);
    if (!password) return fail(res, 'Password required');
    if (validatePassword(password).length > 0) return fail(res, 'Password invalid');

    //create user
    const newUser = await userService.createUser({ username, password: await bcrypt.hash(password, 12) });

    //create jwt and refresh token
    const tokenData = await userService.getTokenData({ username: newUser.username });
    if (!tokenData) throw new Error('Cannot get token data');

    const access_token = generateAccessToken(tokenData);
    const refreshToken = await userService.createRefreshToken({ ...jsonBase64Decode(fp), user_id: tokenData.id, request_ip: req.ip });

    createRefreshTokenCookie(refreshToken, false, req, res);

    return ok(res, { access_token, user_id: newUser.id });
}

export const emailCode = async (req: Request, res: Response): Promise<Response> => {
    const authReq = req as AuthorizedRequest;
    const { email } = req.body;

    await userService.sendEmailConfirmCode(authReq.user.id, email);

    return ok(res);
}

export const emailCodeConfirm = async (req: Request, res: Response): Promise<Response> => {
    const authReq = req as AuthorizedRequest;
    const { code } = req.body;
    //get user email code
    const result = await userService.confirmEmailCode(authReq.user.id, code);
    if (!result) return fail(res, 'That code doesn\'t look right. Please check and try again.');

    return ok(res);
}

export const posts = async (req: Request, res: Response): Promise<Response> => {
    const { page_num } = req.query;
    const { id } = req.params;
    if (!id) return fail(res, 'Cannot fetch posts. Missing user id.');

    const user = validate(id) //if uuid format
        ? await userService.findById(id)
        : await userService.findByVanityId(id);
    if (!user) return fail(res, 'Cannot fetch posts. User not found.');
    const user_id = user.id;

    const current_user_id = getCurrentUser(req)?.id;
    console.log({ current_user_id });
    const posts = await get({
        user_id,
        visibility: 'public',
        is_published: true,
        page_num: page_num ? parseInt(String(page_num)) : 1,
        page_size: 30,
        order_by: 'created_at',
        order_dir: 'desc',
        include: ['stats', 'images'],
        current_user_id
    });

    return ok(res, posts);
}