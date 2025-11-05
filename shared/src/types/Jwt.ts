import type User from '../models/generated/User';
import type UserRoleEnum from '../models/generated/UserRoleEnum';

export type TokenUserData = Pick<User, 'id' | 'username' | 'email'> & { roles: UserRoleEnum[]; };

export interface Jwt extends TokenUserData {
    exp: number;
    iat: number;
}