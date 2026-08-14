import { DailyLog } from '../entities/daily-log.entity';
import { findDailyLogsInRange, saveDailyLog } from '../repositories/daily-log.repository';
import { DailyLogInput } from '../validators/daily-log.schema';

export const createDailyLog = async (userId: string, input: DailyLogInput): Promise<DailyLog> => {
  return saveDailyLog({ ...input, userId, sleepHours: input.sleepHours.toFixed(1), physicalActivityType: input.physicalActivityType ?? null, notes: input.notes ?? null });
};
export const getDailyLogs = (userId: string, from: string, to: string): Promise<DailyLog[]> => findDailyLogsInRange(userId, from, to);
