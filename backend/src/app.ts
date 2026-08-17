import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { env } from './config/env';
import { errorHandler } from './middlewares/error-handler.middleware';
import { requestLogger } from './middlewares/request-logger.middleware';
import { authRouter } from './routes/auth.routes';
import { dailyLogRouter } from './routes/daily-log.routes';

export const app = express();
app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use(requestLogger);
app.get('/health', (_request, response) => response.json({ status: 'ok' }));
app.use('/api/auth', authRouter);
app.use('/api/logs', dailyLogRouter);
app.use(errorHandler);

