import { Request, Response } from 'express';
import { errorHandler } from './error-handler.middleware';
import { BadRequestError } from '../errors/http-error';
import { logger } from '../config/logger';

jest.mock('../config/logger', () => ({ logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() } }));

const buildResponse = (): Response => {
  const response = {} as Response;
  response.status = jest.fn().mockReturnValue(response);
  response.json = jest.fn().mockReturnValue(response);
  return response;
};

const buildRequest = (overrides: Partial<Request> = {}): Request => ({
  method: 'POST',
  originalUrl: '/api/logs',
  user: undefined,
  ...overrides,
} as Request);

describe('errorHandler', () => {
  it('formats HttpError instances using their statusCode, code and message', () => {
    const response = buildResponse();
    const error = new BadRequestError('Invalid daily log data.', { fieldErrors: { moodRating: ['Required'] } });

    errorHandler(error, buildRequest(), response, jest.fn());

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      error: { code: 'VALIDATION_ERROR', message: 'Invalid daily log data.', details: { fieldErrors: { moodRating: ['Required'] } } },
    });
    expect(logger.warn).toHaveBeenCalled();
  });

  it('logs HttpError with statusCode >= 500 at error level', () => {
    const response = buildResponse();
    const error = new BadRequestError('placeholder');
    Object.assign(error, { statusCode: 500 });

    errorHandler(error, buildRequest(), response, jest.fn());

    expect(logger.error).toHaveBeenCalled();
  });

  it('maps a Postgres unique violation to a 409 duplicate response', () => {
    const response = buildResponse();
    const error = { code: '23505' };

    errorHandler(error, buildRequest(), response, jest.fn());

    expect(response.status).toHaveBeenCalledWith(409);
    expect(response.json).toHaveBeenCalledWith({
      error: { code: 'DAILY_LOG_ALREADY_EXISTS', message: 'A log already exists for this day.' },
    });
    expect(logger.warn).toHaveBeenCalled();
  });

  it('falls back to a generic 500 response for unrecognized errors', () => {
    const response = buildResponse();
    const error = new Error('unexpected');

    errorHandler(error, buildRequest(), response, jest.fn());

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({
      error: { code: 'INTERNAL_ERROR', message: 'Unable to complete this request.' },
    });
    expect(logger.error).toHaveBeenCalled();
  });
});
