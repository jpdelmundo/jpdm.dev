import { uploadHandler } from '@/config/multer.js';
import * as fileController from '@/controllers/fileController.js';
import { authRequired } from '@/utils/auth.js';
import { Router } from 'express';

export const router = Router();

//private
router.use(authRequired);
router.post('/image', uploadHandler.single('file'), fileController.uploadImage);