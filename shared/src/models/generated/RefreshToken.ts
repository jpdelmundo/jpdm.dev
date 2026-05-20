import { z } from 'zod';

/** Identifier type for refresh_tokens */
export type RefreshTokenId = string & { __flavor?: 'RefreshTokenId' };

/** Represents the table public.refresh_tokens */
export interface RefreshToken {
  id: RefreshTokenId;

  device_id: string;

  client_tz: string;

  used_at: Date | null;

  revoked_at: Date | null;

  is_used: boolean;

  is_revoked: boolean;

  created_at: Date;

  updated_at: Date | null;

  user_id: string;

  screen_height: number | null;

  screen_width: number | null;

  cpu_count: number;

  previous_refresh_token_id: string | null;

  request_ip: string | null;

  remember: boolean;
}

/** Represents the table public.refresh_tokens */
export interface RefreshTokenInitializer {
  /** Default value: gen_random_uuid() */
  id?: RefreshTokenId;

  device_id: string;

  client_tz: string;

  used_at?: Date | null;

  revoked_at?: Date | null;

  /** Default value: now() */
  created_at?: Date;

  updated_at?: Date | null;

  user_id: string;

  screen_height?: number | null;

  screen_width?: number | null;

  cpu_count: number;

  previous_refresh_token_id?: string | null;

  request_ip?: string | null;

  /** Default value: false */
  remember?: boolean;
}

/** Represents the table public.refresh_tokens */
export interface RefreshTokenMutator {
  id?: RefreshTokenId;

  device_id?: string;

  client_tz?: string;

  used_at?: Date | null;

  revoked_at?: Date | null;

  created_at?: Date;

  updated_at?: Date | null;

  user_id?: string;

  screen_height?: number | null;

  screen_width?: number | null;

  cpu_count?: number;

  previous_refresh_token_id?: string | null;

  request_ip?: string | null;

  remember?: boolean;
}

export const RefreshTokenIdSchema = z.uuid();

export const RefreshTokenSchema = z.object({
  id: RefreshTokenIdSchema,
  device_id: z.uuid(),
  client_tz: z.string(),
  used_at: z.date().nullable(),
  revoked_at: z.date().nullable(),
  is_used: z.boolean(),
  is_revoked: z.boolean(),
  created_at: z.date(),
  updated_at: z.date().nullable(),
  user_id: z.uuid(),
  screen_height: z.number().nullable(),
  screen_width: z.number().nullable(),
  cpu_count: z.number(),
  previous_refresh_token_id: z.uuid().nullable(),
  request_ip: z.string().nullable(),
  remember: z.boolean(),
});

export const RefreshTokenInitializerSchema = z.object({
  id: RefreshTokenIdSchema.optional(),
  device_id: z.uuid(),
  client_tz: z.string(),
  used_at: z.date().optional().nullable(),
  revoked_at: z.date().optional().nullable(),
  is_used: z.boolean(),
  is_revoked: z.boolean(),
  created_at: z.date().optional(),
  updated_at: z.date().optional().nullable(),
  user_id: z.uuid(),
  screen_height: z.number().optional().nullable(),
  screen_width: z.number().optional().nullable(),
  cpu_count: z.number(),
  previous_refresh_token_id: z.uuid().optional().nullable(),
  request_ip: z.string().optional().nullable(),
  remember: z.boolean().optional(),
});

export const RefreshTokenMutatorSchema = z.object({
  id: RefreshTokenIdSchema.optional(),
  device_id: z.uuid().optional(),
  client_tz: z.string().optional(),
  used_at: z.date().optional().nullable(),
  revoked_at: z.date().optional().nullable(),
  is_used: z.boolean().optional(),
  is_revoked: z.boolean().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional().nullable(),
  user_id: z.uuid().optional(),
  screen_height: z.number().optional().nullable(),
  screen_width: z.number().optional().nullable(),
  cpu_count: z.number().optional(),
  previous_refresh_token_id: z.uuid().optional().nullable(),
  request_ip: z.string().optional().nullable(),
  remember: z.boolean().optional(),
});

export const RefreshTokenColumns = [
  "id",
  "device_id",
  "client_tz",
  "used_at",
  "revoked_at",
  "is_used",
  "is_revoked",
  "created_at",
  "updated_at",
  "user_id",
  "screen_height",
  "screen_width",
  "cpu_count",
  "previous_refresh_token_id",
  "request_ip",
  "remember",
] as const;