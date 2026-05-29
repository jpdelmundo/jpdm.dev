import { z } from 'zod';

/** Identifier type for users */
export type UserId = string & { __flavor?: 'UserId' };

/** Represents the table public.users */
export interface User {
  id: UserId;

  username: string;

  created_at: Date;

  updated_at: Date | null;

  password: string | null;

  email: string | null;

  email_confirm_code: string | null;

  email_confirmed: boolean | null;

  unconfirmed_email: string | null;

  email_confirm_code_first_sent_at: Date | null;

  email_confirm_code_last_sent_at: Date | null;

  email_confirm_code_num_sent: number;

  vanity_id: string | null;

  google_id: string | null;

  facebook_id: string | null;

  password_updated_at: Date | null;

  deleted: boolean | null;

  deleted_at: Date | null;

  must_change_password: boolean | null;
}

/** Represents the table public.users */
export interface UserInitializer {
  /** Default value: gen_random_uuid() */
  id?: UserId;

  username: string;

  /** Default value: now() */
  created_at?: Date;

  updated_at?: Date | null;

  password?: string | null;

  /** Default value: NULL::character varying */
  email?: string | null;

  /** Default value: NULL::character varying */
  email_confirm_code?: string | null;

  email_confirmed?: boolean | null;

  /** Default value: NULL::character varying */
  unconfirmed_email?: string | null;

  email_confirm_code_first_sent_at?: Date | null;

  email_confirm_code_last_sent_at?: Date | null;

  /** Default value: 0 */
  email_confirm_code_num_sent?: number;

  /** Default value: NULL::character varying */
  vanity_id?: string | null;

  google_id?: string | null;

  facebook_id?: string | null;

  password_updated_at?: Date | null;

  deleted?: boolean | null;

  deleted_at?: Date | null;

  must_change_password?: boolean | null;
}

/** Represents the table public.users */
export interface UserMutator {
  id?: UserId;

  username?: string;

  created_at?: Date;

  updated_at?: Date | null;

  password?: string | null;

  email?: string | null;

  email_confirm_code?: string | null;

  email_confirmed?: boolean | null;

  unconfirmed_email?: string | null;

  email_confirm_code_first_sent_at?: Date | null;

  email_confirm_code_last_sent_at?: Date | null;

  email_confirm_code_num_sent?: number;

  vanity_id?: string | null;

  google_id?: string | null;

  facebook_id?: string | null;

  password_updated_at?: Date | null;

  deleted?: boolean | null;

  deleted_at?: Date | null;

  must_change_password?: boolean | null;
}

export const UserIdSchema = z.uuid();

export const UserSchema = z.object({
  id: UserIdSchema,
  username: z.string(),
  created_at: z.date(),
  updated_at: z.date().nullable(),
  password: z.string().nullable(),
  email: z.string().nullable(),
  email_confirm_code: z.string().nullable(),
  email_confirmed: z.boolean().nullable(),
  unconfirmed_email: z.string().nullable(),
  email_confirm_code_first_sent_at: z.date().nullable(),
  email_confirm_code_last_sent_at: z.date().nullable(),
  email_confirm_code_num_sent: z.number(),
  vanity_id: z.string().nullable(),
  google_id: z.string().nullable(),
  facebook_id: z.string().nullable(),
  password_updated_at: z.date().nullable(),
  deleted: z.boolean().nullable(),
  deleted_at: z.date().nullable(),
  must_change_password: z.boolean().nullable(),
});

export const UserInitializerSchema = z.object({
  id: UserIdSchema.optional(),
  username: z.string(),
  created_at: z.date().optional(),
  updated_at: z.date().optional().nullable(),
  password: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  email_confirm_code: z.string().optional().nullable(),
  email_confirmed: z.boolean().optional().nullable(),
  unconfirmed_email: z.string().optional().nullable(),
  email_confirm_code_first_sent_at: z.date().optional().nullable(),
  email_confirm_code_last_sent_at: z.date().optional().nullable(),
  email_confirm_code_num_sent: z.number().optional(),
  vanity_id: z.string().optional().nullable(),
  google_id: z.string().optional().nullable(),
  facebook_id: z.string().optional().nullable(),
  password_updated_at: z.date().optional().nullable(),
  deleted: z.boolean().optional().nullable(),
  deleted_at: z.date().optional().nullable(),
  must_change_password: z.boolean().optional().nullable(),
});

export const UserMutatorSchema = z.object({
  id: UserIdSchema.optional(),
  username: z.string().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional().nullable(),
  password: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  email_confirm_code: z.string().optional().nullable(),
  email_confirmed: z.boolean().optional().nullable(),
  unconfirmed_email: z.string().optional().nullable(),
  email_confirm_code_first_sent_at: z.date().optional().nullable(),
  email_confirm_code_last_sent_at: z.date().optional().nullable(),
  email_confirm_code_num_sent: z.number().optional(),
  vanity_id: z.string().optional().nullable(),
  google_id: z.string().optional().nullable(),
  facebook_id: z.string().optional().nullable(),
  password_updated_at: z.date().optional().nullable(),
  deleted: z.boolean().optional().nullable(),
  deleted_at: z.date().optional().nullable(),
  must_change_password: z.boolean().optional().nullable(),
});

export const UserColumns = [
  "id",
  "username",
  "created_at",
  "updated_at",
  "password",
  "email",
  "email_confirm_code",
  "email_confirmed",
  "unconfirmed_email",
  "email_confirm_code_first_sent_at",
  "email_confirm_code_last_sent_at",
  "email_confirm_code_num_sent",
  "vanity_id",
  "google_id",
  "facebook_id",
  "password_updated_at",
  "deleted",
  "deleted_at",
  "must_change_password",
] as const;