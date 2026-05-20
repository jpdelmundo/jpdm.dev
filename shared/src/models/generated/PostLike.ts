import { z } from 'zod';

/** Identifier type for post_likes */
export type PostLikeId = string & { __flavor?: 'PostLikeId' };

/** Represents the table public.post_likes */
export interface PostLike {
  id: PostLikeId;

  user_id: string;

  post_id: string;

  created_at: Date | null;

  updated_at: Date | null;
}

/** Represents the table public.post_likes */
export interface PostLikeInitializer {
  /** Default value: gen_random_uuid() */
  id?: PostLikeId;

  user_id: string;

  post_id: string;

  /** Default value: now() */
  created_at?: Date | null;

  updated_at?: Date | null;
}

/** Represents the table public.post_likes */
export interface PostLikeMutator {
  id?: PostLikeId;

  user_id?: string;

  post_id?: string;

  created_at?: Date | null;

  updated_at?: Date | null;
}

export const PostLikeIdSchema = z.uuid();

export const PostLikeSchema = z.object({
  id: PostLikeIdSchema,
  user_id: z.uuid(),
  post_id: z.uuid(),
  created_at: z.date().nullable(),
  updated_at: z.date().nullable(),
});

export const PostLikeInitializerSchema = z.object({
  id: PostLikeIdSchema.optional(),
  user_id: z.uuid(),
  post_id: z.uuid(),
  created_at: z.date().optional().nullable(),
  updated_at: z.date().optional().nullable(),
});

export const PostLikeMutatorSchema = z.object({
  id: PostLikeIdSchema.optional(),
  user_id: z.uuid().optional(),
  post_id: z.uuid().optional(),
  created_at: z.date().optional().nullable(),
  updated_at: z.date().optional().nullable(),
});

export const PostLikeColumns = [
  "id",
  "user_id",
  "post_id",
  "created_at",
  "updated_at",
] as const;