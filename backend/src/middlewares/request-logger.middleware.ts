import { RequestHandler } from 'express';
import { logger } from '../config/logger';

export const requestLogger: RequestHandler = (request, response, next) => {
  const startedAt = Date.now();
  response.on('finish', () => {
    const context = { method: request.method, path: request.originalUrl, statusCode: response.statusCode, durationMs: Date.now() - startedAt, userId: request.user?.id };
    if (response.statusCode >= 500) logger.error('HTTP request completed', context);
    else if (response.statusCode >= 400) logger.warn('HTTP request completed', context);
    else logger.info('HTTP request completed', context);
  });
  next();
};
