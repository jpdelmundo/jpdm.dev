import { uploadHandler } from '@/config/multer.js';
import * as fileController from '@/controllers/fileController.js';
import { verifyToken } from '@/utils/auth.js';
import { Router } from 'express';

export const router = Router();

//private
router.use(verifyToken);
router.post('/image', uploadHandler.single('file'), fileController.uploadImage);