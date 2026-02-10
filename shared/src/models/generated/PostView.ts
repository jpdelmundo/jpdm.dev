/** Identifier type for post_views */
export type PostViewId = string & { __flavor?: 'PostViewId' };

/** Represents the table public.post_views */
export interface PostView {
  id: PostViewId;

  post_id: string;

  user_id: string | null;

  device_id: string | null;

  tz: string | null;

  screen_height: number | null;

  screen_width: number | null;

  cpu_count: number | null;

  referrer: string | null;

  client: string | null;

  ip: string | null;

  os: string | null;

  device_type: string | null;

  created_at: Date;

  country: string | null;

  city: string | null;

  device: string | null;
}

/** Represents the table public.post_views */
export interface PostViewInitializer {
  /** Default value: gen_random_uuid() */
  id?: PostViewId;

  post_id: string;

  user_id?: string | null;

  device_id?: string | null;

  tz?: string | null;

  screen_height?: number | null;

  screen_width?: number | null;

  cpu_count?: number | null;

  referrer?: string | null;

  client?: string | null;

  ip?: string | null;

  os?: string | null;

  device_type?: string | null;

  /** Default value: now() */
  created_at?: Date;

  country?: string | null;

  city?: string | null;

  device?: string | null;
}

/** Represents the table public.post_views */
export interface PostViewMutator {
  id?: PostViewId;

  post_id?: string;

  user_id?: string | null;

  device_id?: string | null;

  tz?: string | null;

  screen_height?: number | null;

  screen_width?: number | null;

  cpu_count?: number | null;

  referrer?: string | null;

  client?: string | null;

  ip?: string | null;

  os?: string | null;

  device_type?: string | null;

  created_at?: Date;

  country?: string | null;

  city?: string | null;

  device?: string | null;
}

export const PostViewColumns = [
  "id",
  "post_id",
  "user_id",
  "device_id",
  "tz",
  "screen_height",
  "screen_width",
  "cpu_count",
  "referrer",
  "client",
  "ip",
  "os",
  "device_type",
  "created_at",
  "country",
  "city",
  "device",
] as const;