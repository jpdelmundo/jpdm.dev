import { createPostCommentController } from '@/controllers/postCommentController.js';
import { createPostController } from '@/controllers/postController.js';
import type { AppContext } from '@/infra/appContext.js';
import { authRequired } from '@/utils/auth.js';
import { Router } from 'express';

export const createPostRouter = (appCtx: AppContext) => {
    const router = Router();
    const postController = createPostController(appCtx);
    const postCommentController = createPostCommentController(appCtx);

    //opengraph handler
    router.get('/og/image/:id', postController.getOGImage);
    router.get('/og/:id{/:slug}', postController.getOG);

    //post comments
    router.post('/:id/comments', authRequired, postCommentController.create);
    router.get('/:id/comments', postCommentController.getPostComments);

    //misc
    router.get('/:id{/:slug}', postController.getPost);
    router.post('/:id/log-view', postController.logView);

    //private
    router.use(authRequired);
    router.post('/', postController.create);
    router.post('/:id/like', postController.like);
    router.post('/:id/unlike', postController.unlike);
    router.post('/:id/image', postController.uploadImage);
    router.delete('/:id', postController.delete);
    router.put('/:id', postController.update);

    // router.post('/email-code', controller.emailCode);
    // router.post('/email-code-confirm', controller.emailCodeConfirm);

    return router;
}