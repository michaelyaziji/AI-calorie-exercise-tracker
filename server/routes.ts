import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeFoodImage } from "./ai";
import { insertUserSchema, insertMealSchema, insertProgressSchema, insertExerciseSchema } from "@shared/schema";
import { z } from "zod";
import rateLimit from "express-rate-limit";

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
  standardHeaders: true, // Send standard rate limit headers
  legacyHeaders: false, // Don't send legacy rate limit headers
  trustProxy: true // Trust X-Forwarded-For header
});

export function registerRoutes(app: Express): Server {
  // Trust proxy - required for rate limiting to work properly behind a proxy
  app.set('trust proxy', 1);

  // Apply rate limiting to all routes
  app.use(limiter);

  // User routes
  app.post("/api/users", async (req, res, next) => {
    try {
      const userData = await insertUserSchema.parseAsync(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/users/:id", async (req, res, next) => {
    try {
      const user = await storage.getUser(Number(req.params.id));
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      // Don't send password in response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  });

  // Meal routes
  app.post("/api/meals", async (req, res, next) => {
    try {
      const mealInput = await z.object({
        imageBase64: z.string(),
        userId: z.number()
      }).parseAsync(req.body);

      const nutritionInfo = await analyzeFoodImage(mealInput.imageBase64);

      // Store image URL instead of base64
      const imageUrl = `${process.env.STORAGE_URL}/meals/${Date.now()}.jpg`;
      // TODO: Implement proper image storage service

      const meal = await insertMealSchema.parseAsync({
        userId: mealInput.userId,
        imageUrl,
        ...nutritionInfo
      });

      const createdMeal = await storage.createMeal(meal);
      res.json(createdMeal);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/users/:userId/meals", async (req, res, next) => {
    try {
      const meals = await storage.getMealsByUserId(Number(req.params.userId));
      res.json(meals);
    } catch (error) {
      next(error);
    }
  });

  // Progress routes
  app.post("/api/progress", async (req, res, next) => {
    try {
      const progressData = await insertProgressSchema.parseAsync(req.body);
      const progress = await storage.createProgress(progressData);
      res.json(progress);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/users/:userId/progress", async (req, res, next) => {
    try {
      const progress = await storage.getProgressByUserId(Number(req.params.userId));
      res.json(progress);
    } catch (error) {
      next(error);
    }
  });

  // Exercise routes
  app.post("/api/exercises", async (req, res, next) => {
    try {
      const exerciseData = await insertExerciseSchema.parseAsync(req.body);
      const exercise = await storage.createExercise(exerciseData);
      res.json(exercise);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/users/:userId/exercises", async (req, res, next) => {
    try {
      const exercises = await storage.getExercisesByUserId(Number(req.params.userId));
      res.json(exercises);
    } catch (error) {
      next(error);
    }
  });

  // Register error handler
  app.use(errorHandler);

  const httpServer = createServer(app);
  return httpServer;
}