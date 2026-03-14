import { type UserId } from "../models/generated/User.js";
import { type UserRole } from "./UserRole.js";

export interface UserIdentity {
    type: 'user' | 'anonymous';
    id: UserId | '';
    username: string;
    email: string | null;
    roles: UserRole[];
}