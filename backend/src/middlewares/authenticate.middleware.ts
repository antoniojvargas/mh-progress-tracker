import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { UnauthorizedError } from '../errors/http-error';
import { findUserById } from '../repositories/user.repository';

export const authenticate = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  try {
    const token = request.cookies.session;
    const payload = jwt.verify(token, env.jwtSecret) as { sub: string };
    const user = await findUserById(payload.sub);
    if (!user) {
      logger.warn('Session references unknown user', { userId: payload.sub });
      throw new UnauthorizedError();
    }
    request.user = user;
    next();
  } catch (error) {
    if (!(error instanceof UnauthorizedError)) logger.warn('Rejected request with invalid session', { path: request.originalUrl, error });
    next(error instanceof UnauthorizedError ? error : new UnauthorizedError());
  }
};
