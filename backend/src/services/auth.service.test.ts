import jwt from 'jsonwebtoken';
import { authenticateGoogleCode, createSessionToken, getGoogleAuthorizationUrl } from './auth.service';
import { findUserByGoogleId, saveUser } from '../repositories/user.repository';
import { User } from '../entities/user.entity';

jest.mock('jsonwebtoken');
jest.mock('../repositories/user.repository');
jest.mock('../config/logger', () => ({ logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() } }));
jest.mock('../config/env', () => ({
  env: {
    googleClientId: 'client-id',
    googleClientSecret: 'client-secret',
    googleCallbackUrl: 'http://localhost:3000/api/auth/google/callback',
    jwtSecret: 'test-secret',
  },
}));

const mockedJwt = jwt as jest.Mocked<typeof jwt>;
const mockedFindUserByGoogleId = findUserByGoogleId as jest.MockedFunction<typeof findUserByGoogleId>;
const mockedSaveUser = saveUser as jest.MockedFunction<typeof saveUser>;

const jsonResponse = (body: unknown, ok = true, status = 200): Response => ({
  ok,
  status,
  json: async () => body,
} as Response);

describe('getGoogleAuthorizationUrl', () => {
  it('builds a Google OAuth URL including the given state', () => {
    const url = getGoogleAuthorizationUrl('random-state');
    expect(url).toContain('https://accounts.google.com/o/oauth2/v2/auth?');
    expect(url).toContain('client_id=client-id');
    expect(url).toContain('state=random-state');
  });
});

describe('authenticateGoogleCode', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    global.fetch = fetchMock as never;
    fetchMock.mockReset();
  });

  it('returns the existing user when the Google profile is already known', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ access_token: 'token' }))
      .mockResolvedValueOnce(jsonResponse({ sub: 'google-1', email: 'a@b.com', name: 'A' }));
    const existingUser = { id: 'user-1', googleId: 'google-1' } as User;
    mockedFindUserByGoogleId.mockResolvedValue(existingUser);

    const result = await authenticateGoogleCode('auth-code');

    expect(result).toBe(existingUser);
    expect(mockedSaveUser).not.toHaveBeenCalled();
  });

  it('creates a new user when the Google profile is unknown', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ access_token: 'token' }))
      .mockResolvedValueOnce(jsonResponse({ sub: 'google-2', email: 'new@user.com', name: 'New', picture: 'pic.jpg' }));
    mockedFindUserByGoogleId.mockResolvedValue(null);
    const createdUser = { id: 'user-2', googleId: 'google-2' } as User;
    mockedSaveUser.mockResolvedValue(createdUser);

    const result = await authenticateGoogleCode('auth-code');

    expect(mockedSaveUser).toHaveBeenCalledWith({ googleId: 'google-2', email: 'new@user.com', displayName: 'New', avatarUrl: 'pic.jpg' });
    expect(result).toBe(createdUser);
  });

  it('throws when the token exchange fails', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({}, false, 400));

    await expect(authenticateGoogleCode('bad-code')).rejects.toThrow('Google token exchange failed');
  });

  it('throws when the profile request fails', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ access_token: 'token' }))
      .mockResolvedValueOnce(jsonResponse({}, false, 401));

    await expect(authenticateGoogleCode('auth-code')).rejects.toThrow('Google profile request failed');
  });
});

describe('createSessionToken', () => {
  it('signs a JWT with the user id and email as payload', () => {
    mockedJwt.sign.mockReturnValue('signed-token' as never);
    const user = { id: 'user-1', email: 'a@b.com' } as User;

    const token = createSessionToken(user);

    expect(mockedJwt.sign).toHaveBeenCalledWith({ sub: 'user-1', email: 'a@b.com' }, 'test-secret', { expiresIn: '7d' });
    expect(token).toBe('signed-token');
  });
});
