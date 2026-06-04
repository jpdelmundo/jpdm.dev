import '../env.js';

import path from "path";

export const ROOT_DIR = path.resolve(import.meta.dirname, '../../');
export const USERCONTENT_DIR = path.resolve(ROOT_DIR, process.env.USERCONTENT_DIR || './usercontent');
export const USERCONTENT_DIR_BASENAME = path.basename(USERCONTENT_DIR);

// security
export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'please_change_me_in_env_file';
export const SIGNED_URL_SECRET = process.env.SIGNED_URL_SECRET || 'please_change_me_in_env_file';

// urls
export const APP_URL = process.env.APP_URL || 'http://localhost:8080';
export const BACKEND_PORT = process.env.BACKEND_PORT || '3000';

// database
export const POSTGRES_HOST = process.env.POSTGRES_HOST || 'localhost';
export const POSTGRES_PORT = process.env.POSTGRES_PORT || '5432';
export const POSTGRES_USER = process.env.POSTGRES_USER || 'postgres';
export const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'Postgres1@';
export const POSTGRES_DB = process.env.POSTGRES_DB || 'jpdm';

// features
export const POST_ALLOWED_USER = process.env.POST_ALLOWED_USER || 'admin';
export const HOME_PAGE_USER = process.env.HOME_PAGE_USER || 'admin';

// logging
export const LOG_DIR = process.env.LOG_DIR || './logs';
export const LOG_FILE = process.env.LOG_FILE || 'app.log';
export const DEBUG = process.env.DEBUG;
export const DEBUG_TRACE = process.env.DEBUG_TRACE;
export const LOG_SQL = process.env.LOG_SQL;

// captcha
export const RECAPTCHAV3_SECRET_KEY = process.env.RECAPTCHAV3_SECRET_KEY || null;

// AI moderation
export const LITELLM_API_BASE_URL = process.env.LITELLM_API_BASE_URL;
export const LITELLM_VIRTUAL_KEY = process.env.LITELLM_VIRTUAL_KEY;

// email
export const SMTP_HOST = process.env.SMTP_HOST || null;
export const SMTP_PORT = process.env.SMTP_PORT || null;
export const SMTP_USER = process.env.SMTP_USER || null;
export const SMTP_PASS = process.env.SMTP_PASS || null;
export const SMTP_SECURE = process.env.SMTP_SECURE || 'false';
export const SMTP_SERVER_NAME = process.env.SMTP_SERVER_NAME || null;

// oauth
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || null;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || null;
export const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || null;
export const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || null;

// seeding
export const SEED_USER_USERNAME = process.env.SEED_USER_USERNAME || 'admin';
export const SEED_USER_PASSWORD = process.env.SEED_USER_PASSWORD || 'admin';
