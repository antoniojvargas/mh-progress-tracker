import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DashboardPage } from './dashboard-page';
import { useDailyLogs } from '../hooks/use-daily-logs';
import { useLogSocket } from '../hooks/use-log-socket';
import { logout } from '../services/auth.api';
import { User } from '../types/daily-log';

vi.mock('../hooks/use-daily-logs');
vi.mock('../hooks/use-log-socket', () => ({ useLogSocket: vi.fn() }));
vi.mock('../services/auth.api', () => ({ logout: vi.fn() }));

const mockedUseDailyLogs = vi.mocked(useDailyLogs);
const mockedUseLogSocket = vi.mocked(useLogSocket);
const mockedLogout = vi.mocked(logout);

const user: User = { id: 'user-1', email: 'a@b.com', displayName: 'Ana García', avatarUrl: null };

describe('DashboardPage', () => {
  it('greets the user by their first name and shows the empty state with no logs', () => {
    mockedUseDailyLogs.mockReturnValue({ logs: [], loading: false, error: null, load: vi.fn(), addLog: vi.fn() });

    render(<DashboardPage user={user} />);

    expect(screen.getByText('Hola, Ana')).toBeInTheDocument();
    expect(screen.getByText('Tu historia comienza aquí.')).toBeInTheDocument();
  });

  it('opens the daily log modal when "Registrar mi día" is clicked', async () => {
    mockedUseDailyLogs.mockReturnValue({ logs: [], loading: false, error: null, load: vi.fn(), addLog: vi.fn() });
    const userEventInstance = userEvent.setup();

    render(<DashboardPage user={user} />);
    await userEventInstance.click(screen.getByRole('button', { name: 'Registrar mi día' }));

    expect(screen.getByRole('dialog', { name: 'Registrar mi día' })).toBeInTheDocument();
  });

  it('shows the loading state while logs are being fetched', () => {
    mockedUseDailyLogs.mockReturnValue({ logs: [], loading: true, error: null, load: vi.fn(), addLog: vi.fn() });

    render(<DashboardPage user={user} />);

    expect(screen.getByText('Preparando tus tendencias…')).toBeInTheDocument();
  });

  it('logs out and redirects when "Salir" is clicked', async () => {
    mockedUseDailyLogs.mockReturnValue({ logs: [], loading: false, error: null, load: vi.fn(), addLog: vi.fn() });
    mockedLogout.mockResolvedValue(undefined);
    const assignSpy = vi.fn();
    vi.stubGlobal('location', { ...window.location, assign: assignSpy });
    const userEventInstance = userEvent.setup();

    render(<DashboardPage user={user} />);
    await userEventInstance.click(screen.getByRole('button', { name: 'Salir' }));

    await waitFor(() => expect(assignSpy).toHaveBeenCalledWith('/'));
    expect(mockedUseLogSocket).toHaveBeenCalled();
  });
});
