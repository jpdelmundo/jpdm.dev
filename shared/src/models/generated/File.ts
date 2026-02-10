/** Identifier type for files */
export type FileId = string & { __flavor?: 'FileId' };

/** Represents the table public.files */
export interface File {
  id: FileId;

  post_id: string | null;

  filename: string;

  path: string;

  mime_type: string;

  size: number;

  is_public: boolean;

  created_at: Date;

  updated_at: Date | null;

  orig_filename: string;

  expires_at: Date | null;

  user_id: string;

  width: number | null;

  height: number | null;
}

/** Represents the table public.files */
export interface FileInitializer {
  /** Default value: gen_random_uuid() */
  id?: FileId;

  post_id?: string | null;

  filename: string;

  path: string;

  mime_type: string;

  size: number;

  /** Default value: true */
  is_public?: boolean;

  /** Default value: now() */
  created_at?: Date;

  updated_at?: Date | null;

  orig_filename: string;

  expires_at?: Date | null;

  user_id: string;

  width?: number | null;

  height?: number | null;
}

/** Represents the table public.files */
export interface FileMutator {
  id?: FileId;

  post_id?: string | null;

  filename?: string;

  path?: string;

  mime_type?: string;

  size?: number;

  is_public?: boolean;

  created_at?: Date;

  updated_at?: Date | null;

  orig_filename?: string;

  expires_at?: Date | null;

  user_id?: string;

  width?: number | null;

  height?: number | null;
}

export const FileColumns = [
  "id",
  "post_id",
  "filename",
  "path",
  "mime_type",
  "size",
  "is_public",
  "created_at",
  "updated_at",
  "orig_filename",
  "expires_at",
  "user_id",
  "width",
  "height",
] as const;