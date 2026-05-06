import './env.js';
//do not remove this comment to prevent auto organize on save (@/env should be the first import)
import { ErrorCode } from '@shared/types/ErrorCode.js';
import cookieParser from 'cookie-parser';
//import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import http from 'http';
import passport from 'passport';
import './config/config.js';
import { USERCONTENT_DIR } from './config/config.js';
import './config/passport.js';
import { ServiceError } from './errors/ServiceError.js';
import router from './router.js';
import { ApiError, error } from './utils/apiHelper.js';
import { currentUser, verifySignedUrl } from './utils/auth.js';
import './utils/logger.js';

const app = express();
const port = process.env.BACKEND_PORT;

app.set('trust proxy', 2); //for cloudflare/proxy
// app.use(cors({
//   origin: CORS_ORIGINS === '*' ? (origin, callback) => { console.log({ origin }); return callback(null, origin ?? '*') } : CORS_ORIGINS.split(','),
//   credentials: true
// }));
app.use(express.json());
app.use(cookieParser());
app.use(currentUser);
app.use(passport.initialize());
app.use('/usercontent', verifySignedUrl, express.static(USERCONTENT_DIR));
app.use('/api', router);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError && err.code === ErrorCode.TOKEN_EXPIRED) {
    // Expected auth flow — token expired, client should refresh
    return error(res, err.message, err.code, err.data, err.status);
  }
  console.error('Server Error:', err);

  if (err instanceof ApiError) {
    return error(res, err.message, err.code, err.data, err.status);
  } else if (err instanceof ServiceError) {
    return error(res, err.message, err.code, err.data, 400);
  } else {
    return error(res, 'Something went wrong', ErrorCode.SERVER_ERROR, null, 500);
  }
});

// let server;
// if (process.env.NODE_ENV !== 'production') {
//   server = https.createServer({
//     key: fs.readFileSync(resolve(homedir(), '.vite-plugin-mkcert/dev.pem')),
//     cert: fs.readFileSync(resolve(homedir(), '.vite-plugin-mkcert/cert.pem')),
//   }, app);
// } else {
//   server = http.createServer(app);
// }

const server = http.createServer(app);
server.listen(`${process.env.BACKEND_PORT}`, () => {
  console.log(`NODE_ENV is: ${process.env.NODE_ENV}`);
  console.log(`Server is running at http://localhost:${process.env.BACKEND_PORT}`);
});