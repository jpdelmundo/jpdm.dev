import '@/env';
import { ErrorCode } from '@shared/types/ErrorCode';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import { ServiceError } from './errors/ServiceError';
import route from './router';
import { ApiError, error } from './utils/apiHelper';
import './utils/logger';

const app = express();
const port = process.env.API_PORT;
const apiBasePath = String(process.env.API_BASE_PATH); // /api/<version> ex. /api/v1

app.use(cors({ origin: ['http://localhost:5173'], credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/usercontent/images', express.static(String(process.env.UPLOAD_PATH)));
app.use(apiBasePath, route);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server Error:', err);

  if (err instanceof ApiError) {
    return error(res, err.message, err.code, err.data, err.status);
  } else if (err instanceof ServiceError) {
    return error(res, err.message, err.code, err.data, 400);
  } else {
    return error(res, err.message, ErrorCode.SERVER_ERROR, null, 500);
  }
});

app.listen(port, () => {
  console.log(`NODE_ENV is: ${process.env.NODE_ENV}`);
  console.log(`Server is running at http://localhost:${port}`);
});