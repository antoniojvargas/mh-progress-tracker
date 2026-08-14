import { Router } from 'express';
import { getCurrentUser, googleCallback, logout, redirectToGoogle } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/authenticate.middleware';

export const authRouter = Router();
authRouter.get('/google', redirectToGoogle);
authRouter.get('/google/callback', googleCallback);
authRouter.get('/me', authenticate, getCurrentUser);
authRouter.post('/logout', authenticate, logout);

