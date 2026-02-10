import type { VisibilityEnum } from './VisibilityEnum.js';

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

  visibility: VisibilityEnum;

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

  /** Default value: 'public'::visibility */
  visibility?: VisibilityEnum;

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

  visibility?: VisibilityEnum;

  is_published?: boolean;

  likes?: number;

  views?: number;
}

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