import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useDailyLogs } from './use-daily-logs';
import { getLogs } from '../services/logs.api';
import { DailyLog } from '../types/daily-log';

vi.mock('../services/logs.api', () => ({ getLogs: vi.fn() }));
const mockedGetLogs = vi.mocked(getLogs);

const buildLog = (overrides: Partial<DailyLog>): DailyLog => ({
  id: 'log-1', logDate: '2026-08-18', moodRating: 7, anxietyLevel: 3, stressLevel: 4, sleepHours: 7.5, sleepQuality: 4,
  sleepDisturbances: 0, physicalActivityType: null, physicalActivityMinutes: 30, socialInteractionFrequency: 'moderate',
  depressionSymptomsPresent: false, depressionSeverity: null, anxietySymptomsPresent: false, anxietySymptomSeverity: null,
  notes: null, ...overrides,
});

describe('useDailyLogs', () => {
  it('loads logs for the requested day range on mount', async () => {
    mockedGetLogs.mockResolvedValue({ data: [buildLog({})] });

    const { result } = renderHook(() => useDailyLogs(7));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.logs).toHaveLength(1);
    expect(mockedGetLogs).toHaveBeenCalledTimes(1);
  });

  it('sets an error message when loading fails', async () => {
    mockedGetLogs.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => useDailyLogs(7));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('network down');
    expect(result.current.logs).toEqual([]);
  });

  it('addLog inserts a new log sorted by date', async () => {
    mockedGetLogs.mockResolvedValue({ data: [buildLog({ id: 'log-1', logDate: '2026-08-15' })] });

    const { result } = renderHook(() => useDailyLogs(7));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.addLog(buildLog({ id: 'log-2', logDate: '2026-08-18' })));

    expect(result.current.logs.map((log) => log.id)).toEqual(['log-1', 'log-2']);
  });

  it('addLog replaces an existing log with the same id', async () => {
    mockedGetLogs.mockResolvedValue({ data: [buildLog({ id: 'log-1', moodRating: 5 })] });

    const { result } = renderHook(() => useDailyLogs(7));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.addLog(buildLog({ id: 'log-1', moodRating: 9 })));

    expect(result.current.logs).toHaveLength(1);
    expect(result.current.logs[0].moodRating).toBe(9);
  });
});
