import type { UserIdentity } from '@shared/types/User';
import type { Request } from 'express';

export interface AuthorizedRequest extends Request {
    user: UserIdentity;
}