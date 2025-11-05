import type { TokenUserData } from '@shared/types/Jwt';
import type { Request } from 'express';

export interface AuthorizedRequest extends Request {
    user: TokenUserData;
}