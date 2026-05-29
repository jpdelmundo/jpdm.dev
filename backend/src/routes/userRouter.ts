import { createPostController } from '@/controllers/postController.js';
import { createUserController } from '@/controllers/userController.js';
import type { AppContext } from '@/infra/appContext.js';
import { apiRateLimit } from '@/middleware/apiRateLimit.js';
import { adminRequired, authRequired } from '@/utils/auth.js';
import { Router } from 'express';

export const createUserRouter = (appCtx: AppContext) => {
    const router = Router();
    const controller = createUserController(appCtx);
    const postController = createPostController(appCtx);

    //public
    router.get('/:id/posts', postController.getUserPublished); //:id = id or vanity_id
    router.get('/reset-password', controller.isResetPasswordTokenHashValid);

    router.post('/', controller.create);
    router.post('/recover-account', controller.recoverAccount);
    router.post('/reset-password', controller.resetPassword);

    //private
    router.use(authRequired);
    router.get('/', adminRequired, controller.get);
    router.get('/me', controller.me);
    router.get('/profile', controller.profile);

    router.post('/email-code', apiRateLimit(60, 10), controller.emailCode);
    router.post('/email-code-confirm', apiRateLimit(60, 10), controller.emailCodeConfirm);
    router.post('/:id/set-temp-password', adminRequired, controller.setTempPassword);

    router.put('/:id/update-password', controller.updatePassword);
    router.put('/:id', controller.update);
    router.put('/', adminRequired, controller.update);
    router.delete('/:id', controller.delete);
    router.delete('/', adminRequired, controller.delete);

    return router;
}