import { verifyToken } from '@/utils/auth';
import { Router } from 'express';
import * as controller from '../controllers/userController';

export const router = Router();

//public
router.post('/create', controller.create);
router.get('/:id/posts', controller.posts); //:id = id or vanity_id
router.post('/recover-account', controller.recoverAccount);
router.get('/reset-password', controller.isResetPasswordTokenHashValid);
router.post('/reset-password', controller.resetPassword);

//private
router.use(verifyToken);
router.get('/profile', controller.profile);
router.post('/email-code', controller.emailCode);
router.post('/email-code-confirm', controller.emailCodeConfirm);