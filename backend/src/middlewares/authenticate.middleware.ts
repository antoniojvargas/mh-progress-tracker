import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { findUserById } from '../repositories/user.repository';

export const authenticate = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  try {
    const token = request.cookies.session;
    const payload = jwt.verify(token, env.jwtSecret) as { sub: string };
    const user = await findUserById(payload.sub);
    if (!user) {
      logger.warn('Session references unknown user', { userId: payload.sub });
      response.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Authentication is required.' } });
      return;
    }
    request.user = user;
    next();
  } catch (error) {
    logger.warn('Rejected request with invalid session', { path: request.originalUrl, error });
    response.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Authentication is required.' } });
  }
};
