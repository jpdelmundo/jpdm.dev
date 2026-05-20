import { z } from 'zod';

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

export const FileIdSchema = z.uuid();

export const FileSchema = z.object({
  id: FileIdSchema,
  post_id: z.uuid().nullable(),
  filename: z.string(),
  path: z.string(),
  mime_type: z.string(),
  size: z.number(),
  is_public: z.boolean(),
  created_at: z.date(),
  updated_at: z.date().nullable(),
  orig_filename: z.string(),
  expires_at: z.date().nullable(),
  user_id: z.uuid(),
  width: z.number().nullable(),
  height: z.number().nullable(),
});

export const FileInitializerSchema = z.object({
  id: FileIdSchema.optional(),
  post_id: z.uuid().optional().nullable(),
  filename: z.string(),
  path: z.string(),
  mime_type: z.string(),
  size: z.number(),
  is_public: z.boolean().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional().nullable(),
  orig_filename: z.string(),
  expires_at: z.date().optional().nullable(),
  user_id: z.uuid(),
  width: z.number().optional().nullable(),
  height: z.number().optional().nullable(),
});

export const FileMutatorSchema = z.object({
  id: FileIdSchema.optional(),
  post_id: z.uuid().optional().nullable(),
  filename: z.string().optional(),
  path: z.string().optional(),
  mime_type: z.string().optional(),
  size: z.number().optional(),
  is_public: z.boolean().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional().nullable(),
  orig_filename: z.string().optional(),
  expires_at: z.date().optional().nullable(),
  user_id: z.uuid().optional(),
  width: z.number().optional().nullable(),
  height: z.number().optional().nullable(),
});

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