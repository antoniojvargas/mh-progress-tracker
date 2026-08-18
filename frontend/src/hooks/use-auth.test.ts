import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useAuth } from './use-auth';
import { getCurrentUser } from '../services/auth.api';

vi.mock('../services/auth.api', () => ({ getCurrentUser: vi.fn() }));
const mockedGetCurrentUser = vi.mocked(getCurrentUser);

describe('useAuth', () => {
  it('starts in a loading state with no user', () => {
    mockedGetCurrentUser.mockReturnValue(new Promise(() => undefined));
    const { result } = renderHook(() => useAuth());
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it('sets the user once the session request resolves', async () => {
    const user = { id: 'user-1', email: 'a@b.com', displayName: 'A', avatarUrl: null };
    mockedGetCurrentUser.mockResolvedValue({ data: user });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toEqual(user);
  });

  it('leaves the user null when the session request fails', async () => {
    mockedGetCurrentUser.mockRejectedValue(new Error('unauthenticated'));

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
  });
});
