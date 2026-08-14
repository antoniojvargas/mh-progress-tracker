import { Router } from 'express';
import { listDailyLogs, postDailyLog } from '../controllers/daily-log.controller';
import { authenticate } from '../middlewares/authenticate.middleware';

export const dailyLogRouter = Router();
dailyLogRouter.use(authenticate);
dailyLogRouter.post('/', postDailyLog);
dailyLogRouter.get('/', listDailyLogs);

