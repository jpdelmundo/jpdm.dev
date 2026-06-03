import path from "path";

export const ROOT_DIR = path.resolve(import.meta.dirname, '../../');
export const USERCONTENT_DIR = path.resolve(ROOT_DIR, process.env.USERCONTENT_DIR ?? 'usercontent');
export const USERCONTENT_DIR_BASENAME = path.basename(USERCONTENT_DIR);
export const POST_ALLOWED_USER = process.env.POST_ALLOWED_USER ?? null;
export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? 'pleasesetmeinenvfile';
export const SIGNED_URL_SECRET = process.env.SIGNED_URL_SECRET ?? 'pleasesetmeinenvfile';
export const HOME_PAGE_USER = process.env.HOME_PAGE_USER ?? 'admin';
export const FRONTEND_BASE_URL = process.env.HOME_PAGE_USER ?? 'admin';