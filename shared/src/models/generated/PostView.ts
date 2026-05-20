import { z } from 'zod';

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

export const PostViewIdSchema = z.uuid();

export const PostViewSchema = z.object({
  id: PostViewIdSchema,
  post_id: z.uuid(),
  user_id: z.uuid().nullable(),
  device_id: z.uuid().nullable(),
  tz: z.string().nullable(),
  screen_height: z.number().nullable(),
  screen_width: z.number().nullable(),
  cpu_count: z.number().nullable(),
  referrer: z.string().nullable(),
  client: z.string().nullable(),
  ip: z.string().nullable(),
  os: z.string().nullable(),
  device_type: z.string().nullable(),
  created_at: z.date(),
  country: z.string().nullable(),
  city: z.string().nullable(),
  device: z.string().nullable(),
});

export const PostViewInitializerSchema = z.object({
  id: PostViewIdSchema.optional(),
  post_id: z.uuid(),
  user_id: z.uuid().optional().nullable(),
  device_id: z.uuid().optional().nullable(),
  tz: z.string().optional().nullable(),
  screen_height: z.number().optional().nullable(),
  screen_width: z.number().optional().nullable(),
  cpu_count: z.number().optional().nullable(),
  referrer: z.string().optional().nullable(),
  client: z.string().optional().nullable(),
  ip: z.string().optional().nullable(),
  os: z.string().optional().nullable(),
  device_type: z.string().optional().nullable(),
  created_at: z.date().optional(),
  country: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  device: z.string().optional().nullable(),
});

export const PostViewMutatorSchema = z.object({
  id: PostViewIdSchema.optional(),
  post_id: z.uuid().optional(),
  user_id: z.uuid().optional().nullable(),
  device_id: z.uuid().optional().nullable(),
  tz: z.string().optional().nullable(),
  screen_height: z.number().optional().nullable(),
  screen_width: z.number().optional().nullable(),
  cpu_count: z.number().optional().nullable(),
  referrer: z.string().optional().nullable(),
  client: z.string().optional().nullable(),
  ip: z.string().optional().nullable(),
  os: z.string().optional().nullable(),
  device_type: z.string().optional().nullable(),
  created_at: z.date().optional(),
  country: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  device: z.string().optional().nullable(),
});

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