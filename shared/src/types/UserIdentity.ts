import { UserId } from "../models/generated/User";
import { UserRoleEnum } from "../models/generated/UserRoleEnum";

export interface UserIdentity {
    id: UserId;
    username: string;
    email: string | null;
    roles: UserRoleEnum[];
    type: 'user'
}