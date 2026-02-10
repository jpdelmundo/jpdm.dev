import { Router } from 'express';
import { createAppContext } from './infra/appContext.js';
import { pool } from './infra/db.js';
import { router as authRouter } from './routes/authRouter.js';
import { router as commentRouter } from './routes/commentRouter.js';
import { router as fileRouter } from './routes/fileRouter.js';
import { router as imageRouter } from './routes/imageRouter.js';
import { createPostRouter } from './routes/postRouter.js';
import { router as profileRouter } from './routes/userProfileRouter.js';
import { router as userRouter } from './routes/userRouter.js';

const appCtx = createAppContext(pool);
const router = Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/files', fileRouter);
router.use('/posts', createPostRouter(appCtx));
router.use('/comments', commentRouter);
router.use('/images', imageRouter);
router.use('/profile', profileRouter);

export default router;