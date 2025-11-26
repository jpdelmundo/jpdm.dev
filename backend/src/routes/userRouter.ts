import { verifyToken } from '@/utils/auth';
import { Router } from 'express';
import * as controller from '../controllers/userController';

export const router = Router();

//public
router.post('/create', controller.create);
router.get('/:id/posts', controller.posts); //:id = id or vanity_id

//private
router.use(verifyToken);
router.get('/profile', controller.profile);
router.post('/email-code', controller.emailCode);
router.post('/email-code-confirm', controller.emailCodeConfirm);