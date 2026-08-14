import { z } from 'zod';
import { SocialInteractionFrequency } from '../entities/daily-log.entity';

const scale10 = z.number().int().min(1).max(10);
export const dailyLogSchema = z.object({
  logDate: z.string().date(), moodRating: scale10, anxietyLevel: scale10, stressLevel: scale10,
  sleepHours: z.number().min(0).max(24), sleepQuality: z.number().int().min(1).max(5),
  sleepDisturbances: z.number().int().min(0).max(20), physicalActivityType: z.string().trim().max(100).nullable().optional(),
  physicalActivityMinutes: z.number().int().min(0).max(1440), socialInteractionFrequency: z.nativeEnum(SocialInteractionFrequency),
  depressionSymptomsPresent: z.boolean(), depressionSeverity: scale10.nullable(),
  anxietySymptomsPresent: z.boolean(), anxietySymptomSeverity: scale10.nullable(), notes: z.string().trim().max(2000).nullable().optional()
}).superRefine((data, ctx) => {
  if (data.depressionSymptomsPresent !== (data.depressionSeverity !== null)) ctx.addIssue({ code: 'custom', path: ['depressionSeverity'], message: 'Match severity to symptom presence.' });
  if (data.anxietySymptomsPresent !== (data.anxietySymptomSeverity !== null)) ctx.addIssue({ code: 'custom', path: ['anxietySymptomSeverity'], message: 'Match severity to symptom presence.' });
});

export const logsQuerySchema = z.object({ from: z.string().date(), to: z.string().date() }).refine(({ from, to }) => from <= to, { message: 'from must be before to' });
export type DailyLogInput = z.infer<typeof dailyLogSchema>;

