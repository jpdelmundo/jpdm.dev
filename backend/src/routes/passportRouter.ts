import * as controller from '@/controllers/authController';
import { Router } from "express";

export const router = Router();

router.get('/google', controller.googleAuth);
router.get('/google/callback', controller.googleAuthCallback);
router.get('/facebook', controller.facebookAuth);
router.get('/facebook/callback', controller.facebookAuthCallback);
