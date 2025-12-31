import type { RefreshToken } from '@shared/models/generated/RefreshToken';
import type { Request, Response } from 'express';

export const createRefreshTokenCookie = (refreshToken: RefreshToken, remember: boolean, req: Request, res: Response) => {
    const apiBasePath = process.env.API_BASE_PATH;
    if (!apiBasePath) throw new Error('API_BASE_PATH environment variable is missing');

    res.cookie('refresh_token_id', refreshToken.id, {
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        path: `${apiBasePath}/auth/refresh-token`,
        maxAge: remember ? 60 * 60 * 24 * 30 * 1000 : undefined
    });
}

export const clearRefreshTokenCookie = (req: Request, res: Response) => {
    const apiBasePath = process.env.API_BASE_PATH;
    if (!apiBasePath) throw new Error('API_BASE_PATH environment variable is missing');

    res.clearCookie('refresh_token_id', {
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        path: `${apiBasePath}/auth/refresh-token`,
        maxAge: -60 * 60 * 24 * 30 * 1000
    });
}