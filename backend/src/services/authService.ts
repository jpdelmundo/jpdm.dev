import type RefreshToken from '@shared/models/generated/RefreshToken';
import type { Request, Response } from 'express';

export const createRefreshTokenCookie = (refreshToken: RefreshToken, remember: boolean, req: Request, res: Response) => {
    const apiBasePath = process.env.API_BASE_PATH;
    if (!apiBasePath) throw new Error('API_BASE_PATH environment variable is missing');

    console.log('baseUrl', req.baseUrl);
    res.cookie('refresh_token_id', refreshToken.id, {
        httpOnly: true,
        secure: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        path: `${apiBasePath}/auth/refresh-token`,
        maxAge: remember ? 60 * 60 * 24 * 30 * 1000 : undefined
    });
}