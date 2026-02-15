import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';

const envPath = fileURLToPath(new URL('../../.env', import.meta.url));
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

if (!process.env.JWT_ACCESS_SECRET) throw new Error('JWT_ACCESS_SECRET environment variable is not set');
if (!process.env.USERCONTENT_DIR) throw new Error('USERCONTENT_DIR environment variable is not set');
if (!process.env.USERCONTENT_BASE_URL) throw new Error('USERCONTENT_BASE_URL environment variable is not set');
if (!process.env.CORS_ORIGINS) throw new Error('CORS_ORIGINS environment variable is not set');
if (!process.env.SIGNED_URL_SECRET) throw new Error('SIGNED_URL_SECRET environment variable is not set');