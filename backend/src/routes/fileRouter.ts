import * as controller from '@/controllers/fileController';
import { Router } from 'express';
import multer from 'multer';

const upload = multer({
    dest: 'uploads/public',
    limits: {
        fileSize: 10 * 1024 * 1024, //10MB
    }
});

export const router = Router();
router.post('/upload', upload.single('file'), controller.upload);