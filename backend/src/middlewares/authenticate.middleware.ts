import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { findUserById } from '../repositories/user.repository';

export const authenticate = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  try {
    const token = request.cookies.session;
    const payload = jwt.verify(token, env.jwtSecret) as { sub: string };
    const user = await findUserById(payload.sub);
    if (!user) { response.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Authentication is required.' } }); return; }
    request.user = user;
    next();
  } catch { response.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Authentication is required.' } }); }
};
