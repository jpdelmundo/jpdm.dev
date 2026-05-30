import { createAdminUsersController } from '@/controllers/adminUsersController.js';
import type { AppContext } from '@/infra/appContext.js';
import { adminRequired, authRequired } from '@/utils/auth.js';
import { Router } from 'express';

export const createAdminUsersRouter = (appCtx: AppContext) => {
    const router = Router();
    const controller = createAdminUsersController(appCtx);

    router.use(authRequired, adminRequired);
    router.get('/', controller.get);
    router.delete('/:id', controller.delete);
    router.delete('/', controller.delete);
    router.put('/:id', controller.update);
    router.put('/', controller.update);
    router.put('/:id/set-temp-password', controller.setTempPassword);

    return router;
}