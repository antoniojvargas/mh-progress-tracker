import { Request, Response } from 'express';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { env } from '../config/env';
import { authenticateGoogleCode, createSessionToken, getGoogleAuthorizationUrl } from '../services/auth.service';

const cookieOptions = { httpOnly: true, secure: env.isProduction, sameSite: 'lax' as const, maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' };
const oauthStateOptions = { httpOnly: true, secure: env.isProduction, sameSite: 'lax' as const, maxAge: 10 * 60 * 1000, path: '/api/auth/google' };
export const redirectToGoogle = (_request: Request, response: Response): void => { const state = randomBytes(32).toString('hex'); response.cookie('oauth_state', state, oauthStateOptions).redirect(getGoogleAuthorizationUrl(state)); };
export const googleCallback = async (request: Request, response: Response): Promise<void> => {
  try {
    const code = request.query.code; const state = request.query.state; const savedState = request.cookies.oauth_state;
    const statesMatch = typeof state === 'string' && typeof savedState === 'string' && state.length === savedState.length && timingSafeEqual(Buffer.from(state), Buffer.from(savedState));
    response.clearCookie('oauth_state', oauthStateOptions);
    if (typeof code !== 'string' || !statesMatch) { response.status(400).send('Invalid Google authorization response.'); return; }
    const user = await authenticateGoogleCode(code);
    response.cookie('session', createSessionToken(user), cookieOptions).redirect(`${env.frontendUrl}/dashboard`);
  } catch { response.redirect(`${env.frontendUrl}/?error=google-auth-failed`); }
};
export const getCurrentUser = (request: Request, response: Response): void => { const { id, email, displayName, avatarUrl } = request.user!; response.json({ data: { id, email, displayName, avatarUrl } }); };
export const logout = (_request: Request, response: Response): void => { response.clearCookie('session', cookieOptions).status(204).send(); };
