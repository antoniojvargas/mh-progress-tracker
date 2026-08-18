import { dailyLogSchema, logsQuerySchema } from './daily-log.schema';

const validPayload = {
  logDate: '2026-08-18',
  moodRating: 7,
  anxietyLevel: 3,
  stressLevel: 4,
  sleepHours: 7.5,
  sleepQuality: 4,
  sleepDisturbances: 0,
  physicalActivityType: 'caminar',
  physicalActivityMinutes: 30,
  socialInteractionFrequency: 'moderate',
  depressionSymptomsPresent: false,
  depressionSeverity: null,
  anxietySymptomsPresent: false,
  anxietySymptomSeverity: null,
  notes: null,
};

describe('dailyLogSchema', () => {
  it('accepts a fully valid payload', () => {
    const result = dailyLogSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('rejects a rating outside the 1-10 scale', () => {
    const result = dailyLogSchema.safeParse({ ...validPayload, moodRating: 11 });
    expect(result.success).toBe(false);
  });

  it('rejects when depressionSymptomsPresent is true but severity is missing', () => {
    const result = dailyLogSchema.safeParse({ ...validPayload, depressionSymptomsPresent: true, depressionSeverity: null });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.depressionSeverity).toBeDefined();
    }
  });

  it('rejects when depressionSymptomsPresent is false but severity is set', () => {
    const result = dailyLogSchema.safeParse({ ...validPayload, depressionSymptomsPresent: false, depressionSeverity: 5 });
    expect(result.success).toBe(false);
  });

  it('accepts a matching anxiety symptom and severity pair', () => {
    const result = dailyLogSchema.safeParse({ ...validPayload, anxietySymptomsPresent: true, anxietySymptomSeverity: 6 });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid socialInteractionFrequency value', () => {
    const result = dailyLogSchema.safeParse({ ...validPayload, socialInteractionFrequency: 'extreme' });
    expect(result.success).toBe(false);
  });
});

describe('logsQuerySchema', () => {
  it('accepts a range where from is before to', () => {
    const result = logsQuerySchema.safeParse({ from: '2026-08-01', to: '2026-08-18' });
    expect(result.success).toBe(true);
  });

  it('accepts a range where from equals to', () => {
    const result = logsQuerySchema.safeParse({ from: '2026-08-18', to: '2026-08-18' });
    expect(result.success).toBe(true);
  });

  it('rejects a range where from is after to', () => {
    const result = logsQuerySchema.safeParse({ from: '2026-08-18', to: '2026-08-01' });
    expect(result.success).toBe(false);
  });

  it('rejects a malformed date', () => {
    const result = logsQuerySchema.safeParse({ from: 'not-a-date', to: '2026-08-18' });
    expect(result.success).toBe(false);
  });
});
