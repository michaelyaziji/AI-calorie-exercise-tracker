import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeFoodImage } from "./ai";
import { insertMealSchema, insertProgressSchema, insertExerciseSchema } from "@shared/schema";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { setupAuth } from "./auth";

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

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

export function registerRoutes(app: Express): Server {
  app.set('trust proxy', 1);
  app.use(limiter);

  // Setup authentication routes and middleware
  setupAuth(app);

  // Protected routes - must be authenticated
  app.use("/api/meals", (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    next();
  });

  // Meal routes
  app.post("/api/meals", async (req, res, next) => {
    try {
      const mealInput = await z.object({
        imageBase64: z.string(),
      }).parseAsync(req.body);

      const nutritionInfo = await analyzeFoodImage(mealInput.imageBase64);
      const imageUrl = `${process.env.STORAGE_URL}/meals/${Date.now()}.jpg`;

      const meal = await insertMealSchema.parseAsync({
        userId: req.user!.id,
        imageUrl,
        ...nutritionInfo
      });

      const createdMeal = await storage.createMeal(meal);
      res.json(createdMeal);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/meals", async (req, res, next) => {
    try {
      const meals = await storage.getMealsByUserId(req.user!.id);
      res.json(meals);
    } catch (error) {
      next(error);
    }
  });

  // Progress routes
  app.post("/api/progress", async (req, res, next) => {
    try {
      const progressData = await insertProgressSchema.parseAsync({
        ...req.body,
        userId: req.user!.id
      });
      const progress = await storage.createProgress(progressData);
      res.json(progress);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/progress", async (req, res, next) => {
    try {
      const progress = await storage.getProgressByUserId(req.user!.id);
      res.json(progress);
    } catch (error) {
      next(error);
    }
  });

  // Exercise routes
  app.post("/api/exercises", async (req, res, next) => {
    try {
      const exerciseData = await insertExerciseSchema.parseAsync({
        ...req.body,
        userId: req.user!.id
      });
      const exercise = await storage.createExercise(exerciseData);
      res.json(exercise);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/exercises", async (req, res, next) => {
    try {
      const exercises = await storage.getExercisesByUserId(req.user!.id);
      res.json(exercises);
    } catch (error) {
      next(error);
    }
  });

  app.use(errorHandler);

  const httpServer = createServer(app);
  return httpServer;
}