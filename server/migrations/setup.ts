import { pool } from '../db';
import { sql } from 'drizzle-orm';
import * as schema from '@shared/schema';

async function setupDatabase() {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" serial PRIMARY KEY,
        "username" text NOT NULL UNIQUE,
        "password" text NOT NULL,
        "gender" text NOT NULL,
        "height" real NOT NULL,
        "weight" real NOT NULL,
        "target_weight" real NOT NULL,
        "activity_level" text NOT NULL,
        "workouts_per_week" integer NOT NULL,
        "social_source" text NOT NULL,
        "daily_calories" integer NOT NULL DEFAULT 2000,
        "daily_protein" real NOT NULL DEFAULT 150,
        "daily_carbs" real NOT NULL DEFAULT 200,
        "daily_fat" real NOT NULL DEFAULT 50
      );
      CREATE INDEX IF NOT EXISTS "username_idx" ON "users" ("username");
    `);

    // Create meals table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "meals" (
        "id" serial PRIMARY KEY,
        "user_id" integer NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
        "image_url" text NOT NULL,
        "calories" integer NOT NULL,
        "protein" real NOT NULL,
        "carbs" real NOT NULL,
        "fat" real NOT NULL,
        "timestamp" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS "meals_user_id_idx" ON "meals" ("user_id");
      CREATE INDEX IF NOT EXISTS "meals_timestamp_idx" ON "meals" ("timestamp");
    `);

    // Create progress table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "progress" (
        "id" serial PRIMARY KEY,
        "user_id" integer NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
        "weight" real NOT NULL,
        "timestamp" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS "progress_user_id_idx" ON "progress" ("user_id");
      CREATE INDEX IF NOT EXISTS "progress_timestamp_idx" ON "progress" ("timestamp");
    `);

    // Create exercises table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "exercises" (
        "id" serial PRIMARY KEY,
        "user_id" integer NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
        "type" text NOT NULL,
        "intensity" text,
        "duration" integer,
        "description" text,
        "timestamp" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS "exercises_user_id_idx" ON "exercises" ("user_id");
      CREATE INDEX IF NOT EXISTS "exercises_timestamp_idx" ON "exercises" ("timestamp");
    `);

    // Create session table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
      );
    `);

    console.log('All database tables created successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Execute the function
setupDatabase().catch(console.error); 