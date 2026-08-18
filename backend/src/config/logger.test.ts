import { logger } from './logger';

describe('logger', () => {
  const originalDate = global.Date;

  afterEach(() => {
    global.Date = originalDate;
    jest.restoreAllMocks();
  });

  it('writes info entries as JSON with a timestamp and context', () => {
    const spy = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    logger.info('user logged in', { userId: 'abc' });
    expect(spy).toHaveBeenCalledTimes(1);
    const entry = JSON.parse(spy.mock.calls[0][0] as string);
    expect(entry).toMatchObject({ level: 'info', message: 'user logged in', userId: 'abc' });
    expect(typeof entry.timestamp).toBe('string');
  });

  it('serializes Error instances under the error key', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    logger.error('something failed', { error: new Error('boom') });
    const entry = JSON.parse(spy.mock.calls[0][0] as string);
    expect(entry.level).toBe('error');
    expect(entry.error).toMatchObject({ name: 'Error', message: 'boom' });
    expect(typeof entry.error.stack).toBe('string');
  });

  it('serializes non-Error values under the error key', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    logger.warn('unexpected value', { error: 'plain string failure' });
    const entry = JSON.parse(spy.mock.calls[0][0] as string);
    expect(entry.error).toEqual({ message: 'plain string failure' });
  });

  it('omits the error key entirely when no error is provided', () => {
    const spy = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    logger.info('no error here');
    const entry = JSON.parse(spy.mock.calls[0][0] as string);
    expect(entry).not.toHaveProperty('error');
  });
});
