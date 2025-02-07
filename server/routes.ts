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
      const mealInput = z.object({
        imageBase64: z.string(),
        userId: z.number()
      }).parse(req.body);

      const nutritionInfo = await analyzeFoodImage(mealInput.imageBase64);
      const meal = insertMealSchema.parse({
        userId: mealInput.userId,
        imageUrl: `data:image/jpeg;base64,${mealInput.imageBase64}`,
        ...nutritionInfo
      });

      const createdMeal = await storage.createMeal(meal);
      res.json(createdMeal);
    } catch (error: unknown) {
      if (error instanceof Error) {
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