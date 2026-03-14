import { uploadHandler } from '@/config/multer.js';
import { createUserProfileController } from '@/controllers/userProfileController.js';
import type { AppContext } from '@/infra/appContext.js';
import { authRequired } from '@/utils/auth.js';
import { Router } from 'express';

export const createUserProfileRouter = (app: AppContext) => {
    const router = Router();
    const controller = createUserProfileController(app);

    //private
    router.use(authRequired);
    router.get('/:id', controller.get);
    router.post('/:id/avatar', uploadHandler.single('file'), controller.uploadAvatar);
    router.delete('/:id/avatar', controller.deleteAvatar);
    router.put('/:id', controller.update);

    return router;
};