const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
export const apiBaseUrl = apiUrl.replace(/\/api$/, '');
export const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${apiUrl}${path}`, { ...init, credentials: 'include', headers: { 'Content-Type': 'application/json', ...init?.headers } });
  if (!response.ok) { const body = await response.json().catch(() => null); throw new Error(body?.error?.message ?? 'No fue posible completar la solicitud.'); }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
};

