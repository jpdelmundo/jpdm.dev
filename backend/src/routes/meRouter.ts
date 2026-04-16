import { createMeController } from '@/controllers/meController.js';
import type { AppContext } from '@/infra/appContext.js';
import { authRequired } from '@/utils/auth.js';
import { Router } from 'express';

export const createMeRouter = (appCtx: AppContext) => {
    const router = Router();

    const controller = createMeController(appCtx);

    //private
    router.use(authRequired);
    router.get('/comments', controller.get);
    router.get('/stats', controller.getStats);
    //router.get('/post-views', controller.getPostViews);
    router.put('/comments/:id', controller.update);
    router.delete('/comments/:id', controller.delete);
    // router.post('/', controller.create);
    // router.post('/:id/like', controller.like);
    // router.post('/:id/unlike', controller.unlike);
    // router.post('/:id/image', controller.uploadImage);
    // router.delete('/:id', controller.del);
    // router.put('/:id', controller.update);

    return router;
}