import { verifyToken } from '@/utils/auth';
import { Router } from 'express';
import * as controller from '../controllers/postController';

export const router = Router();
//router.get('/get', controller.get);
router.get('/images/:id', controller.getImage);

//private
router.use(verifyToken);
router.post('/create', controller.create);
// router.post('/email-code', controller.emailCode);
// router.post('/email-code-confirm', controller.emailCodeConfirm);