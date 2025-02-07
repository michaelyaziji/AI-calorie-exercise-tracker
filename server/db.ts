import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

// Configure the WebSocket implementation for Node.js environment
if (!globalThis.WebSocket) {
  (globalThis as any).WebSocket = ws;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Configure the pool with recommended settings for serverless and maxConnections from original
const pool = new Pool({ 
  connectionString,
  maxConnections: 10, // Retained from original
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  keepAlive: true,
});

// Add error handling for the connection pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const db = drizzle(pool);