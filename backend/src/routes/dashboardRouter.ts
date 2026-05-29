import { createDashboardController } from '@/controllers/dashboardController.js';
import { createPostCommentController } from '@/controllers/postCommentController.js';
import { createPostController } from '@/controllers/postController.js';
import type { AppContext } from '@/infra/appContext.js';
import { authRequired } from '@/utils/auth.js';
import { Router } from 'express';

export const createDashboardRouter = (appCtx: AppContext) => {
    const router = Router();

    const dashboardController = createDashboardController(appCtx);
    const postCommentController = createPostCommentController(appCtx);
    const postController = createPostController(appCtx);

    //private
    router.use(authRequired);
    router.get('/stats', dashboardController.getStats);

    //posts
    router.get('/posts', postController.get);

    //comments
    router.get('/comments', postCommentController.get);
    router.put('/comments/:id', postCommentController.update);
    router.delete('/comments/:id', postCommentController.delete);

    // router.post('/', controller.create);
    // router.post('/:id/like', controller.like);
    // router.post('/:id/unlike', controller.unlike);
    // router.post('/:id/image', controller.uploadImage);
    // router.delete('/:id', controller.del);
    // router.put('/:id', controller.update);

    return router;
}