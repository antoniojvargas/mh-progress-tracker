import { Request, Response } from 'express';
import { logger } from '../config/logger';
import { BadRequestError, ConflictError } from '../errors/http-error';
import { asyncHandler } from '../middlewares/async-handler';
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
export const postDailyLog = asyncHandler(async (request: Request, response: Response): Promise<void> => {
  const parsed = dailyLogSchema.safeParse(request.body);
  if (!parsed.success) {
    logger.warn('Rejected invalid daily log payload', { userId: request.user!.id, issues: parsed.error.flatten() });
    throw new BadRequestError('Invalid daily log data.', parsed.error.flatten());
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
      throw new ConflictError('A log already exists for this day.', 'DAILY_LOG_ALREADY_EXISTS');
    }
    throw error;
  }
});
export const listDailyLogs = asyncHandler(async (request: Request, response: Response): Promise<void> => {
  const parsed = logsQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    logger.warn('Rejected invalid daily log query', { userId: request.user!.id, query: request.query });
    throw new BadRequestError('Provide valid from and to dates.');
  }
  const logs = await getDailyLogs(request.user!.id, parsed.data.from, parsed.data.to);
  response.json({ data: logs.map(serializeLog), meta: parsed.data });
});
