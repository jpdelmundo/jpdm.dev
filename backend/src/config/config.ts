import path from "path";

export const ROOT_DIR = path.resolve(import.meta.dirname, '../../');
export const USERCONTENT_DIR = path.resolve(ROOT_DIR, process.env.USERCONTENT_DIR ?? 'usercontent');
export const USERCONTENT_DIR_BASENAME = path.basename(USERCONTENT_DIR);
export const POST_ALLOWED_USER = process.env.POST_ALLOWED_USER ?? null;
export const CORS_ORIGINS = process.env.CORS_ORIGINS ?? '*';