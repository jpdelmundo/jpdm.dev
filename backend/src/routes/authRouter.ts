import { verifyToken } from '@/utils/auth.js';
import { Router } from 'express';
import * as controller from '../controllers/authController.js';

export const router = Router()

//public
router.post('/signin', controller.signIn);
router.post('/refresh-token', controller.refreshToken);

//passport
router.get('/google', controller.googleAuth);
router.get('/google/callback', controller.googleAuthCallback);
router.get('/facebook', controller.facebookAuth);
router.get('/facebook/callback', controller.facebookAuthCallback);

//private
router.post('/signout', verifyToken, controller.signOut);