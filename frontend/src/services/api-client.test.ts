import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiBaseUrl, request } from './api-client';

const jsonResponse = (body: unknown, ok = true, status = 200): Response => ({
  ok,
  status,
  json: async () => body,
} as Response);

describe('apiBaseUrl', () => {
  it('strips a trailing /api segment from the configured API URL', () => {
    expect(apiBaseUrl.endsWith('/api')).toBe(false);
  });
});

describe('request', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    globalThis.fetch = fetchMock;
    fetchMock.mockReset();
  });

  it('sends credentials and a JSON content-type header', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: 'ok' }));

    await request('/logs');

    const [, init] = fetchMock.mock.calls[0];
    expect(init.credentials).toBe('include');
    expect(init.headers['Content-Type']).toBe('application/json');
  });

  it('resolves with the parsed JSON body on success', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: [1, 2, 3] }));

    const result = await request<{ data: number[] }>('/logs');

    expect(result).toEqual({ data: [1, 2, 3] });
  });

  it('returns undefined for a 204 No Content response', async () => {
    fetchMock.mockResolvedValue(jsonResponse(null, true, 204));

    const result = await request('/auth/logout', { method: 'POST' });

    expect(result).toBeUndefined();
  });

  it('throws the server-provided error message when the response is not ok', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: { message: 'Invalid daily log data.' } }, false, 400));

    await expect(request('/logs')).rejects.toThrow('Invalid daily log data.');
  });

  it('falls back to a generic message when the error body cannot be parsed', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500, json: async () => { throw new Error('bad json'); } } as unknown as Response);

    await expect(request('/logs')).rejects.toThrow('No fue posible completar la solicitud.');
  });
});
