import { ApiErrorCode } from '@shared/types/ApiResult';
import { Router, type NextFunction, type Request, type Response } from 'express';
import { router as authRouter } from './routes/authRouter';
import { router as fileRouter } from './routes/fileRouter';
import { router as postRouter } from './routes/postRouter';
import { router as userRouter } from './routes/userRouter';
import { ApiError, error } from './utils/apiHelper';
import { verifyToken } from './utils/auth';

const router = Router();

router.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/auth') || req.path.startsWith('/user/create')) return next();
    verifyToken(req, res, next);
});

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/file', fileRouter);
router.use('/post', postRouter);

router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Server Error:', err);

    const isApiError = err instanceof ApiError;
    const message = isApiError ? err.message : 'Something went wrong';
    error(res, message, isApiError ? err.code : ApiErrorCode.SERVER_ERROR, isApiError ? err.status : 500);
});

export default router;