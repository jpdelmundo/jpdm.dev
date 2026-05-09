import type { RefreshToken } from '@shared/models/generated/RefreshToken.js';
import type { Request, Response } from 'express';

export const createRefreshTokenCookie = (refreshToken: RefreshToken, remember: boolean, req: Request, res: Response) => {
    const basePath = res.locals.apiBasePath;
    res.cookie('refresh_token_id', refreshToken.id, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: `${basePath}/auth/refresh-token`,
        maxAge: remember ? 60 * 60 * 24 * 30 * 1000 : undefined
    });
}

export const clearRefreshTokenCookie = (req: Request, res: Response) => {
    const basePath = res.locals.apiBasePath;
    res.clearCookie('refresh_token_id', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: `${basePath}/auth/refresh-token`,
        maxAge: -60 * 60 * 24 * 30 * 1000
    });
}