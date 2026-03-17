import { createPostController } from '@/controllers/postController.js';
import type { AppContext } from '@/infra/appContext.js';
import { authRequired } from '@/utils/auth.js';
import { Router } from 'express';

export const createPostRouter = (appCtx: AppContext) => {
    const router = Router();
    const controller = createPostController(appCtx);

    router.get('/og/image/:id', controller.getOGImage);
    router.get('/og/:id', controller.getOG);
    router.get('/:id', controller.get);
    router.post('/:id/log-view', controller.logView);
    //router.get('/:id/comments', controller.getComments);

    //private
    router.use(authRequired);
    router.post('/', controller.create);
    router.post('/:id/like', controller.like);
    router.post('/:id/unlike', controller.unlike);
    router.post('/:id/image', controller.uploadImage);
    router.delete('/:id', controller.del);
    router.put('/:id', controller.update);
    //router.post('/:id/comments', controller.createComment);
    // router.post('/email-code', controller.emailCode);
    // router.post('/email-code-confirm', controller.emailCodeConfirm);

    return router;
}