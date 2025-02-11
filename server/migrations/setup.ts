import { Pool } from '@neondatabase/serverless';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';

async function main() {
  try {
    console.log('Configuring database connection...');
    
    // Configure WebSocket for Neon
    neonConfig.webSocketConstructor = ws;

    // Validate environment variables
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL environment variable is not set');
      process.exit(1);
    }

    console.log('Creating database pool...');
    // Create a new pool for migrations
    const migrationPool = new Pool({ connectionString: process.env.DATABASE_URL });

    console.log('Starting database setup...');
    console.log('Database URL:', process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@')); // Hide password
    console.log('Environment:', process.env.NODE_ENV);
    
    try {
      // Test database connection
      console.log('Testing database connection...');
      const testResult = await migrationPool.query('SELECT 1');
      console.log('Database connection successful:', testResult.rows);

      console.log('Creating users table...');
      // Create users table
      await migrationPool.query(`
        DROP TABLE IF EXISTS "exercises" CASCADE;
        DROP TABLE IF EXISTS "meals" CASCADE;
        DROP TABLE IF EXISTS "progress" CASCADE;
        DROP TABLE IF EXISTS "session" CASCADE;
        DROP TABLE IF EXISTS "users" CASCADE;

        CREATE TABLE "users" (
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
        CREATE INDEX "username_idx" ON "users" ("username");
      `);
      console.log('Users table created successfully');

      console.log('Creating meals table...');
      // Create meals table
      await migrationPool.query(`
        CREATE TABLE "meals" (
          "id" serial PRIMARY KEY,
          "user_id" integer NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
          "image_url" text NOT NULL,
          "calories" integer NOT NULL,
          "protein" real NOT NULL,
          "carbs" real NOT NULL,
          "fat" real NOT NULL,
          "timestamp" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX "meals_user_id_idx" ON "meals" ("user_id");
        CREATE INDEX "meals_timestamp_idx" ON "meals" ("timestamp");
      `);
      console.log('Meals table created successfully');

      console.log('Creating progress table...');
      // Create progress table
      await migrationPool.query(`
        CREATE TABLE "progress" (
          "id" serial PRIMARY KEY,
          "user_id" integer NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
          "weight" real NOT NULL,
          "timestamp" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX "progress_user_id_idx" ON "progress" ("user_id");
        CREATE INDEX "progress_timestamp_idx" ON "progress" ("timestamp");
      `);
      console.log('Progress table created successfully');

      console.log('Creating exercises table...');
      // Create exercises table
      await migrationPool.query(`
        CREATE TABLE "exercises" (
          "id" serial PRIMARY KEY,
          "user_id" integer NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
          "type" text NOT NULL,
          "intensity" text,
          "duration" integer,
          "description" text,
          "timestamp" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX "exercises_user_id_idx" ON "exercises" ("user_id");
        CREATE INDEX "exercises_timestamp_idx" ON "exercises" ("timestamp");
      `);
      console.log('Exercises table created successfully');

      console.log('Creating session table...');
      // Create session table
      await migrationPool.query(`
        CREATE TABLE "session" (
          "sid" varchar NOT NULL COLLATE "default",
          "sess" json NOT NULL,
          "expire" timestamp(6) NOT NULL,
          CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
        );
      `);
      console.log('Session table created successfully');

      // Verify tables were created
      console.log('Verifying tables...');
      const tables = await migrationPool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE';
      `);
      console.log('Created tables:', tables.rows.map(row => row.table_name));

      console.log('All database tables created successfully');
    } finally {
      console.log('Closing database connection...');
      try {
        await migrationPool.end();
        console.log('Database connection closed');
      } catch (error) {
        console.error('Error closing database connection:', error);
      }
    }
  } catch (error) {
    console.error('Error in main:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  }
}

// Execute the function
console.log('Starting database setup script...');
main().catch((error) => {
  console.error('Fatal error in setup script:', error);
  process.exit(1);
}); 