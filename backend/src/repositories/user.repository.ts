import { AppDataSource } from '../config/data-source';
import { User } from '../entities/user.entity';

export const findUserByGoogleId = (googleId: string): Promise<User | null> => AppDataSource.getRepository(User).findOneBy({ googleId });
export const findUserById = (id: string): Promise<User | null> => AppDataSource.getRepository(User).findOneBy({ id });
export const saveUser = (user: Partial<User>): Promise<User> => AppDataSource.getRepository(User).save(AppDataSource.getRepository(User).create(user));

