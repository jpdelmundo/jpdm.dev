import { uploadHandler } from '@/config/multer';
import * as fileController from '@/controllers/fileController';
import { verifyToken } from '@/utils/auth';
import { Router } from 'express';

export const router = Router();

//private
router.use(verifyToken);
router.post('/image', uploadHandler.single('file'), fileController.uploadImage);