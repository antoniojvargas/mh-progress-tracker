import { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error?.code === '23505') { response.status(409).json({ error: { code: 'DAILY_LOG_ALREADY_EXISTS', message: 'A log already exists for this day.' } }); return; }
  console.error(error);
  response.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Unable to complete this request.' } });
};

