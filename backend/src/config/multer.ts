import type { Request } from 'express';
import fs from 'fs';
import multer, { diskStorage } from 'multer';
import os from 'os';
import path from 'path';

const tmpUploadDir = path.join(os.tmpdir(), 'uploads');

export const uploadHandler = multer({
    limits: { fileSize: 10 * 1024 * 1024 }, //10MB
    storage: diskStorage({
        destination: (req: Request, file: Express.Multer.File, cb) => {
            if (!fs.existsSync(tmpUploadDir)) {
                fs.mkdirSync(tmpUploadDir, { recursive: true });
            }
            cb(null, tmpUploadDir);
        },
        filename: (req: Request, file: Express.Multer.File, cb) => {
            const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
            cb(null, filename);
        }
    }),
    fileFilter(req, file, callback) {
        if (file.mimetype.startsWith('image/')) {
            callback(null, true);
        } else {
            callback(new Error('Invalid file type'));
        }
    }
});