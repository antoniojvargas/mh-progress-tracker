import { Server as HttpServer } from 'node:http';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import { env } from '../config/env';

export let io: Server;
export const createSocketGateway = (server: HttpServer): Server => {
  io = new Server(server, { cors: { origin: env.frontendUrl, credentials: true } });
  io.use((socket, next) => {
    try {
      const token = cookie.parse(socket.handshake.headers.cookie ?? '').session;
      if (!token) throw new Error('Missing session cookie');
      const payload = jwt.verify(token, env.jwtSecret) as { sub: string };
      socket.data.userId = payload.sub;
      next();
    } catch { next(new Error('Authentication required')); }
  });
  io.on('connection', (socket) => socket.join(`user:${socket.data.userId}`));
  return io;
};
