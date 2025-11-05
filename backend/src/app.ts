import dotenv from 'dotenv';
dotenv.config();

if (!process.env.API_BASE_PATH) throw new Error('API_PATH environment variable is not set');
if (!process.env.JWT_ACCESS_SECRET) throw new Error('JWT_ACCESS_SECRET environment variable is not set');

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import route from './routes';
import './utils/logger';

const app = express();
const port = process.env.API_PORT;
const apiBasePath = String(process.env.API_BASE_PATH); // /api/<version> ex. /api/v1

app.use(cors({ origin: ['http://localhost:5173'], credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(apiBasePath, route);
app.listen(port, () => {
  console.log(`NODE_ENV is: ${process.env.NODE_ENV}`);
  console.log(`Server is running at http://localhost:${port}`);
});