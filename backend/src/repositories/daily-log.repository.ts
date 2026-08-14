import { Between } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { DailyLog } from '../entities/daily-log.entity';

export const saveDailyLog = (dailyLog: Partial<DailyLog>): Promise<DailyLog> => AppDataSource.getRepository(DailyLog).save(AppDataSource.getRepository(DailyLog).create(dailyLog));
export const findDailyLogsInRange = (userId: string, from: string, to: string): Promise<DailyLog[]> => AppDataSource.getRepository(DailyLog).find({ where: { userId, logDate: Between(from, to) }, order: { logDate: 'ASC' } });
