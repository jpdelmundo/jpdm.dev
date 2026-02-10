import type { UserId } from "@shared/models/generated/User.js";

export interface UserContext {
    current_user_id: UserId;
    //add role in the future
}