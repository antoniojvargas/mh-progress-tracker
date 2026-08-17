import { Request, Response } from 'express';
import { logger } from '../config/logger';
import { io } from '../websocket/socket.gateway';
import { createDailyLog, getDailyLogs } from '../services/daily-log.service';
import { dailyLogSchema, logsQuerySchema } from '../validators/daily-log.schema';

const serializeLog = (log: Awaited<ReturnType<typeof createDailyLog>>) => ({
  id: log.id, logDate: log.logDate, moodRating: log.moodRating, anxietyLevel: log.anxietyLevel, stressLevel: log.stressLevel,
  sleepHours: Number(log.sleepHours), sleepQuality: log.sleepQuality, sleepDisturbances: log.sleepDisturbances,
  physicalActivityType: log.physicalActivityType, physicalActivityMinutes: log.physicalActivityMinutes,
  socialInteractionFrequency: log.socialInteractionFrequency, depressionSymptomsPresent: log.depressionSymptomsPresent,
  depressionSeverity: log.depressionSeverity, anxietySymptomsPresent: log.anxietySymptomsPresent,
  anxietySymptomSeverity: log.anxietySymptomSeverity, notes: log.notes
});
export const postDailyLog = async (request: Request, response: Response): Promise<void> => {
  const parsed = dailyLogSchema.safeParse(request.body);
  if (!parsed.success) {
    logger.warn('Rejected invalid daily log payload', { userId: request.user!.id, issues: parsed.error.flatten() });
    response.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid daily log data.', details: parsed.error.flatten() } });
    return;
  }
  try {
    const log = await createDailyLog(request.user!.id, parsed.data);
    const payload = serializeLog(log);
    io.to(`user:${request.user!.id}`).emit('daily-log:created', payload);
    logger.info('Daily log created', { userId: request.user!.id, logId: log.id, logDate: log.logDate });
    response.status(201).json({ data: payload });
  } catch (error) {
    if ((error as { code?: string }).code === '23505') {
      logger.warn('Rejected duplicate daily log', { userId: request.user!.id, logDate: parsed.data.logDate });
      response.status(409).json({ error: { code: 'DAILY_LOG_ALREADY_EXISTS', message: 'A log already exists for this day.' } });
      return;
    }
    throw error;
  }
};
export const listDailyLogs = async (request: Request, response: Response): Promise<void> => {
  const parsed = logsQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    logger.warn('Rejected invalid daily log query', { userId: request.user!.id, query: request.query });
    response.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Provide valid from and to dates.' } });
    return;
  }
  const logs = await getDailyLogs(request.user!.id, parsed.data.from, parsed.data.to);
  response.json({ data: logs.map(serializeLog), meta: parsed.data });
};
