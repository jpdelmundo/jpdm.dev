import type { User } from '../models/generated/User.js';
import type { UserRoleEnum } from '../models/generated/UserRoleEnum.js';

export type PayloadData = Pick<User, 'id' | 'username' | 'email'> & { roles: UserRoleEnum[]; scope?: string; };

export interface Jwt extends PayloadData {
    exp: number;
    iat: number;
}