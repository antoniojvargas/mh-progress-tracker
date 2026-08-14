import { io } from 'socket.io-client';
import { apiBaseUrl } from '../services/api-client';
export const socket = io(apiBaseUrl, { withCredentials: true, autoConnect: false });

