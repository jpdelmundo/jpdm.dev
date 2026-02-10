import type { UserRoleEnum } from './UserRoleEnum.js';

/** Identifier type for user_roles */
export type UserRoleId = string & { __flavor?: 'UserRoleId' };

/** Represents the table public.user_roles */
export interface UserRole {
  id: UserRoleId;

  user_id: string;

  role: UserRoleEnum;
}

/** Represents the table public.user_roles */
export interface UserRoleInitializer {
  /** Default value: gen_random_uuid() */
  id?: UserRoleId;

  user_id: string;

  /** Default value: 'user'::user_role */
  role?: UserRoleEnum;
}

/** Represents the table public.user_roles */
export interface UserRoleMutator {
  id?: UserRoleId;

  user_id?: string;

  role?: UserRoleEnum;
}

export const UserRoleColumns = [
  "id",
  "user_id",
  "role",
] as const;