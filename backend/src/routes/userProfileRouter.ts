import { uploadHandler } from '@/config/multer';
import * as controller from '@/controllers/userProfileController';
import { verifyToken } from '@/utils/auth';
import { Router } from 'express';

export const router = Router();

//private
router.use(verifyToken);
router.get('/:id', controller.get);
router.post('/:id/avatar', uploadHandler.single('file'), controller.uploadAvatar);
router.delete('/:id/avatar', controller.deleteAvatar);
router.put('/:id', controller.update);
// router.delete('/:id', controller.del);