import { Router } from 'express';
import { createAppContext } from './infra/appContext.js';
import { pool } from './infra/db.js';
import { createAuthRouter } from './routes/authRouter.js';
import { createPostCommentRouter } from './routes/postCommentRouter.js';
import { createFileRouter } from './routes/fileRouter.js';
import { createPostImageRouter } from './routes/postImageRouter.js';
import { createMeRouter } from './routes/meRouter.js';
import { createPostRouter } from './routes/postRouter.js';
import { createUserProfileRouter } from './routes/userProfileRouter.js';
import { createUserRouter } from './routes/userRouter.js';

const appCtx = createAppContext(pool);
const router = Router();

router.use('/auth', createAuthRouter(appCtx));
router.use('/users', createUserRouter(appCtx));
router.use('/files', createFileRouter(appCtx));
router.use('/posts', createPostRouter(appCtx));
router.use('/me', createMeRouter(appCtx));
router.use('/comments', createPostCommentRouter(appCtx));
router.use('/images', createPostImageRouter(appCtx));
router.use('/profile', createUserProfileRouter(appCtx));

export default router;