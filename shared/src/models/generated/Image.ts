/** Identifier type for images */
export type ImageId = string & { __flavor?: 'ImageId' };

/** Represents the table public.images */
export interface Image {
  id: ImageId;

  post_id: string;

  file_id: string;

  sort: number;

  created_at: Date;

  updated_at: Date | null;
}

/** Represents the table public.images */
export interface ImageInitializer {
  /** Default value: gen_random_uuid() */
  id?: ImageId;

  post_id: string;

  file_id: string;

  /** Default value: 1 */
  sort?: number;

  /** Default value: now() */
  created_at?: Date;

  updated_at?: Date | null;
}

/** Represents the table public.images */
export interface ImageMutator {
  id?: ImageId;

  post_id?: string;

  file_id?: string;

  sort?: number;

  created_at?: Date;

  updated_at?: Date | null;
}

export const ImageColumns = [
  "id",
  "post_id",
  "file_id",
  "sort",
  "created_at",
  "updated_at",
] as const;