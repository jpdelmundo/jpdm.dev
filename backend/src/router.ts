import { Router } from 'express';
import { router as authRouter } from './routes/authRouter';
import { router as fileRouter } from './routes/fileRouter';
import { router as postRouter } from './routes/postRouter';
import { router as userRouter } from './routes/userRouter';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/files', fileRouter);
router.use('/posts', postRouter);

export default router;