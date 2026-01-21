import dotenv from 'dotenv';
dotenv.config();

if (!process.env.API_BASE_PATH) throw new Error('API_PATH environment variable is not set');
if (!process.env.JWT_ACCESS_SECRET) throw new Error('JWT_ACCESS_SECRET environment variable is not set');
if (!process.env.USERCONTENT_DIR) throw new Error('USERCONTENT_DIR environment variable is not set');
if (!process.env.USERCONTENT_BASE_URL) throw new Error('USERCONTENT_BASE_URL environment variable is not set');