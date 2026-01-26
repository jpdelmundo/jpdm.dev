import { apiRateLimit } from '@/middleware/apiRateLimit';
import { verifyToken } from '@/utils/auth';
import { Router } from 'express';
import * as controller from '../controllers/commentController';

export const router = Router();
//router.get('/get', controller.get);
router.get('/', controller.get);
router.get('/:id', controller.get);

//private
router.use(verifyToken);
router.post('/', apiRateLimit(60, 10, (req) => req.body.post_id), controller.create);
router.put('/:id', apiRateLimit(60, 20, (req) => req.body.post_id), controller.update);
router.delete('/:id', apiRateLimit(60, 20), controller.del);
// router.post('/email-code', controller.emailCode);
// router.post('/email-code-confirm', controller.emailCodeConfirm);