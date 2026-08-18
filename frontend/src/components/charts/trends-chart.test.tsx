import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TrendsChart } from './trends-chart';
import { DailyLog } from '../../types/daily-log';

const buildLog = (overrides: Partial<DailyLog>): DailyLog => ({
  id: 'log-1', logDate: '2026-08-18', moodRating: 7, anxietyLevel: 3, stressLevel: 4, sleepHours: 7.5, sleepQuality: 4,
  sleepDisturbances: 0, physicalActivityType: null, physicalActivityMinutes: 30, socialInteractionFrequency: 'moderate',
  depressionSymptomsPresent: false, depressionSeverity: null, anxietySymptomsPresent: false, anxietySymptomSeverity: null,
  notes: null, ...overrides,
});

describe('TrendsChart', () => {
  it('renders an accessible chart region for the given logs and metrics', () => {
    render(<TrendsChart logs={[buildLog({})]} metrics={['moodRating', 'anxietyLevel']} />);

    expect(screen.getByRole('img', { name: 'Gráfica de tendencias de bienestar' })).toBeInTheDocument();
  });
});
