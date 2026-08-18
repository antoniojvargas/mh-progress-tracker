export class HttpError extends Error {
  constructor(public readonly statusCode: number, public readonly code: string, message: string, public readonly details?: unknown) {
    super(message);
    this.name = 'HttpError';
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string, details?: unknown) { super(400, 'VALIDATION_ERROR', message, details); }
}

export class UnauthorizedError extends HttpError {
  constructor(message = 'Authentication is required.') { super(401, 'UNAUTHENTICATED', message); }
}

export class ConflictError extends HttpError {
  constructor(message: string, code = 'CONFLICT') { super(409, code, message); }
}
