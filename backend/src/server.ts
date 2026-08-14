import { createServer } from 'node:http';
import { app } from './app';
import { env } from './config/env';
import { AppDataSource } from './config/data-source';
import { createSocketGateway } from './websocket/socket.gateway';

const start = async (): Promise<void> => {
  await AppDataSource.initialize();
  const server = createServer(app);
  createSocketGateway(server);
  server.listen(env.port, () => console.log(`API listening on port ${env.port}`));
};
start().catch((error) => { console.error('Unable to start API', error); process.exit(1); });
