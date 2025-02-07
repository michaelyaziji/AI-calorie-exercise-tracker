import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeFoodImage } from "./ai";
import { insertUserSchema, insertMealSchema, insertProgressSchema, insertExerciseSchema } from "@shared/schema";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import session from "express-session";
import bcrypt from "bcryptjs";
import MemoryStore from "memorystore";

// Add session type declaration
declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

const MemoryStoreSession = MemoryStore(session);

// Session middleware with secure configuration
const sessionMiddleware = session({
  secret: process.env.REPL_ID!, // Use REPL_ID as session secret
  resave: false,
  saveUninitialized: false,
  store: new MemoryStoreSession({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  },
});

// Authentication middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

// Error handler middleware
function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error(err.stack);
  if (err instanceof z.ZodError) {
    res.status(400).json({
      error: "Validation error",
      details: err.errors
    });
  } else {
    res.status(500).json({
      error: "Internal server error",
      message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
    });
  }
}

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

export function registerRoutes(app: Express): Server {
  app.set('trust proxy', 1);
  app.use(limiter);
  app.use(sessionMiddleware);

  // Auth routes
  app.post("/api/login", async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);

      if (!user || !(await bcrypt.compare(password, user.password))) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      req.session.userId = user.id;
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          resolve();
        });
      });

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.sendStatus(200);
    });
  });

  // User routes
  app.post("/api/users", async (req, res, next) => {
    try {
      const userData = await insertUserSchema.parseAsync(req.body);
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      // Set session immediately after user creation
      req.session.userId = user.id;
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          resolve(null);
        });
      });

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/users/me", requireAuth, async (req, res, next) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  });

  // Meal routes
  app.post("/api/meals", requireAuth, async (req, res, next) => {
    try {
      const mealInput = await z.object({
        imageBase64: z.string(),
      }).parseAsync(req.body);

      const nutritionInfo = await analyzeFoodImage(mealInput.imageBase64);

      const imageUrl = `${process.env.STORAGE_URL}/meals/${Date.now()}.jpg`;

      const meal = await insertMealSchema.parseAsync({
        userId: req.session.userId!,
        imageUrl,
        ...nutritionInfo
      });

      const createdMeal = await storage.createMeal(meal);
      res.json(createdMeal);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/meals", requireAuth, async (req, res, next) => {
    try {
      const meals = await storage.getMealsByUserId(req.session.userId!);
      res.json(meals);
    } catch (error) {
      next(error);
    }
  });

  // Progress routes
  app.post("/api/progress", requireAuth, async (req, res, next) => {
    try {
      const progressData = await insertProgressSchema.parseAsync({
        ...req.body,
        userId: req.session.userId!
      });
      const progress = await storage.createProgress(progressData);
      res.json(progress);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/progress", requireAuth, async (req, res, next) => {
    try {
      const progress = await storage.getProgressByUserId(req.session.userId!);
      res.json(progress);
    } catch (error) {
      next(error);
    }
  });

  // Exercise routes
  app.post("/api/exercises", requireAuth, async (req, res, next) => {
    try {
      const exerciseData = await insertExerciseSchema.parseAsync({
        ...req.body,
        userId: req.session.userId!
      });
      const exercise = await storage.createExercise(exerciseData);
      res.json(exercise);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/exercises", requireAuth, async (req, res, next) => {
    try {
      const exercises = await storage.getExercisesByUserId(req.session.userId!);
      res.json(exercises);
    } catch (error) {
      next(error);
    }
  });

  app.use(errorHandler);

  const httpServer = createServer(app);
  return httpServer;
}