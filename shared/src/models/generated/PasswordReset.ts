import { z } from 'zod';

/** Identifier type for password_reset */
export type PasswordResetId = string & { __flavor?: 'PasswordResetId' };

/** Represents the table public.password_reset */
export interface PasswordReset {
  id: PasswordResetId;

  user_id: string;

  token_hash: string;

  used_at: Date | null;

  expires_at: Date;

  created_at: Date;
}

/** Represents the table public.password_reset */
export interface PasswordResetInitializer {
  /** Default value: gen_random_uuid() */
  id?: PasswordResetId;

  user_id: string;

  token_hash: string;

  used_at?: Date | null;

  /** Default value: (now() + '00:15:00'::interval) */
  expires_at?: Date;

  /** Default value: now() */
  created_at?: Date;
}

/** Represents the table public.password_reset */
export interface PasswordResetMutator {
  id?: PasswordResetId;

  user_id?: string;

  token_hash?: string;

  used_at?: Date | null;

  expires_at?: Date;

  created_at?: Date;
}

export const PasswordResetIdSchema = z.uuid();

export const PasswordResetSchema = z.object({
  id: PasswordResetIdSchema,
  user_id: z.uuid(),
  token_hash: z.string(),
  used_at: z.date().nullable(),
  expires_at: z.date(),
  created_at: z.date(),
});

export const PasswordResetInitializerSchema = z.object({
  id: PasswordResetIdSchema.optional(),
  user_id: z.uuid(),
  token_hash: z.string(),
  used_at: z.date().optional().nullable(),
  expires_at: z.date().optional(),
  created_at: z.date().optional(),
});

export const PasswordResetMutatorSchema = z.object({
  id: PasswordResetIdSchema.optional(),
  user_id: z.uuid().optional(),
  token_hash: z.string().optional(),
  used_at: z.date().optional().nullable(),
  expires_at: z.date().optional(),
  created_at: z.date().optional(),
});

export const PasswordResetColumns = [
  "id",
  "user_id",
  "token_hash",
  "used_at",
  "expires_at",
  "created_at",
] as const;