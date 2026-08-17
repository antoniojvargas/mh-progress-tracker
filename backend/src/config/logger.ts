type LogContext = Record<string, unknown>;
type LogLevel = 'info' | 'warn' | 'error';

const serializeError = (error: unknown): Record<string, string> => {
  if (error instanceof Error) return { name: error.name, message: error.message, stack: error.stack ?? '' };
  return { message: String(error) };
};

const write = (level: LogLevel, message: string, context: LogContext = {}): void => {
  const { error, ...details } = context;
  const entry = { timestamp: new Date().toISOString(), level, message, ...details, ...(error === undefined ? {} : { error: serializeError(error) }) };
  console[level](JSON.stringify(entry));
};

export const logger = {
  info: (message: string, context?: LogContext): void => write('info', message, context),
  warn: (message: string, context?: LogContext): void => write('warn', message, context),
  error: (message: string, context?: LogContext): void => write('error', message, context),
};
