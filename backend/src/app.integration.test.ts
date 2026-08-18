import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { app } from './app';
import { AppDataSource } from './config/data-source';
import { SocialInteractionFrequency } from './entities/daily-log.entity';
import { User } from './entities/user.entity';
import { saveUser } from './repositories/user.repository';
import { createSessionToken } from './services/auth.service';

jest.mock('./websocket/socket.gateway', () => ({ io: { to: () => ({ emit: jest.fn() }) } }));

const validLogPayload = {
  logDate: '2026-08-18',
  moodRating: 7,
  anxietyLevel: 3,
  stressLevel: 4,
  sleepHours: 7.5,
  sleepQuality: 4,
  sleepDisturbances: 0,
  physicalActivityType: 'caminar',
  physicalActivityMinutes: 30,
  socialInteractionFrequency: SocialInteractionFrequency.Moderate,
  depressionSymptomsPresent: false,
  depressionSeverity: null,
  anxietySymptomsPresent: false,
  anxietySymptomSeverity: null,
  notes: null
};

const createAuthenticatedUser = async (): Promise<{ user: User; cookie: string }> => {
  const user = await saveUser({
    googleId: randomUUID(),
    email: `${randomUUID()}@test.com`,
    displayName: 'Test User',
    avatarUrl: null
  });
  return { user, cookie: `session=${createSessionToken(user)}` };
};

beforeAll(async () => {
  await AppDataSource.initialize();
});

afterAll(async () => {
  await AppDataSource.destroy();
});

afterEach(async () => {
  await AppDataSource.query('TRUNCATE TABLE daily_logs, users RESTART IDENTITY CASCADE');
});

describe('GET /health', () => {
  it('returns ok', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});

describe('GET /api/auth/google', () => {
  it('redirects to the Google authorization endpoint and sets an oauth_state cookie', async () => {
    const response = await request(app).get('/api/auth/google');
    expect(response.status).toBe(302);
    expect(response.headers.location).toContain('https://accounts.google.com/o/oauth2/v2/auth');
    expect(response.headers['set-cookie'].some((cookie: string) => cookie.startsWith('oauth_state='))).toBe(true);
  });
});

describe('GET /api/auth/google/callback', () => {
  it('rejects a callback whose state does not match the saved cookie', async () => {
    const response = await request(app)
      .get('/api/auth/google/callback?code=auth-code&state=mismatch')
      .set('Cookie', 'oauth_state=different');
    expect(response.status).toBe(400);
  });

  it('creates a user and sets a session cookie on a valid callback', async () => {
    const agent = request.agent(app);
    const initial = await agent.get('/api/auth/google');
    const stateCookie = (initial.headers['set-cookie'] as unknown as string[]).find((cookie) => cookie.startsWith('oauth_state='));
    const state = stateCookie!.split(';')[0].split('=')[1];

    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({ ok: true, json: async () => ({ access_token: 'token' }) } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ sub: randomUUID(), email: 'new-user@test.com', name: 'New User' }) } as Response);

    const callback = await agent.get(`/api/auth/google/callback?code=auth-code&state=${state}`);

    expect(callback.status).toBe(302);
    expect(callback.headers.location).toBe('http://localhost:5173/dashboard');
    expect(callback.headers['set-cookie'].some((cookie: string) => cookie.startsWith('session='))).toBe(true);

    fetchMock.mockRestore();
  });
});

describe('GET /api/auth/me', () => {
  it('rejects requests without a session cookie', async () => {
    const response = await request(app).get('/api/auth/me');
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('returns the authenticated user', async () => {
    const { user, cookie } = await createAuthenticatedUser();
    const response = await request(app).get('/api/auth/me').set('Cookie', cookie);
    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({ id: user.id, email: user.email, displayName: user.displayName, avatarUrl: user.avatarUrl });
  });
});

describe('POST /api/auth/logout', () => {
  it('clears the session cookie', async () => {
    const { cookie } = await createAuthenticatedUser();
    const response = await request(app).post('/api/auth/logout').set('Cookie', cookie);
    expect(response.status).toBe(204);
    expect(response.headers['set-cookie'].some((cookie: string) => cookie.startsWith('session=;'))).toBe(true);
  });
});

describe('POST /api/logs', () => {
  it('rejects unauthenticated requests', async () => {
    const response = await request(app).post('/api/logs').send(validLogPayload);
    expect(response.status).toBe(401);
  });

  it('creates a daily log for the authenticated user', async () => {
    const { cookie } = await createAuthenticatedUser();
    const response = await request(app).post('/api/logs').set('Cookie', cookie).send(validLogPayload);
    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({ logDate: '2026-08-18', moodRating: 7, sleepHours: 7.5 });
  });

  it('rejects an invalid payload', async () => {
    const { cookie } = await createAuthenticatedUser();
    const response = await request(app).post('/api/logs').set('Cookie', cookie).send({ ...validLogPayload, moodRating: 99 });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects a duplicate log for the same day', async () => {
    const { cookie } = await createAuthenticatedUser();
    await request(app).post('/api/logs').set('Cookie', cookie).send(validLogPayload);
    const response = await request(app).post('/api/logs').set('Cookie', cookie).send(validLogPayload);
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('DAILY_LOG_ALREADY_EXISTS');
  });
});

describe('GET /api/logs', () => {
  it('rejects unauthenticated requests', async () => {
    const response = await request(app).get('/api/logs?from=2026-08-01&to=2026-08-18');
    expect(response.status).toBe(401);
  });

  it('returns only the authenticated user logs within the range, sorted by date', async () => {
    const { cookie } = await createAuthenticatedUser();
    const { cookie: otherCookie } = await createAuthenticatedUser();

    await request(app).post('/api/logs').set('Cookie', cookie).send({ ...validLogPayload, logDate: '2026-08-10' });
    await request(app).post('/api/logs').set('Cookie', cookie).send({ ...validLogPayload, logDate: '2026-08-05' });
    await request(app).post('/api/logs').set('Cookie', otherCookie).send({ ...validLogPayload, logDate: '2026-08-07' });

    const response = await request(app).get('/api/logs?from=2026-08-01&to=2026-08-18').set('Cookie', cookie);

    expect(response.status).toBe(200);
    expect(response.body.data.map((log: { logDate: string }) => log.logDate)).toEqual(['2026-08-05', '2026-08-10']);
  });

  it('rejects an invalid date range', async () => {
    const { cookie } = await createAuthenticatedUser();
    const response = await request(app).get('/api/logs?from=2026-08-18&to=2026-08-01').set('Cookie', cookie);
    expect(response.status).toBe(400);
  });
});
