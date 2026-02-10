import type { RefreshToken } from '@shared/models/generated/RefreshToken.js';
import type { Request, Response } from 'express';

const getBasePath = (req: Request) => {
    let basePath = '';
    const origUrl = req.originalUrl;
    const authIndex = origUrl.indexOf('/auth/');
    if (authIndex !== -1) {
        basePath = origUrl.substring(0, authIndex);
        if (basePath && !basePath.startsWith('/')) {
            basePath = `/${basePath}`;
        }
    }
    return basePath;
}

export const createRefreshTokenCookie = (refreshToken: RefreshToken, remember: boolean, req: Request, res: Response) => {
    const basePath = getBasePath(req);
    res.cookie('refresh_token_id', refreshToken.id, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: `${basePath}/auth/refresh-token`,
        maxAge: remember ? 60 * 60 * 24 * 30 * 1000 : undefined
    });
}

export const clearRefreshTokenCookie = (req: Request, res: Response) => {
    const basePath = getBasePath(req);
    res.clearCookie('refresh_token_id', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: `${basePath}/auth/refresh-token`,
        maxAge: -60 * 60 * 24 * 30 * 1000
    });
}