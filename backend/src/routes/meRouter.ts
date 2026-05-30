import { createMeController } from '@/controllers/meController.js';
import { createPostCommentController } from '@/controllers/postCommentController.js';
import { createPostController } from '@/controllers/postController.js';
import type { AppContext } from '@/infra/appContext.js';
import { authRequired } from '@/utils/auth.js';
import { Router } from 'express';

export const createMeRouter = (appCtx: AppContext) => {
    const router = Router();

    const meController = createMeController(appCtx);
    const postCommentController = createPostCommentController(appCtx);
    const postController = createPostController(appCtx);

    //stats
    router.use(authRequired);
    router.get('/stats', meController.getStats);

    //posts
    router.get('/posts', postController.getMyPosts);

    //comments
    router.get('/comments', postCommentController.getMyComments);
    router.put('/comments/:id', postCommentController.update);
    router.delete('/comments/:id', postCommentController.delete);

    return router;
}