export type SocialInteractionFrequency = 'none' | 'low' | 'moderate' | 'high';
export type DailyLog = { id: string; logDate: string; moodRating: number; anxietyLevel: number; stressLevel: number; sleepHours: number; sleepQuality: number; sleepDisturbances: number; physicalActivityType: string | null; physicalActivityMinutes: number; socialInteractionFrequency: SocialInteractionFrequency; depressionSymptomsPresent: boolean; depressionSeverity: number | null; anxietySymptomsPresent: boolean; anxietySymptomSeverity: number | null; notes: string | null };
export type DailyLogInput = Omit<DailyLog, 'id'>;
export type User = { id: string; email: string; displayName: string; avatarUrl: string | null };
export type ChartMetric = 'moodRating' | 'anxietyLevel' | 'stressLevel' | 'sleepHours' | 'sleepQuality' | 'physicalActivityMinutes';
export const chartMetrics: Record<ChartMetric, string> = { moodRating: 'Estado de ánimo', anxietyLevel: 'Ansiedad', stressLevel: 'Estrés', sleepHours: 'Horas de sueño', sleepQuality: 'Calidad de sueño', physicalActivityMinutes: 'Actividad (min)' };

