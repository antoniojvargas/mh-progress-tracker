import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useLogSocket } from './use-log-socket';
import { socket } from '../socket/socket-client';

vi.mock('../socket/socket-client', () => ({
  socket: { connect: vi.fn(), disconnect: vi.fn(), on: vi.fn(), off: vi.fn() },
}));

describe('useLogSocket', () => {
  it('connects and subscribes to daily-log:created on mount', () => {
    const onCreated = vi.fn();

    renderHook(() => useLogSocket(onCreated));

    expect(socket.connect).toHaveBeenCalled();
    expect(socket.on).toHaveBeenCalledWith('daily-log:created', onCreated);
  });

  it('unsubscribes and disconnects on unmount', () => {
    const onCreated = vi.fn();
    const { unmount } = renderHook(() => useLogSocket(onCreated));

    unmount();

    expect(socket.off).toHaveBeenCalledWith('daily-log:created', onCreated);
    expect(socket.disconnect).toHaveBeenCalled();
  });
});
