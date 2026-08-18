import { describe, expect, it, vi } from 'vitest';
import { createLog, getLogs } from './logs.api';
import { request } from './api-client';
import { DailyLogInput } from '../types/daily-log';

vi.mock('./api-client', () => ({ request: vi.fn() }));
const mockedRequest = vi.mocked(request);

describe('getLogs', () => {
  it('requests logs within the given date range', () => {
    getLogs('2026-08-01', '2026-08-18');
    expect(mockedRequest).toHaveBeenCalledWith('/logs?from=2026-08-01&to=2026-08-18');
  });
});

describe('createLog', () => {
  it('posts the serialized log input', () => {
    const input: DailyLogInput = {
      logDate: '2026-08-18', moodRating: 7, anxietyLevel: 3, stressLevel: 4, sleepHours: 7.5, sleepQuality: 4,
      sleepDisturbances: 0, physicalActivityType: null, physicalActivityMinutes: 30, socialInteractionFrequency: 'moderate',
      depressionSymptomsPresent: false, depressionSeverity: null, anxietySymptomsPresent: false, anxietySymptomSeverity: null, notes: null,
    };

    createLog(input);

    expect(mockedRequest).toHaveBeenCalledWith('/logs', { method: 'POST', body: JSON.stringify(input) });
  });
});
