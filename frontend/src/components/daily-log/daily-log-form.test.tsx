import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DailyLogForm } from './daily-log-form';
import { createLog } from '../../services/logs.api';
import { DailyLog } from '../../types/daily-log';

vi.mock('../../services/logs.api', () => ({ createLog: vi.fn() }));
const mockedCreateLog = vi.mocked(createLog);

const savedLog = { id: 'log-1', logDate: '2026-08-18' } as DailyLog;

describe('DailyLogForm', () => {
  it('submits the default form values and reports the created log', async () => {
    mockedCreateLog.mockResolvedValue({ data: savedLog });
    const onCreated = vi.fn();
    const user = userEvent.setup();
    render(<DailyLogForm onCreated={onCreated} />);

    await user.click(screen.getByRole('button', { name: /Guardar mi registro de hoy/ }));

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(savedLog));
    expect(screen.getByRole('status')).toHaveTextContent('Tu registro está guardado.');
  });

  it('shows an error message and does not report a log when saving fails', async () => {
    mockedCreateLog.mockRejectedValue(new Error('A log already exists for this day.'));
    const onCreated = vi.fn();
    const user = userEvent.setup();
    render(<DailyLogForm onCreated={onCreated} />);

    await user.click(screen.getByRole('button', { name: /Guardar mi registro de hoy/ }));

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('A log already exists for this day.'));
    expect(onCreated).not.toHaveBeenCalled();
  });

  it('reveals a severity range once a symptom checkbox is checked', async () => {
    mockedCreateLog.mockResolvedValue({ data: savedLog });
    const user = userEvent.setup();
    render(<DailyLogForm onCreated={vi.fn()} />);

    expect(screen.queryByText('Intensidad')).not.toBeInTheDocument();
    await user.click(screen.getByLabelText('Síntomas de depresión'));
    expect(screen.getByText('Intensidad')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Guardar mi registro de hoy/ }));

    await waitFor(() => expect(mockedCreateLog).toHaveBeenCalledWith(
      expect.objectContaining({ depressionSymptomsPresent: true, depressionSeverity: 1 }),
    ));
  });
});
