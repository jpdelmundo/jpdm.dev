import type { RefreshToken } from '@shared/models/generated/RefreshToken';
import type { Request, Response } from 'express';

export const createRefreshTokenCookie = (refreshToken: RefreshToken, remember: boolean, req: Request, res: Response) => {
    const apiBasePath = process.env.API_BASE_PATH;
    if (!apiBasePath) throw new Error('API_BASE_PATH environment variable is missing');
    const isLocalhost = req.hostname === 'localhost' || req.hostname === '127.0.0.1' || req.hostname === '::1';
    const isProd = process.env.NODE_ENV == 'production';

    res.cookie('refresh_token_id', refreshToken.id, {
        httpOnly: true,
        secure: isProd && !isLocalhost,
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        path: `${apiBasePath}/auth/refresh-token`,
        maxAge: remember ? 60 * 60 * 24 * 30 * 1000 : undefined
    });
}

export const clearRefreshTokenCookie = (req: Request, res: Response) => {
    const apiBasePath = process.env.API_BASE_PATH;
    if (!apiBasePath) throw new Error('API_BASE_PATH environment variable is missing');
    const isLocalhost = req.hostname === 'localhost' || req.hostname === '127.0.0.1' || req.hostname === '::1';
    const isProd = process.env.NODE_ENV == 'production';

    res.clearCookie('refresh_token_id', {
        httpOnly: true,
        secure: isProd && !isLocalhost,
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        path: `${apiBasePath}/auth/refresh-token`,
        maxAge: -60 * 60 * 24 * 30 * 1000
    });
}