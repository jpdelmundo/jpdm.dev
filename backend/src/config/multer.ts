import type { Request } from 'express';
import fs from 'fs';
import multer, { diskStorage } from 'multer';
import os from 'os';
import path from 'path';

type DestinationCallback = (error: Error | null, destination: string) => void;
type FilenameCallback = (error: Error | null, filename: string) => void;

const tmpUploadDir = path.join(os.tmpdir(), 'uploads');

export const uploadHandler = multer({
    limits: { fileSize: 10 * 1024 * 1024 }, //10MB
    storage: diskStorage({
        destination: (req: Request, file: Express.Multer.File, cb: DestinationCallback) => {
            if (!fs.existsSync(tmpUploadDir)) {
                fs.mkdirSync(tmpUploadDir, { recursive: true });
            }
            cb(null, tmpUploadDir);
        },
        filename: (req: Request, file: Express.Multer.File, cb: FilenameCallback) => {
            cb(null, file.originalname);
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