import { pool } from './db';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createSessionTable() {
  try {
    // First check if the table exists
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'session'
      );
    `);

    if (!tableExists.rows[0].exists) {
      // Create the session table if it doesn't exist
      await pool.query(`
        CREATE TABLE "session" (
          "sid" varchar NOT NULL COLLATE "default",
          "sess" json NOT NULL,
          "expire" timestamp(6) NOT NULL,
          CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
        );
      `);
      console.log('Session table created successfully');
    } else {
      console.log('Session table already exists');
    }
  } catch (error) {
    console.error('Error managing session table:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Execute the function
createSessionTable().catch(console.error); 