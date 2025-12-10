import { ErrorCode } from '@shared/types/ErrorCode';
import type { TokenUserData } from '@shared/types/Jwt';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { AuthorizedRequest } from 'src/types/AuthorizedRequest';
import { ApiError } from './apiHelper';

const { JsonWebTokenError } = jwt;

export const generateAccessToken = (tokenUserData: TokenUserData) => {
    const accessSecret = process.env.JWT_ACCESS_SECRET;
    if (!accessSecret) {
        throw new Error('JWT_ACCESS_SECRET environment variable is not set');
    }
    return jwt.sign(tokenUserData, accessSecret, { expiresIn: '15m' });
}

export const createRefreshTokenId = () => {
    return crypto.randomUUID();
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new ApiError('Unauthorized request', 401, ErrorCode.AUTH_HEADER_MISSING);

    const token = authHeader.split(' ')[1];
    if (!token) throw new ApiError('Invalid authorization', 401, ErrorCode.AUTH_HEADER_INVALID);

    try {
        const user = getCurrentUser(req);
        if (!user) throw new JsonWebTokenError('Cannot identify user from token');
        const authReq = (req as AuthorizedRequest);
        authReq.user = user;
        next();
    } catch (err) {
        if (err instanceof ApiError) throw err;
    }
}

export const getCurrentUser = (req: Request) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;
    const token = authHeader.split(' ')[1];
    if (!token) return null;
    const accessSecret = process.env.JWT_ACCESS_SECRET;
    if (!accessSecret) throw new Error('JWT_ACCESS_SECRET environment variable is not set');
    try {
        const decoded = jwt.verify(token, accessSecret) as TokenUserData;
        //console.log({ decoded });
        if (!decoded.id) return null;
        return decoded;
    } catch (err) {
        const e = err as Error;
        if (e.name == 'TokenExpiredError') {
            throw new ApiError('Expired token', 401, ErrorCode.TOKEN_EXPIRED);
        } else if (e.name == 'JsonWebTokenError' || e.name == 'NotBeforeError') {
            throw new ApiError(e.message, 401, ErrorCode.TOKEN_INVALID);
        }
        return null;
    }
}