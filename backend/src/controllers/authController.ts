import type { AuthorizedRequest } from '@/types/AuthorizedRequest.js';
import type { User } from '@shared/models/generated/User.js';
import type { DeviceFingerprint } from '@shared/types/DeviceFingerprint.js';
import { ErrorCode } from '@shared/types/ErrorCode.js';
import { jsonBase64Decode, jsonBase64Encode } from '@shared/utils/encoding.js';
import type { Request, Response } from 'express';
import type { NextFunction } from 'express-serve-static-core';
import passport from 'passport';

import { UnexpectedError } from '@/errors/UnexpectedError.js';
import { clearRefreshTokenCookie, createRefreshTokenCookie } from '../services/authService.js';
import * as userService from '../services/userService.js';
import { fail, ok } from '../utils/apiHelper.js';
import { generateJwt } from '../utils/auth.js';

interface LoginParams {
    username: string;
    password: string;
    fp: string;
    remember: boolean;
}

export const signIn = async (req: Request, res: Response): Promise<Response> => {
    const { username, password, remember, fp }: LoginParams = req.body;

    if (await userService.isValidCredentials(username, password)) {
        //get user
        const payload = await userService.getTokenData({ username });
        if (!payload) throw new UnexpectedError();

        //create refresh token and jwt
        const { device_id, client_tz, screen_width, screen_height, cpu_count } = jsonBase64Decode(fp) as DeviceFingerprint;
        const accessToken = generateJwt(payload);
        const refreshToken = await userService.createRefreshToken({
            device_id,
            client_tz,
            screen_width,
            screen_height,
            cpu_count,
            user_id: payload.id,
            ...(req.ip && { request_ip: req.ip }),
            remember
        });

        createRefreshTokenCookie(refreshToken, remember, req, res);

        return ok(res, accessToken);
    } else {
        return fail(res, 'Invalid username or password', 401, ErrorCode.INVALID_CREDENTIALS);
    }
}

export const signOut = async (req: Request, res: Response): Promise<Response> => {
    const authReq = req as AuthorizedRequest;
    const { fp } = req.body;
    if (fp) {
        const fingerprintObj = jsonBase64Decode(fp) as DeviceFingerprint;
        const deviceId = fingerprintObj.device_id;
        userService.signOut(authReq.user.id, deviceId);
    }

    clearRefreshTokenCookie(req, res);

    return ok(res);
}

export const refreshToken = async (req: Request, res: Response): Promise<Response> => {
    console.log('Requested refreshToken');
    const refreshTokenId = req.cookies?.refresh_token_id;
    //if (!refreshTokenId) throw new Error('Refresh token id missing');
    if (!refreshTokenId) return fail(res, 'Missing refresh token id', 400);

    console.log({ refreshTokenId });
    //get use
    const refreshToken = await userService.getRefreshToken(refreshTokenId);
    if (!refreshToken?.id) throw new Error('Refresh token not found');

    console.log({ refreshToken });
    //check if refresh token not yet used or revoked
    if (refreshToken.is_used || refreshToken.is_revoked) {
        //TODO log reuse or used/revoked refresh token
        console.log('Refresh token used/revoked', { refreshToken });
        clearRefreshTokenCookie(req, res);
        throw new Error('Refresh token used/revoked');
    }

    //check if refresh token fingerprint matches stored
    const { fp } = req.body;
    let fingerprintObj;
    try {
        fingerprintObj = jsonBase64Decode(fp) as DeviceFingerprint;
    } catch (error) {
        console.error('Cannot parse fingerprint', { fp });
        throw new Error('Error parsing refresh token request');
    }

    const { device_id, client_tz, screen_width, screen_height, cpu_count } = fingerprintObj;

    //check if IP address change
    if (req.ip != refreshToken.request_ip) {
        //TODO log IP change
        console.log('Refresh token IP mismatch', { 'req.ip': req.ip, 'refresh token ip': refreshToken.request_ip });
    }

    //check if client request fingerprint matches stored fingerprint
    if (!(client_tz == refreshToken.client_tz
        && device_id == refreshToken.device_id
        && cpu_count == refreshToken.cpu_count
        && screen_height == refreshToken.screen_height
        && screen_width == refreshToken.screen_width)) {
        //TODO log fingerprint mismatch
        console.error('Request identity mismatch', { fingerprintObj, refreshToken });
        throw new Error('Request identity mismatch');
    }

    try {
        //valid create new access token
        //get user
        const payload = await userService.getTokenData({ user_id: refreshToken.user_id });
        //console.log({ user });
        //create new access token
        const newAccessToken = generateJwt(payload);
        //console.log({ newAccessToken });
        //create new refresh token only if the refresh token used is more than 1 hour old
        //if (Date.now() - refreshToken.created_at.getTime() > 3600000) {

        const newRefreshToken = await userService.createRefreshToken({
            device_id,
            client_tz,
            screen_width,
            screen_height,
            cpu_count,
            user_id: payload.id,
            request_ip: req.ip || null,
            previous_refresh_token_id: refreshToken.id,
            remember: refreshToken.remember
        });
        //console.log({ newRefreshToken });

        createRefreshTokenCookie(newRefreshToken, refreshToken.remember, req, res);
        //}

        return ok(res, newAccessToken);
    } catch (error) {
        const e = error as Error;
        console.error(`${e.message} (${e.name})`);
        throw new Error('Error in creating new access token');
    }
}

export const googleAuth = async (req: Request, res: Response, next: NextFunction) => {
    const { fp, intent } = req.query;
    const customData = { fp, ip: req.ip, intent };
    const state = jsonBase64Encode(customData);

    passport.authenticate('google', {
        scope: ['profile', 'email'],
        prompt: 'select_account',
        session: false,
        state
    })(req, res, next);
}

export const googleAuthCallback = async (req: Request, res: Response, next: NextFunction) => {
    const { state } = req.query;
    const redirectUrl = new URL(`${process.env.FRONTEND_BASE_URL}/auth/callback`);
    let intent: string | undefined, customData;
    passport.authenticate('google', { session: false }, async (err: Error, user: User, info: unknown) => {
        try {
            customData = jsonBase64Decode(decodeURIComponent(state as string));
            intent = customData.intent;
        } catch (error) {
            redirectUrl.searchParams.set('error', error instanceof Error ? error.message : 'Authentication failed');
            res.redirect(redirectUrl.toString());
            return;
        }

        switch (intent) {
            //only return a delete token to a popup window
            case 'get_delete_token':
                try {
                    const payload = await userService.getTokenData({ user_id: user.id });
                    const token = generateJwt({ ...payload, scope: 'delete_account' });
                    res.send(`<script>
                        window.opener.postMessage({
                            token: '${token}'
                        }, '${process.env.FRONTEND_BASE_URL}');
                        window.close();
                    </script>`);
                } catch (error) {
                    res.send(`<script>
                        window.opener.postMessage({
                            error: '${(error as Error).message}'
                        }, '${process.env.FRONTEND_BASE_URL}');
                        window.close();
                    </script>`);
                }
                break;
            //oauth login
            default:
                try {
                    const { fp, ip } = customData;
                    const payload = await userService.getTokenData({ user_id: user.id });
                    const access_token = generateJwt(payload);
                    const refreshToken = await userService.createRefreshToken({ ...jsonBase64Decode(fp), user_id: payload.id, request_ip: ip });

                    createRefreshTokenCookie(refreshToken, true, req, res);

                    redirectUrl.searchParams.set('token', access_token);
                    res.redirect(redirectUrl.toString());
                } catch (error) {
                    redirectUrl.searchParams.set('error', error instanceof Error ? error.message : 'Authentication failed');
                    res.redirect(redirectUrl.toString());
                }
        }
    })(req, res, next);
}

export const facebookAuth = async (req: Request, res: Response, next: NextFunction) => {
    const { fp } = req.query;
    const customData = { fp, ip: req.ip };
    const state = jsonBase64Encode(customData);

    passport.authenticate('facebook', {
        scope: ['public_profile'],
        prompt: 'select_account',
        session: false,
        state
    })(req, res, next);
}

export const facebookAuthCallback = async (req: Request, res: Response, next: NextFunction) => {
    const { state } = req.query;
    const redirectUrl = new URL(`${process.env.SITE_URL}/auth/callback`);
    let intent: string | undefined, customData;
    passport.authenticate('facebook', { session: false }, async (err: Error, user: User, info: unknown) => {
        try {
            customData = jsonBase64Decode(decodeURIComponent(state as string));
            intent = customData.intent;
        } catch (error) {
            redirectUrl.searchParams.set('error', error instanceof Error ? error.message : 'Authentication failed');
            res.redirect(redirectUrl.toString());
            return;
        }

        switch (intent) {
            //only return a delete token to a popup window
            case 'get_delete_token':
                try {
                    const payload = await userService.getTokenData({ user_id: user.id });
                    const token = generateJwt({ ...payload, scope: 'delete_account' });
                    res.send(`<script>
                        window.opener.postMessage({
                            token: '${token}'
                        }, '${process.env.FRONTEND_BASE_URL}');
                        window.close();
                    </script>`);
                } catch (error) {
                    res.send(`<script>
                        window.opener.postMessage({
                            error: '${(error as Error).message}'
                        }, '${process.env.FRONTEND_BASE_URL}');
                        window.close();
                    </script>`);
                }
                break;
            //oauth login
            default:
                try {
                    const { fp, ip } = customData;
                    const payload = await userService.getTokenData({ user_id: user.id });
                    const access_token = generateJwt(payload);
                    const refreshToken = await userService.createRefreshToken({ ...jsonBase64Decode(fp), user_id: payload.id, request_ip: ip });

                    createRefreshTokenCookie(refreshToken, true, req, res);

                    redirectUrl.searchParams.set('token', access_token);
                    res.redirect(redirectUrl.toString());
                } catch (error) {
                    redirectUrl.searchParams.set('error', error instanceof Error ? error.message : 'Authentication failed');
                    res.redirect(redirectUrl.toString());
                }
        }
    })(req, res, next);
}