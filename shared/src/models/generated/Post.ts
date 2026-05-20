import { z } from 'zod';

/** Identifier type for posts */
export type PostId = string & { __flavor?: 'PostId' };

/** Represents the table public.posts */
export interface Post {
  id: PostId;

  title: string | null;

  content: string;

  created_at: Date;

  updated_at: Date | null;

  user_id: string;

  visibility: string;

  is_published: boolean;

  likes: number;

  views: number;
}

/** Represents the table public.posts */
export interface PostInitializer {
  /** Default value: gen_random_uuid() */
  id?: PostId;

  /** Default value: NULL::character varying */
  title?: string | null;

  content: string;

  /** Default value: now() */
  created_at?: Date;

  updated_at?: Date | null;

  user_id: string;

  /** Default value: 'public'::character varying */
  visibility?: string;

  /** Default value: true */
  is_published?: boolean;

  /** Default value: 0 */
  likes?: number;

  /** Default value: 0 */
  views?: number;
}

/** Represents the table public.posts */
export interface PostMutator {
  id?: PostId;

  title?: string | null;

  content?: string;

  created_at?: Date;

  updated_at?: Date | null;

  user_id?: string;

  visibility?: string;

  is_published?: boolean;

  likes?: number;

  views?: number;
}

export const PostIdSchema = z.uuid();

export const PostSchema = z.object({
  id: PostIdSchema,
  title: z.string().nullable(),
  content: z.string(),
  created_at: z.date(),
  updated_at: z.date().nullable(),
  user_id: z.uuid(),
  visibility: z.string(),
  is_published: z.boolean(),
  likes: z.number(),
  views: z.number(),
});

export const PostInitializerSchema = z.object({
  id: PostIdSchema.optional(),
  title: z.string().optional().nullable(),
  content: z.string(),
  created_at: z.date().optional(),
  updated_at: z.date().optional().nullable(),
  user_id: z.uuid(),
  visibility: z.string().optional(),
  is_published: z.boolean().optional(),
  likes: z.number().optional(),
  views: z.number().optional(),
});

export const PostMutatorSchema = z.object({
  id: PostIdSchema.optional(),
  title: z.string().optional().nullable(),
  content: z.string().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional().nullable(),
  user_id: z.uuid().optional(),
  visibility: z.string().optional(),
  is_published: z.boolean().optional(),
  likes: z.number().optional(),
  views: z.number().optional(),
});

export const PostColumns = [
  "id",
  "title",
  "content",
  "created_at",
  "updated_at",
  "user_id",
  "visibility",
  "is_published",
  "likes",
  "views",
] as const;