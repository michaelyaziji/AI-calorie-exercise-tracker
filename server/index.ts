import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { config } from './config';
import rateLimit from 'express-rate-limit';

const app = express();

// Configure different rate limits for different routes
const registerLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 10, // 10 requests per minute
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." }
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 10, // 10 requests per minute
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." }
});

const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 100, // 100 requests per minute
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." }
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Apply rate limiting based on route
app.use('/api/register', registerLimiter); // More lenient for registration
app.use('/api/login', authLimiter);
app.use('/api', strictLimiter); // Default limiter for other API routes

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Error:', err);
    
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    const stack = config.nodeEnv === 'development' ? err.stack : undefined;

    res.status(status).json({ 
      message,
      ...(stack && { stack }),
      timestamp: new Date().toISOString()
    });
  });

  if (config.nodeEnv === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  server.listen(config.port, () => {
    log(`Server running at http://0.0.0.0:${config.port}`);
    log(`Environment: ${config.nodeEnv}`);
  });
})();