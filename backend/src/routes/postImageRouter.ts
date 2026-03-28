import { createPostImageController } from '@/controllers/postImageController.js';
import type { AppContext } from '@/infra/appContext.js';
import { Router } from 'express';

export const createPostImageRouter = (appCtx: AppContext) => {
    const router = Router();
    const controller = createPostImageController(appCtx);

    router.get('/:id', controller.get);

    //private
    //router.use(verifyToken);
    // router.post('/create', controller.create);
    // router.post('/:id/comments', controller.createComment);
    // router.post('/email-code', controller.emailCode);
    // router.post('/email-code-confirm', controller.emailCodeConfirm);

    return router;
}