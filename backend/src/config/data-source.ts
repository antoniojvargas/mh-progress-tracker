import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from './env';
import { User } from '../entities/user.entity';
import { DailyLog } from '../entities/daily-log.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: env.databaseUrl,
  entities: [User, DailyLog],
  migrations: [`${__dirname}/../migrations/*.{ts,js}`],
  synchronize: false,
  logging: false
});

