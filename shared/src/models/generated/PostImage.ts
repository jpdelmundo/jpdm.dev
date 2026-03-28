/** Identifier type for post_images */
export type PostImageId = string & { __flavor?: 'PostImageId' };

/** Represents the table public.post_images */
export interface PostImage {
  id: PostImageId;

  post_id: string;

  file_id: string;

  sort: number;

  created_at: Date;

  updated_at: Date | null;
}

/** Represents the table public.post_images */
export interface PostImageInitializer {
  /** Default value: gen_random_uuid() */
  id?: PostImageId;

  post_id: string;

  file_id: string;

  /** Default value: 1 */
  sort?: number;

  /** Default value: now() */
  created_at?: Date;

  updated_at?: Date | null;
}

/** Represents the table public.post_images */
export interface PostImageMutator {
  id?: PostImageId;

  post_id?: string;

  file_id?: string;

  sort?: number;

  created_at?: Date;

  updated_at?: Date | null;
}

export const PostImageColumns = [
  "id",
  "post_id",
  "file_id",
  "sort",
  "created_at",
  "updated_at",
] as const;