import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';

const envPath = fileURLToPath(new URL('../../.env', import.meta.url));
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    console.warn('WARNING: No .env file found. Using built-in defaults.');
    console.warn('Copy .env.example to .env to customize settings.');
}