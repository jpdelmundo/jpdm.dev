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

export const PostLikeColumns = [
  "id",
  "user_id",
  "post_id",
  "created_at",
  "updated_at",
] as const;