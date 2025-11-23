import { Router, type NextFunction, type Request, type Response } from 'express';
import { router as authRouter } from './routes/authRouter';
import { router as fileRouter } from './routes/fileRouter';
import { router as postRouter } from './routes/postRouter';
import { router as userRouter } from './routes/userRouter';
import { verifyToken } from './utils/auth';

const router = Router();

router.use((req: Request, res: Response, next: NextFunction) => {
    const publicRoutes = [
        /^\/auth/, //authentication
        /^\/user\/create/, //user registration
        /^\/user\/[^/]+\/posts$/, //user posts (/user/jp/posts or /user/<uuidv4>/posts)
    ];
    if (publicRoutes.some(r => r.test(req.path))) return next();
    verifyToken(req, res, next);
});

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/file', fileRouter);
router.use('/post', postRouter);

export default router;