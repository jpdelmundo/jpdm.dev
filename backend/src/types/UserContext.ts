import type { UserId } from "@shared/models/generated/User";

export interface UserContext {
    current_user_id: UserId;
    //add role in the future
}