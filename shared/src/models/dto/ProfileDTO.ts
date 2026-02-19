import { type UserProfile } from "../generated/UserProfile.js";

export interface UserProfileDTO extends UserProfile {
    avatar_signed_url: string | null;
}