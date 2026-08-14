import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { DailyLog } from './daily-log.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ unique: true }) googleId!: string;
  @Column({ unique: true }) email!: string;
  @Column() displayName!: string;
  @Column({ type: 'varchar', nullable: true }) avatarUrl!: string | null;
  @OneToMany(() => DailyLog, (log) => log.user) logs!: DailyLog[];
  @CreateDateColumn({ type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ type: 'timestamptz' }) updatedAt!: Date;
}
