import { Router } from 'express';
import { verifyToken } from 'src/utils/auth';
import * as controller from '../controllers/authController';

export const router = Router()

router.post('/login', controller.login);
router.post('/refresh-token', controller.refreshToken);
router.post('/logout', verifyToken, controller.logout);