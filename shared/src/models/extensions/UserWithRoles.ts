import { type UserRole } from "../../types/UserRole.js";
import { type User } from "../generated/User.js";

export default interface UserWithRoles extends User {
    roles: UserRole[];
}