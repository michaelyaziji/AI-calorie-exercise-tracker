import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { config } from './config';

neonConfig.webSocketConstructor = ws;

export const pool = new Pool({ connectionString: config.databaseUrl });
export const db = drizzle({ client: pool, schema });

// Add error handling for the connection pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});