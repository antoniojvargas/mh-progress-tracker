import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersAndDailyLogs001 implements MigrationInterface {
  name = 'CreateUsersAndDailyLogs001';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await queryRunner.query(`CREATE TYPE "social_interaction_frequency_enum" AS ENUM ('none', 'low', 'moderate', 'high')`);
    await queryRunner.query(`CREATE TABLE "users" (
      "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      "googleId" varchar NOT NULL UNIQUE, "email" varchar NOT NULL UNIQUE,
      "displayName" varchar NOT NULL, "avatarUrl" varchar,
      "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now()
    )`);
    await queryRunner.query(`CREATE TABLE "daily_logs" (
      "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "log_date" date NOT NULL, "mood_rating" smallint NOT NULL CHECK ("mood_rating" BETWEEN 1 AND 10),
      "anxiety_level" smallint NOT NULL CHECK ("anxiety_level" BETWEEN 1 AND 10), "stress_level" smallint NOT NULL CHECK ("stress_level" BETWEEN 1 AND 10),
      "sleep_hours" numeric(3,1) NOT NULL CHECK ("sleep_hours" BETWEEN 0 AND 24), "sleep_quality" smallint NOT NULL CHECK ("sleep_quality" BETWEEN 1 AND 5),
      "sleep_disturbances" smallint NOT NULL DEFAULT 0 CHECK ("sleep_disturbances" >= 0), "physical_activity_type" varchar,
      "physical_activity_minutes" smallint NOT NULL DEFAULT 0 CHECK ("physical_activity_minutes" >= 0),
      "social_interaction_frequency" "social_interaction_frequency_enum" NOT NULL, "depression_symptoms_present" boolean NOT NULL,
      "depression_severity" smallint CHECK ("depression_severity" BETWEEN 1 AND 10), "anxiety_symptoms_present" boolean NOT NULL,
      "anxiety_symptom_severity" smallint CHECK ("anxiety_symptom_severity" BETWEEN 1 AND 10), "notes" text,
      "createdAt" timestamptz NOT NULL DEFAULT now(), "updatedAt" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "UQ_daily_logs_user_date" UNIQUE ("user_id", "log_date"),
      CONSTRAINT "CHK_depression_severity" CHECK (("depression_symptoms_present" AND "depression_severity" IS NOT NULL) OR (NOT "depression_symptoms_present" AND "depression_severity" IS NULL)),
      CONSTRAINT "CHK_anxiety_severity" CHECK (("anxiety_symptoms_present" AND "anxiety_symptom_severity" IS NOT NULL) OR (NOT "anxiety_symptoms_present" AND "anxiety_symptom_severity" IS NULL))
    )`);
    await queryRunner.query('CREATE INDEX "IDX_daily_logs_user_date" ON "daily_logs" ("user_id", "log_date")');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "daily_logs"');
    await queryRunner.query('DROP TABLE "users"');
    await queryRunner.query('DROP TYPE "social_interaction_frequency_enum"');
  }
}

