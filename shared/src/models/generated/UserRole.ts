import { z } from 'zod';

/** Identifier type for user_roles */
export type UserRoleId = string & { __flavor?: 'UserRoleId' };

/** Represents the table public.user_roles */
export interface UserRole {
  id: UserRoleId;

  user_id: string;

  role: string;
}

/** Represents the table public.user_roles */
export interface UserRoleInitializer {
  /** Default value: gen_random_uuid() */
  id?: UserRoleId;

  user_id: string;

  /** Default value: 'user'::character varying */
  role?: string;
}

/** Represents the table public.user_roles */
export interface UserRoleMutator {
  id?: UserRoleId;

  user_id?: string;

  role?: string;
}

export const UserRoleIdSchema = z.uuid();

export const UserRoleSchema = z.object({
  id: UserRoleIdSchema,
  user_id: z.uuid(),
  role: z.string(),
});

export const UserRoleInitializerSchema = z.object({
  id: UserRoleIdSchema.optional(),
  user_id: z.uuid(),
  role: z.string().optional(),
});

export const UserRoleMutatorSchema = z.object({
  id: UserRoleIdSchema.optional(),
  user_id: z.uuid().optional(),
  role: z.string().optional(),
});

export const UserRoleColumns = [
  "id",
  "user_id",
  "role",
] as const;