import type { User } from '../models/generated/User.js';
import type { UserRole } from './UserRole.js';

export type PayloadData = Pick<User, 'id' | 'username' | 'email'> & { roles: UserRole[]; scope?: string; };

export interface Jwt extends PayloadData {
    exp: number;
    iat: number;
}