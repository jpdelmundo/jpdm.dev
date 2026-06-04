// Centralized config with sensible defaults so .env is not required.
// To customize, copy .env.example to .env and set VITE_* variables.

export const VITE_API_BASE_PATH = import.meta.env.VITE_API_BASE_PATH || '/api';
export const VITE_AUTH_SECURE_MODE = import.meta.env.VITE_AUTH_SECURE_MODE || 'true';
export const VITE_GA_ID = import.meta.env.VITE_GA_ID || '';
export const VITE_RECAPTCHAV3_SITE_KEY = import.meta.env.VITE_RECAPTCHAV3_SITE_KEY || '';