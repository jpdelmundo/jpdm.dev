import type { UserIdentity } from '@shared/types/UserIdentity.js';
import type { Request } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';

export interface AuthorizedRequest<T = ParamsDictionary> extends Request<T> {
    user: UserIdentity;
}