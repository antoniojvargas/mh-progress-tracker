import { describe, expect, it, vi } from 'vitest';
import { getCurrentUser, logout } from './auth.api';
import { request } from './api-client';

vi.mock('./api-client', () => ({ request: vi.fn() }));
const mockedRequest = vi.mocked(request);

describe('getCurrentUser', () => {
  it('requests the current session user', () => {
    getCurrentUser();
    expect(mockedRequest).toHaveBeenCalledWith('/auth/me');
  });
});

describe('logout', () => {
  it('posts to the logout endpoint', () => {
    logout();
    expect(mockedRequest).toHaveBeenCalledWith('/auth/logout', { method: 'POST' });
  });
});
