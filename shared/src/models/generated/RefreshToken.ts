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