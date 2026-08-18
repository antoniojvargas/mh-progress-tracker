import { ErrorRequestHandler } from 'express';
import { logger } from '../config/logger';
import { HttpError } from '../errors/http-error';

export const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  const context = { method: request.method, path: request.originalUrl, userId: request.user?.id };

  if (error instanceof HttpError) {
    const log = error.statusCode >= 500 ? logger.error : logger.warn;
    log('Request failed', { ...context, statusCode: error.statusCode, code: error.code, error });
    response.status(error.statusCode).json({ error: { code: error.code, message: error.message, ...(error.details ? { details: error.details } : {}) } });
    return;
  }

  if (error?.code === '23505') {
    logger.warn('Rejected duplicate daily log', context);
    response.status(409).json({ error: { code: 'DAILY_LOG_ALREADY_EXISTS', message: 'A log already exists for this day.' } });
    return;
  }

  logger.error('Unhandled request error', { ...context, error });
  response.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Unable to complete this request.' } });
};
