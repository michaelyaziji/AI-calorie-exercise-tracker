import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeFoodImage } from "./ai";
import { insertUserSchema, insertMealSchema, insertProgressSchema, insertExerciseSchema } from "@shared/schema";
import { z } from "zod";

export function registerRoutes(app: Express): Server {
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unknown error occurred" });
      }
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(Number(req.params.id));
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  });

  // Meal routes
  app.post("/api/meals", async (req, res) => {
    try {
      // Validate input
      const mealInput = z.object({
        imageBase64: z.string()
          .min(1, "Image data is required")
          .refine(
            (val) => val.startsWith('data:image'),
            "Invalid image format"
          ),
        userId: z.number().positive("Invalid user ID")
      }).parse(req.body);

      // Verify user exists
      const user = await storage.getUser(mealInput.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Process image with error handling
      let nutritionInfo;
      try {
        nutritionInfo = await analyzeFoodImage(mealInput.imageBase64);
      } catch (error) {
        console.error('Image analysis failed:', error);
        return res.status(422).json({ 
          error: "Failed to analyze food image",
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }

      // Create meal with validated data
      const meal = insertMealSchema.parse({
        userId: mealInput.userId,
        imageUrl: mealInput.imageBase64,
        ...nutritionInfo
      });

      const createdMeal = await storage.createMeal(meal);
      res.json(createdMeal);

    } catch (error: unknown) {
      console.error('Meal creation failed:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      } else if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unknown error occurred" });
      }
    }
  });

  app.get("/api/users/:userId/meals", async (req, res) => {
    const meals = await storage.getMealsByUserId(Number(req.params.userId));
    res.json(meals);
  });

  // Progress routes
  app.post("/api/progress", async (req, res) => {
    try {
      const progressData = insertProgressSchema.parse(req.body);
      const progress = await storage.createProgress(progressData);
      res.json(progress);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unknown error occurred" });
      }
    }
  });

  app.get("/api/users/:userId/progress", async (req, res) => {
    const progress = await storage.getProgressByUserId(Number(req.params.userId));
    res.json(progress);
  });

  // Exercise routes
  app.post("/api/exercises", async (req, res) => {
    try {
      const exerciseData = insertExerciseSchema.parse(req.body);
      const exercise = await storage.createExercise(exerciseData);
      res.json(exercise);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unknown error occurred" });
      }
    }
  });

  app.get("/api/users/:userId/exercises", async (req, res) => {
    const exercises = await storage.getExercisesByUserId(Number(req.params.userId));
    res.json(exercises);
  });

  const httpServer = createServer(app);
  return httpServer;
}