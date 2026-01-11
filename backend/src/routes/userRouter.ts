import { verifyToken } from '@/utils/auth';
import { Router } from 'express';
import * as controller from '../controllers/userController';

export const router = Router();

//public
router.get('/:id/posts', controller.posts); //:id = id or vanity_id
router.get('/reset-password', controller.isResetPasswordTokenHashValid);

router.post('/', controller.create);
router.post('/recover-account', controller.recoverAccount);
router.post('/reset-password', controller.resetPassword);

//private
router.use(verifyToken);
router.get('/me', controller.me);
router.get('/profile', controller.profile);

router.post('/email-code', controller.emailCode);
router.post('/email-code-confirm', controller.emailCodeConfirm);

router.put('/:id', controller.update);
router.delete('/:id', controller.del);