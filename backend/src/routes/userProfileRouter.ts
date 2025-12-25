import * as controller from '@/controllers/userProfileController';
import { verifyToken } from '@/utils/auth';
import { Router } from 'express';

export const router = Router();

//private
router.use(verifyToken);
router.get('/:id', controller.get);
// router.post('/', controller.create);
// router.put('/:id', controller.update);
// router.delete('/:id', controller.del);