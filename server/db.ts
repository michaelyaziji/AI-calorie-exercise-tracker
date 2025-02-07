import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_AxqheJ3rW0ym@ep-still-heart-a6lkqq5f.us-west-2.aws.neon.tech/neondb?sslmode=require";

const sql = neon(connectionString, { 
  max: 1,
  idleTimeoutMillis: 0,
  connectionTimeoutMillis: 0,
  keepAlive: true
});

export const db = drizzle(sql);