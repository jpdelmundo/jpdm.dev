import { ApiErrorCode } from '@shared/types/ApiResult';
import { jsonBase64Decode } from '@shared/utils/encoding';
import { validatePassword } from '@shared/utils/validate';
import * as bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import { ErrorCode } from 'src/errors/ErrorCode';
import type { AuthorizedRequest } from 'src/types/AuthorizedRequest';
import { createRefreshTokenCookie } from '../services/authService';
import * as userService from '../services/userService';
import { fail, ok } from '../utils/apiHelper';
import { generateAccessToken } from '../utils/auth';

export const profile = async (req: AuthorizedRequest, res: Response): Promise<Response> => {
    const profile = await userService.getProfile(req.user.id);
    return ok(res, profile);
}

export const create = async (req: Request, res: Response): Promise<Response> => {
    const { username, password, fingerprint, token, return_access_token } = req.body;

    const captchaVerifyResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'post',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            secret: process.env.RECAPTCHAV3_SECRET_KEY as string,
            response: token
        }).toString()
    });

    const captchaVerifyResult = await captchaVerifyResponse.json();
    if (captchaVerifyResult.score <= 0.5) return fail(res, 'Low captcha score', 406, ApiErrorCode.BOT_DETECTED);
    if (!password) return fail(res, 'Password required');
    if (validatePassword(password).length > 0) return fail(res, 'Password invalid');

    //check username
    const createUserResult = await userService.createUser({ username, password: await bcrypt.hash(password, 12) });
    if (!createUserResult.ok || !createUserResult.data) {
        if (createUserResult.error?.code == ErrorCode.USERNAME_ALREADY_USED) return fail(res, 'The username you\'ve chosen is already in use by another account', 400, ApiErrorCode.USERNAME_ALREADY_USED);
        throw new Error('Failed creating user');
    }

    //create jwt and refresh token
    const newUser = createUserResult.data;
    const tokenData = await userService.getTokenData({ username: newUser.username });
    if (!tokenData) throw new Error('Cannot get token data');

    const access_token = generateAccessToken(tokenData);
    const refreshToken = await userService.createRefreshToken({ ...jsonBase64Decode(fingerprint), user_id: tokenData.id, request_ip: req.ip });

    createRefreshTokenCookie(refreshToken, false, req, res);

    return ok(res, { access_token, user_id: newUser.id });
}

export const emailCode = async (req: AuthorizedRequest, res: Response): Promise<Response> => {
    const { email } = req.body;
    //check if email is used
    if (await userService.isEmailAlreadyUsed(email)) return fail(res, 'The email address is already used in another account.', 409, ApiErrorCode.EMAIL_ALREADY_USED);
    //not existing, create code, send email

    const checkAllowed = await userService.isAllowedToEmailConfirmCode(req.user.id);
    if (!checkAllowed.allowed) {
        if (checkAllowed.reason == 'max_sent_limit') return fail(res, 'Request limit reached. Please try again after 1 hour.', 429);
        if (checkAllowed.reason == 'cooldown') return fail(res, 'Still on cooldown...', 425, null, { cooldown: checkAllowed.cooldown });
        return fail(res, 'Something went wrong');
    }

    const result = await userService.sendEmailConfirmCode(req.user.id, email);
    if (!result || result.rejected.length > 0 || !result.response) throw Error(`Problem generating/sending email confirm code for user : ${req.user!.id}`);

    return ok(res);
}

export const emailCodeConfirm = async (req: AuthorizedRequest, res: Response): Promise<Response> => {
    const { code } = req.body;
    //get user email code
    const result = await userService.confirmEmailCode(req.user.id, code);
    if (!result) return fail(res, 'That code doesn\'t look right. Please check and try again.');

    return ok(res);
}