import { DailyLog, DailyLogInput } from '../types/daily-log';
import { request } from './api-client';
export const getLogs = (from: string, to: string) => request<{ data: DailyLog[] }>(`/logs?from=${from}&to=${to}`);
export const createLog = (input: DailyLogInput) => request<{ data: DailyLog }>('/logs', { method: 'POST', body: JSON.stringify(input) });

