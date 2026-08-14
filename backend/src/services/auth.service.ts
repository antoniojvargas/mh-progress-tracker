import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '../entities/user.entity';
import { findUserByGoogleId, saveUser } from '../repositories/user.repository';

type GoogleProfile = { sub: string; email: string; name?: string; picture?: string };
export const getGoogleAuthorizationUrl = (state: string): string => {
  const query = new URLSearchParams({ client_id: env.googleClientId, redirect_uri: env.googleCallbackUrl, response_type: 'code', scope: 'openid email profile', access_type: 'offline', prompt: 'select_account', state });
  return `https://accounts.google.com/o/oauth2/v2/auth?${query}`;
};
export const authenticateGoogleCode = async (code: string): Promise<User> => {
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ code, client_id: env.googleClientId, client_secret: env.googleClientSecret, redirect_uri: env.googleCallbackUrl, grant_type: 'authorization_code' }) });
  if (!tokenResponse.ok) throw new Error('Google token exchange failed');
  const { access_token: accessToken } = await tokenResponse.json() as { access_token: string };
  const profileResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!profileResponse.ok) throw new Error('Google profile request failed');
  const profile = await profileResponse.json() as GoogleProfile;
  const existing = await findUserByGoogleId(profile.sub);
  if (existing) return existing;
  return saveUser({ googleId: profile.sub, email: profile.email, displayName: profile.name ?? profile.email, avatarUrl: profile.picture ?? null });
};
export const createSessionToken = (user: User): string => jwt.sign({ sub: user.id, email: user.email }, env.jwtSecret, { expiresIn: '7d' });
