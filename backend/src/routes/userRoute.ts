import { Router } from 'express';
import * as controller from '../controllers/userController';

export const router = Router();
router.get('/profile', controller.profile);
router.post('/create', controller.create);
router.post('/email-code', controller.emailCode);
router.post('/email-code-confirm', controller.emailCodeConfirm);