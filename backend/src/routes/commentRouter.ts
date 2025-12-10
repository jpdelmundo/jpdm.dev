import { verifyToken } from '@/utils/auth';
import { Router } from 'express';
import * as controller from '../controllers/commentController';

export const router = Router();
//router.get('/get', controller.get);
router.get('/', controller.get);
router.get('/:id', controller.get);

//private
router.use(verifyToken);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.del);
// router.post('/email-code', controller.emailCode);
// router.post('/email-code-confirm', controller.emailCodeConfirm);