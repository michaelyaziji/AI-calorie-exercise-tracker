import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_AxqheJ3rW0ym@ep-still-heart-a6lkqq5f.us-west-2.aws.neon.tech/neondb?sslmode=require";

const pool = new Pool({ 
  connectionString,
  maxConnections: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  keepAlive: true
});

// Add error handling for the connection pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const db = drizzle(pool);