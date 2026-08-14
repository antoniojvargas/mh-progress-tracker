import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

export enum SocialInteractionFrequency {
  None = 'none', Low = 'low', Moderate = 'moderate', High = 'high'
}

@Entity({ name: 'daily_logs' })
@Index(['userId', 'logDate'], { unique: true })
export class DailyLog {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'user_id', type: 'uuid' }) userId!: string;
  @ManyToOne(() => User, (user) => user.logs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' }) user!: User;
  @Column({ name: 'log_date', type: 'date' }) logDate!: string;
  @Column({ name: 'mood_rating', type: 'smallint' }) moodRating!: number;
  @Column({ name: 'anxiety_level', type: 'smallint' }) anxietyLevel!: number;
  @Column({ name: 'stress_level', type: 'smallint' }) stressLevel!: number;
  @Column({ name: 'sleep_hours', type: 'numeric', precision: 3, scale: 1 }) sleepHours!: string;
  @Column({ name: 'sleep_quality', type: 'smallint' }) sleepQuality!: number;
  @Column({ name: 'sleep_disturbances', type: 'smallint' }) sleepDisturbances!: number;
  @Column({ name: 'physical_activity_type', type: 'varchar', nullable: true }) physicalActivityType!: string | null;
  @Column({ name: 'physical_activity_minutes', type: 'smallint', default: 0 }) physicalActivityMinutes!: number;
  @Column({ name: 'social_interaction_frequency', type: 'enum', enum: SocialInteractionFrequency }) socialInteractionFrequency!: SocialInteractionFrequency;
  @Column({ name: 'depression_symptoms_present', type: 'boolean' }) depressionSymptomsPresent!: boolean;
  @Column({ name: 'depression_severity', type: 'smallint', nullable: true }) depressionSeverity!: number | null;
  @Column({ name: 'anxiety_symptoms_present', type: 'boolean' }) anxietySymptomsPresent!: boolean;
  @Column({ name: 'anxiety_symptom_severity', type: 'smallint', nullable: true }) anxietySymptomSeverity!: number | null;
  @Column({ type: 'text', nullable: true }) notes!: string | null;
  @CreateDateColumn({ type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ type: 'timestamptz' }) updatedAt!: Date;
}
