import { Router } from 'express';
import { verifyToken } from 'src/utils/auth';
import * as controller from '../controllers/authController';

export const router = Router()

router.post('/signin', controller.signIn);
router.post('/refresh-token', controller.refreshToken);
router.post('/signout', verifyToken, controller.signOut);