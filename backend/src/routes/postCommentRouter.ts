import { createPostCommentController } from '@/controllers/postCommentController.js';
import type { AppContext } from '@/infra/appContext.js';
import { apiRateLimit } from '@/middleware/apiRateLimit.js';
import { authRequired } from '@/utils/auth.js';
import { Router } from 'express';

export const createPostCommentRouter = (appCtx: AppContext) => {
    const router = Router();
    const controller = createPostCommentController(appCtx);

    //router.get('/get', controller.get);
    router.get('/', controller.get);
    router.get('/:id', controller.get);

    //private
    router.use(authRequired);
    router.post('/', apiRateLimit(60, 10, (req) => req.body.post_id), controller.create);
    router.put('/:id', apiRateLimit(60, 20, (req) => req.body.post_id), controller.update);
    router.delete('/:id', apiRateLimit(60, 20), controller.delete);
    // router.post('/email-code', controller.emailCode);
    // router.post('/email-code-confirm', controller.emailCodeConfirm);

    return router;
}