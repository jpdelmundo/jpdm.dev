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
}

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
] as const;