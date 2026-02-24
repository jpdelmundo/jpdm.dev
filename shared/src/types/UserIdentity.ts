import { type UserId } from "../models/generated/User.js";
import { type UserRole } from "./UserRole.js";

export interface UserIdentity {
    type: 'user' | 'anonymous';
    id: UserId | '00000000-0000-0000-0000-000000000000';
    username: string;
    email: string | null;
    roles: UserRole[];
}