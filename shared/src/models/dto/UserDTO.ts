import { type User } from '../generated/User.js';
import { type UserProfile } from '../generated/UserProfile.js';

export interface UserDTO extends Pick<User, 'id' | 'username' | 'email' | 'created_at' | 'deleted' | 'deleted_at' | 'email_confirmed'> {
    profile: Omit<UserProfile, 'user_id'> | null;
    social_login: 'facebook' | 'google' | null;
}