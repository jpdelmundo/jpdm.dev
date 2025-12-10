import { verifyToken } from '@/utils/auth';
import { Router } from 'express';
import * as controller from '../controllers/postController';

export const router = Router();
router.get('/:id', controller.get);
router.post('/:id/log-view', controller.logView);
//router.get('/:id/comments', controller.getComments);

//private
router.use(verifyToken);
router.post('/', controller.create);
router.post('/:id/like', controller.like);
router.post('/:id/unlike', controller.unlike);
//router.post('/:id/comments', controller.createComment);
// router.post('/email-code', controller.emailCode);
// router.post('/email-code-confirm', controller.emailCodeConfirm);