import { ErrorRequestHandler } from 'express';
import { logger } from '../config/logger';

export const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  if (error?.code === '23505') {
    logger.warn('Rejected duplicate daily log', { method: request.method, path: request.originalUrl, userId: request.user?.id });
    response.status(409).json({ error: { code: 'DAILY_LOG_ALREADY_EXISTS', message: 'A log already exists for this day.' } });
    return;
  }
  logger.error('Unhandled request error', { method: request.method, path: request.originalUrl, userId: request.user?.id, error });
  response.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Unable to complete this request.' } });
};

