import { HttpError } from '@/errors/HttpError.js';
import { pool } from '@/infra/db.js';
import { makeDeps } from '@/infra/makeDeps.js';
import type { ServiceContext } from '@/infra/serviceContext.js';
import { createUserService } from '@/services/userService.js';
import type { AuthorizedRequest } from '@/types/AuthorizedRequest.js';
import type { Actor } from '@shared/types/Actor.js';
import { ErrorCode } from '@shared/types/ErrorCode.js';
import type { Jwt, PayloadData } from '@shared/types/Jwt.js';
import type { UserIdentity } from '@shared/types/UserIdentity.js';
import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import path from 'path';
import { ApiError } from './apiHelper.js';

const { JsonWebTokenError } = jwt;

// Create system context for auth middleware
const systemContext: ServiceContext = {
    deps: makeDeps(pool),
    actor: { type: 'system' }
};

export const currentUser = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    const anonUser: UserIdentity = { type: 'anonymous', id: '', username: 'anonymous', email: '', roles: [] };

    if (!token) {
        req.user = anonUser;
        return next();
    }

    try {
        const payload = getJwtPayload(req);
        if (!payload) throw new JsonWebTokenError('Problem decoding payload');
        const user = await createUserService(systemContext).findById(payload.id);

        req.user = user
            ? {
                type: 'user',
                id: payload.id,
                email: payload.email,
                username: payload.username,
                roles: payload.roles
            } as UserIdentity
            : anonUser;
    } catch (err) {
        req.user = anonUser;
    }

    next();
}

export const generateJwt = (payload: PayloadData) => {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, { expiresIn: '15m' });
}

export const authRequired = async (req: Request, res: Response, next: NextFunction) => {
    const authUser = req.user;
    if (!authUser) throw new Error('Unauthorized request');

    const payload = getJwtPayload(req);
    if (!payload) throw new JsonWebTokenError('Problem decoding payload');

    const user = await createUserService(systemContext).findById(authUser.id);
    if (!user) throw new Error('Cannot find user using payload data');

    //check if password changed, consider jwt invalid (use redis if it becomes a performance issue)
    if (user.password_updated_at && (payload.iat * 1000) < user.password_updated_at.getTime()) throw new ApiError('Invalid token. User has change password.', 401, ErrorCode.TOKEN_INVALID);

    next();
}

export const getJwtPayload = (req: Request) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;
    const token = authHeader.split(' ')[1];
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as Jwt;
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

export const getCurrentUser = (req: Request) => {
    return (req as AuthorizedRequest).user;
}

export const getActor = (req: Request) => {
    const payload = getJwtPayload(req);
    return payload ? {
        type: 'user',
        id: payload?.id,
        roles: payload?.roles
    } as Actor : null;
}

export const verifySignedUrl = (req: Request, res: Response, next: NextFunction) => {
    const { expires, signature } = req.query;
    const fullPath = path.posix.join(req.baseUrl, req.path);

    if (!expires || !signature) throw new HttpError(401, 'Unauthorized request');
    if (Math.floor(Date.now() / 1000) > Number(expires)) throw new HttpError(403, 'Invalid or expired URL');

    const expected = sign(`${fullPath}:${expires}`);
    if (!crypto.timingSafeEqual(Buffer.from(String(signature)), Buffer.from(expected))) throw new HttpError(403, 'Invalid or expired URL');

    next();
}

export const sign = (data: string) => {
    return crypto.createHmac('sha256', process.env.SIGNED_URL_SECRET!).update(data).digest('hex');
}