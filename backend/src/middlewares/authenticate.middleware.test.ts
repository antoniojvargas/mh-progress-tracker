import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate } from './authenticate.middleware';
import { UnauthorizedError } from '../errors/http-error';
import { findUserById } from '../repositories/user.repository';

jest.mock('jsonwebtoken');
jest.mock('../repositories/user.repository');
jest.mock('../config/logger', () => ({ logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() } }));

const mockedJwt = jwt as jest.Mocked<typeof jwt>;
const mockedFindUserById = findUserById as jest.MockedFunction<typeof findUserById>;

const buildRequest = (cookieValue?: string): Request => ({
  cookies: { session: cookieValue },
  originalUrl: '/api/logs',
} as unknown as Request);

const response = {} as Response;

describe('authenticate', () => {
  it('attaches the user and calls next() when the session token is valid', async () => {
    mockedJwt.verify.mockReturnValue({ sub: 'user-1' } as never);
    const user = { id: 'user-1', email: 'a@b.com' } as never;
    mockedFindUserById.mockResolvedValue(user);
    const request = buildRequest('valid-token');
    const next = jest.fn();

    await authenticate(request, response, next);

    expect(request.user).toBe(user);
    expect(next).toHaveBeenCalledWith();
  });

  it('calls next() with UnauthorizedError when the token belongs to no user', async () => {
    mockedJwt.verify.mockReturnValue({ sub: 'ghost' } as never);
    mockedFindUserById.mockResolvedValue(null);
    const request = buildRequest('valid-token');
    const next = jest.fn();

    await authenticate(request, response, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('calls next() with UnauthorizedError when the token is invalid', async () => {
    mockedJwt.verify.mockImplementation(() => { throw new Error('invalid token'); });
    const request = buildRequest('bad-token');
    const next = jest.fn();

    await authenticate(request, response, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('calls next() with UnauthorizedError when there is no session cookie', async () => {
    mockedJwt.verify.mockImplementation(() => { throw new Error('jwt must be provided'); });
    const request = buildRequest(undefined);
    const next = jest.fn();

    await authenticate(request, response, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });
});
