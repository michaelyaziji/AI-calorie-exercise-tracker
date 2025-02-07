import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { WebSocket } from "ws";

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_AxqheJ3rW0ym@ep-still-heart-a6lkqq5f.us-west-2.aws.neon.tech/neondb?sslmode=require";

// Enable WebSocket pooling
neonConfig.webSocketConstructor = WebSocket;
neonConfig.useSecureWebSocket = true;
neonConfig.fetchConnectionCache = true;

const sql = neon(connectionString);
export const db = drizzle(sql);