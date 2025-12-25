import { Router } from 'express';
import { router as authRouter } from './routes/authRouter';
import { router as commentRouter } from './routes/commentRouter';
import { router as fileRouter } from './routes/fileRouter';
import { router as imageRouter } from './routes/imageRouter';
import { router as postRouter } from './routes/postRouter';
import { router as profileRouter } from './routes/userProfileRouter';
import { router as userRouter } from './routes/userRouter';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/files', fileRouter);
router.use('/posts', postRouter);
router.use('/comments', commentRouter);
router.use('/images', imageRouter);
router.use('/profile', profileRouter);

export default router;