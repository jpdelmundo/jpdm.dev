import * as controller from '@/controllers/fileController';
import { verifyToken } from '@/utils/auth';
import { Router } from 'express';
import fs from 'fs';
import multer, { diskStorage } from 'multer';

const destination = String(process.env.UPLOAD_PATH);
if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
}

const upload = multer({
    limits: { fileSize: 10 * 1024 * 1024 }, //10MB
    storage: diskStorage({
        destination,
    }),
    fileFilter(req, file, callback) {
        if (file.mimetype.startsWith('image/')) {
            callback(null, true);
        } else {
            callback(new Error('Invalid file type'));
        }
    }
});

export const router = Router();

//private
router.use(verifyToken);
router.post('/upload', upload.single('file'), controller.upload);