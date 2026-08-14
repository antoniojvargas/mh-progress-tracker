import { useCallback, useEffect, useState } from 'react';
import { getLogs } from '../services/logs.api';
import { DailyLog } from '../types/daily-log';
const dateString = (date: Date) => date.toISOString().slice(0, 10);
export const useDailyLogs = (days: number) => {
  const [logs, setLogs] = useState<DailyLog[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => { setLoading(true); setError(null); const to = dateString(new Date()); const fromDate = new Date(); fromDate.setDate(fromDate.getDate() - days + 1); try { setLogs((await getLogs(dateString(fromDate), to)).data); } catch (cause) { setError(cause instanceof Error ? cause.message : 'No fue posible cargar tus registros.'); } finally { setLoading(false); } }, [days]);
  useEffect(() => { void load(); }, [load]);
  const addLog = useCallback((log: DailyLog) => setLogs((current) => [...current.filter((item) => item.id !== log.id), log].sort((a, b) => a.logDate.localeCompare(b.logDate))), []);
  return { logs, loading, error, load, addLog };
};

