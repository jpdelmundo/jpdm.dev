import { createUserController } from '@/controllers/userController.js';
import type { AppContext } from '@/infra/appContext.js';
import { authRequired } from '@/utils/auth.js';
import { Router } from 'express';

export const createUserRouter = (appCtx: AppContext) => {
    const router = Router();
    const controller = createUserController(appCtx);

    //public
    router.get('/:id/posts', controller.posts); //:id = id or vanity_id
    router.get('/reset-password', controller.isResetPasswordTokenHashValid);

    router.post('/', controller.create);
    router.post('/recover-account', controller.recoverAccount);
    router.post('/reset-password', controller.resetPassword);

    //private
    router.use(authRequired);
    router.get('/me', controller.me);
    router.get('/profile', controller.profile);

    router.post('/email-code', controller.emailCode);
    router.post('/email-code-confirm', controller.emailCodeConfirm);

    router.put('/:id', controller.update);
    router.delete('/:id', controller.del);

    return router;
}