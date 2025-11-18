import * as controller from '@/controllers/fileController';
import { Router } from 'express';
import { fileTypeFromFile } from 'file-type';
import multer from 'multer';

const upload = multer({
    limits: {
        fileSize: 10 * 1024 * 1024, //10MB
    },
    storage: multer.diskStorage({
        destination: (req, file, callback) => {
            callback(null, 'uploads/public');
        },
        filename: async (req, file, callback) => {
            const type = await fileTypeFromFile(file.path);
            if (!type) callback(new Error('Cannot determine file type'), '');

            callback(null, `${file.filename}.${type?.ext}`);
        }
    })
});

export const router = Router();
router.post('/upload', upload.single('file'), controller.upload);