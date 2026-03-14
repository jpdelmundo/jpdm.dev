import type { AppContext } from '@/infra/appContext.js';
import { createAuthController } from '@/controllers/authController.js';
import { authRequired } from '@/utils/auth.js';
import { Router } from 'express';

export const createAuthRouter = (app: AppContext) => {
    const router = Router();
    const controller = createAuthController(app);

    //public
    router.post('/signin', controller.signIn);
    router.post('/refresh-token', controller.refreshToken);

    //passport
    router.get('/google', controller.googleAuth);
    router.get('/google/callback', controller.googleAuthCallback);
    router.get('/facebook', controller.facebookAuth);
    router.get('/facebook/callback', controller.facebookAuthCallback);

    //private
    router.post('/signout', authRequired, controller.signOut);

    return router;
};