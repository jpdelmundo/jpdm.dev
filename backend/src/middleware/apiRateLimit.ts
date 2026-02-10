import { getCurrentUser } from '@/utils/auth.js';
import type { Request, Response } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

export const apiRateLimit = (windowSecs: number, maxReq: number, keyPrefixCallback?: (req: Request) => string) => {
    return rateLimit({
        windowMs: windowSecs * 1000,
        max: maxReq,
        standardHeaders: true,
        legacyHeaders: true,
        message: {
            error: 'Too many requests. Please try again later.'
        },
        keyGenerator: (req: Request, res: Response) => {
            const keyPrefix = keyPrefixCallback?.(req) || '';
            const safePrefix = keyPrefix ? `:${keyPrefix}` : '';
            console.log({ keyPrefix });
            const user = getCurrentUser(req);
            if (user.id) return `user_${user.id}${safePrefix}`;
            const ip = req.ip || req.socket.remoteAddress || 'unknown';
            return ipKeyGenerator(`${ip}${safePrefix}`);
        }
    });
}