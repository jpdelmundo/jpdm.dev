import { uploadHandler } from '@/config/multer.js';
import { createFileController } from '@/controllers/fileController.js';
import type { AppContext } from '@/infra/appContext.js';
import { authRequired } from '@/utils/auth.js';
import { Router } from 'express';

export const createFileRouter = (app: AppContext) => {
    const router = Router();
    const controller = createFileController(app);

    //private
    router.use(authRequired);
    router.post('/image', uploadHandler.single('file'), controller.uploadImage);

    return router;
};