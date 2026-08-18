import { BadRequestError, ConflictError, HttpError, UnauthorizedError } from './http-error';

describe('HttpError', () => {
  it('exposes statusCode, code, message and details', () => {
    const error = new HttpError(418, 'TEAPOT', 'I am a teapot', { reason: 'brewing' });
    expect(error).toBeInstanceOf(Error);
    expect(error.statusCode).toBe(418);
    expect(error.code).toBe('TEAPOT');
    expect(error.message).toBe('I am a teapot');
    expect(error.details).toEqual({ reason: 'brewing' });
  });
});

describe('BadRequestError', () => {
  it('defaults to a 400 status and VALIDATION_ERROR code', () => {
    const error = new BadRequestError('Invalid input', { field: 'bad' });
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.details).toEqual({ field: 'bad' });
  });
});

describe('UnauthorizedError', () => {
  it('defaults to a 401 status, UNAUTHENTICATED code and default message', () => {
    const error = new UnauthorizedError();
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('UNAUTHENTICATED');
    expect(error.message).toBe('Authentication is required.');
  });

  it('allows overriding the message', () => {
    const error = new UnauthorizedError('Custom message');
    expect(error.message).toBe('Custom message');
  });
});

describe('ConflictError', () => {
  it('defaults to a 409 status and CONFLICT code', () => {
    const error = new ConflictError('Already exists');
    expect(error.statusCode).toBe(409);
    expect(error.code).toBe('CONFLICT');
  });

  it('allows overriding the code', () => {
    const error = new ConflictError('Already exists', 'DAILY_LOG_ALREADY_EXISTS');
    expect(error.code).toBe('DAILY_LOG_ALREADY_EXISTS');
  });
});
