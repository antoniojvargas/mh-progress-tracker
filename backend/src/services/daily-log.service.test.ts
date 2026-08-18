import { createDailyLog, getDailyLogs } from './daily-log.service';
import { findDailyLogsInRange, saveDailyLog } from '../repositories/daily-log.repository';
import { DailyLogInput } from '../validators/daily-log.schema';
import { SocialInteractionFrequency } from '../entities/daily-log.entity';

jest.mock('../repositories/daily-log.repository');

const mockedSaveDailyLog = saveDailyLog as jest.MockedFunction<typeof saveDailyLog>;
const mockedFindDailyLogsInRange = findDailyLogsInRange as jest.MockedFunction<typeof findDailyLogsInRange>;

const baseInput: DailyLogInput = {
  logDate: '2026-08-18',
  moodRating: 7,
  anxietyLevel: 3,
  stressLevel: 4,
  sleepHours: 7.5,
  sleepQuality: 4,
  sleepDisturbances: 0,
  physicalActivityType: undefined,
  physicalActivityMinutes: 30,
  socialInteractionFrequency: SocialInteractionFrequency.Moderate,
  depressionSymptomsPresent: false,
  depressionSeverity: null,
  anxietySymptomsPresent: false,
  anxietySymptomSeverity: null,
  notes: undefined,
};

describe('createDailyLog', () => {
  it('formats sleepHours to one decimal and defaults nullable fields', async () => {
    mockedSaveDailyLog.mockResolvedValue({} as never);

    await createDailyLog('user-1', baseInput);

    expect(mockedSaveDailyLog).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'user-1',
      sleepHours: '7.5',
      physicalActivityType: null,
      notes: null,
    }));
  });

  it('preserves an explicitly provided physicalActivityType and notes', async () => {
    mockedSaveDailyLog.mockResolvedValue({} as never);

    await createDailyLog('user-1', { ...baseInput, physicalActivityType: 'caminar', notes: 'todo bien' });

    expect(mockedSaveDailyLog).toHaveBeenCalledWith(expect.objectContaining({
      physicalActivityType: 'caminar',
      notes: 'todo bien',
    }));
  });
});

describe('getDailyLogs', () => {
  it('delegates to findDailyLogsInRange with the given range', async () => {
    const logs = [{ id: 'log-1' }] as never;
    mockedFindDailyLogsInRange.mockResolvedValue(logs);

    const result = await getDailyLogs('user-1', '2026-08-01', '2026-08-18');

    expect(mockedFindDailyLogsInRange).toHaveBeenCalledWith('user-1', '2026-08-01', '2026-08-18');
    expect(result).toBe(logs);
  });
});
