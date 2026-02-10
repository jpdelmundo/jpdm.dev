/** Identifier type for comments */
export type CommentId = string & { __flavor?: 'CommentId' };

/** Represents the table public.comments */
export interface Comment {
  id: CommentId;

  post_id: string;

  user_id: string;

  comment: string;

  created_at: Date;

  updated_at: Date | null;
}

/** Represents the table public.comments */
export interface CommentInitializer {
  /** Default value: gen_random_uuid() */
  id?: CommentId;

  post_id: string;

  user_id: string;

  comment: string;

  /** Default value: now() */
  created_at?: Date;

  updated_at?: Date | null;
}

/** Represents the table public.comments */
export interface CommentMutator {
  id?: CommentId;

  post_id?: string;

  user_id?: string;

  comment?: string;

  created_at?: Date;

  updated_at?: Date | null;
}

export const CommentColumns = [
  "id",
  "post_id",
  "user_id",
  "comment",
  "created_at",
  "updated_at",
] as const;