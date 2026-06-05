import { ErrorCode } from '@shared/types/ErrorCode.js';
import cookieParser from 'cookie-parser';
import express, { type NextFunction, type Request, type Response } from 'express';
import http from 'http';
import passport from 'passport';
import { APP_URL, BACKEND_PORT, USERCONTENT_DIR } from './config/config.js';
import './config/passport.js';
import { ServiceError } from './errors/ServiceError.js';
import router from './router.js';
import { ApiError, error } from './utils/apiHelper.js';
import { currentUser, verifySignedUrl } from './utils/auth.js';
import './utils/logger.js';

const app = express();

app.set('trust proxy', 2); //for cloudflare/proxy
app.use(express.json());
app.use(cookieParser());
app.use(currentUser);
app.use(passport.initialize());
app.use('/usercontent', verifySignedUrl, express.static(USERCONTENT_DIR));
app.use('/api', (req, res, next: NextFunction) => (res.locals.apiBasePath = '/api', next()), router);
//app.use('/api/v2', (req, res, next: NextFunction) => (res.locals.apiBasePath = '/api/v2', next()), router);

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
server.listen(`${BACKEND_PORT}`, () => {
  console.log(`NODE_ENV is: ${process.env.NODE_ENV}`);
  console.log(`Backend server is running at http://localhost:${BACKEND_PORT}`);
  console.log(`Frontend is at ${APP_URL}`);
});