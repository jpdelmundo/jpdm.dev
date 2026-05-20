import { z } from 'zod';

/** Identifier type for post_comments */
export type PostCommentId = string & { __flavor?: 'PostCommentId' };

/** Represents the table public.post_comments */
export interface PostComment {
  id: PostCommentId;

  post_id: string;

  user_id: string;

  comment: string;

  created_at: Date;

  updated_at: Date | null;

  status: string;

  moderation_notes: string | null;
}

/** Represents the table public.post_comments */
export interface PostCommentInitializer {
  /** Default value: gen_random_uuid() */
  id?: PostCommentId;

  post_id: string;

  user_id: string;

  comment: string;

  /** Default value: now() */
  created_at?: Date;

  updated_at?: Date | null;

  /** Default value: 'ai_approved'::character varying */
  status?: string;

  moderation_notes?: string | null;
}

/** Represents the table public.post_comments */
export interface PostCommentMutator {
  id?: PostCommentId;

  post_id?: string;

  user_id?: string;

  comment?: string;

  created_at?: Date;

  updated_at?: Date | null;

  status?: string;

  moderation_notes?: string | null;
}

export const PostCommentIdSchema = z.uuid();

export const PostCommentSchema = z.object({
  id: PostCommentIdSchema,
  post_id: z.uuid(),
  user_id: z.uuid(),
  comment: z.string(),
  created_at: z.date(),
  updated_at: z.date().nullable(),
  status: z.string(),
  moderation_notes: z.string().nullable(),
});

export const PostCommentInitializerSchema = z.object({
  id: PostCommentIdSchema.optional(),
  post_id: z.uuid(),
  user_id: z.uuid(),
  comment: z.string(),
  created_at: z.date().optional(),
  updated_at: z.date().optional().nullable(),
  status: z.string().optional(),
  moderation_notes: z.string().optional().nullable(),
});

export const PostCommentMutatorSchema = z.object({
  id: PostCommentIdSchema.optional(),
  post_id: z.uuid().optional(),
  user_id: z.uuid().optional(),
  comment: z.string().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional().nullable(),
  status: z.string().optional(),
  moderation_notes: z.string().optional().nullable(),
});

export const PostCommentColumns = [
  "id",
  "post_id",
  "user_id",
  "comment",
  "created_at",
  "updated_at",
  "status",
  "moderation_notes",
] as const;