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
}

/** Represents the table public.post_comments */
export interface PostCommentMutator {
  id?: PostCommentId;

  post_id?: string;

  user_id?: string;

  comment?: string;

  created_at?: Date;

  updated_at?: Date | null;
}

export const PostCommentColumns = [
  "id",
  "post_id",
  "user_id",
  "comment",
  "created_at",
  "updated_at",
] as const;