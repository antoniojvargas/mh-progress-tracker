import { User } from '../types/daily-log';
import { request } from './api-client';
export const getCurrentUser = () => request<{ data: User }>('/auth/me');
export const logout = () => request<void>('/auth/logout', { method: 'POST' });

