import { createServer } from 'node:http';
import { app } from './app';
import { env } from './config/env';
import { AppDataSource } from './config/data-source';
import { logger } from './config/logger';
import { createSocketGateway } from './websocket/socket.gateway';

const start = async (): Promise<void> => {
  await AppDataSource.initialize();
  logger.info('Database connection established');
  const server = createServer(app);
  createSocketGateway(server);
  server.listen(env.port, () => logger.info('API listening', { port: env.port }));
};
start().catch((error) => { logger.error('Unable to start API', { error }); process.exit(1); });
