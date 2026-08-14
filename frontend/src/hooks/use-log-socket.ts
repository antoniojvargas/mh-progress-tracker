import { useEffect } from 'react';
import { socket } from '../socket/socket-client';
import { DailyLog } from '../types/daily-log';
export const useLogSocket = (onCreated: (log: DailyLog) => void) => {
  useEffect(() => { socket.connect(); socket.on('daily-log:created', onCreated); return () => { socket.off('daily-log:created', onCreated); socket.disconnect(); }; }, [onCreated]);
};

