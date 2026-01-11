import { UserId } from "../generated/User";

export interface MeDTO {
    id: UserId;
    username: string;
    created_at: Date;
    updated_at: Date | null;
    has_password: boolean;
    email: string | null;
    password_updated_at: Date | null;
    social_login: 'google' | 'facebook' | null;
}