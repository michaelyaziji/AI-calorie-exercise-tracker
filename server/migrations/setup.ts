import { pool } from '../db';
import { sql } from 'drizzle-orm';
import * as schema from '@shared/schema';

async function setupDatabase() {
  console.log('Starting database setup...');
  console.log('Database URL:', process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@')); // Hide password
  console.log('Environment:', process.env.NODE_ENV);
  
  try {
    console.log('Creating users table...');
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
    console.log('Users table created successfully');

    console.log('Creating meals table...');
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
    console.log('Meals table created successfully');

    console.log('Creating progress table...');
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
    console.log('Progress table created successfully');

    console.log('Creating exercises table...');
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
    console.log('Exercises table created successfully');

    console.log('Creating session table...');
    // Create session table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
      );
    `);
    console.log('Session table created successfully');

    console.log('All database tables created successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  } finally {
    console.log('Closing database connection...');
    await pool.end();
    console.log('Database connection closed');
  }
}

// Execute the function
console.log('Starting database setup script...');
setupDatabase().catch((error) => {
  console.error('Fatal error in setup script:', error);
  process.exit(1);
}); 