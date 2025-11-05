import { ApiErrorCode } from '@shared/types/ApiResult';
import { Router, type NextFunction, type Request, type Response } from 'express';
import { router as authRoutes } from './routes/authRoute';
import { router as userRoutes } from './routes/userRoute';
import { ApiError, error } from './utils/apiHelper';
import { verifyToken } from './utils/auth';

const route = Router();

route.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/auth') || req.path.startsWith('/user/create')) return next();
    verifyToken(req, res, next);
});

route.use('/auth', authRoutes);
route.use('/user', userRoutes);

route.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Server Error:', err);

    const isApiError = err instanceof ApiError;
    const message = isApiError ? err.message : 'Something went wrong';
    error(res, message, isApiError ? err.code : ApiErrorCode.SERVER_ERROR, isApiError ? err.status : 500);
});

export default route;