import { Router } from 'express';
import * as controller from '../controllers/imageController';

export const router = Router();
//router.get('/get', controller.get);
router.get('/:id', controller.get);

//private
//router.use(verifyToken);
// router.post('/create', controller.create);
// router.post('/:id/comments', controller.createComment);
// router.post('/email-code', controller.emailCode);
// router.post('/email-code-confirm', controller.emailCodeConfirm);