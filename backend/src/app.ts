import '@/env';
//do not remove this comment to prevent auto organize on save (@/env should be the first import)
import '@/config/passport';
import { ErrorCode } from '@shared/types/ErrorCode';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import https from 'https';
import fs from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import passport from 'passport';
import path from 'path';
import { ServiceError } from './errors/ServiceError';
import router from './router';
import { router as passportRouter } from './routes/passportRouter';
import { ApiError, error } from './utils/apiHelper';
import './utils/logger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.API_PORT;
const apiBasePath = String(process.env.API_BASE_PATH); // /api/<version> ex. /api/v1

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://jp-pc.home.arpa:5173',
    'https://localhost:5173',
    'https://jp-pc.home.arpa:5173',
    'http://localhost:4173',
    'http://jp-pc.home.arpa:4173'
  ], credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use('/auth', passportRouter);
app.use('/usercontent/images', express.static(String(process.env.UPLOAD_PATH)));
app.use(apiBasePath, router);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server Error:', err);

  if (err instanceof ApiError) {
    return error(res, err.message, err.code, err.data, err.status);
  } else if (err instanceof ServiceError) {
    return error(res, err.message, err.code, err.data, 400);
  } else {
    return error(res, 'Something went wrong', ErrorCode.SERVER_ERROR, null, 500);
  }
});

https.createServer({
  key: fs.readFileSync(path.join(__dirname, '../../certs/jp-pc.home.arpa+3-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../../certs/jp-pc.home.arpa+3.pem')),
}, app)
  .listen(`4${port}`, () => {
    console.log(`NODE_ENV is: ${process.env.NODE_ENV}`);
    console.log(`Server is running at https://localhost:4${port}`);
  });

// app.listen(port, () => {
//   console.log(`NODE_ENV is: ${process.env.NODE_ENV}`);
//   console.log(`Server is running at http://localhost:${port}`);
// });