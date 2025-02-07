import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeFoodImage } from "./ai";
import { insertUserSchema, insertMealSchema, insertProgressSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
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
      const { imageBase64, ...mealData } = req.body;
      const nutritionInfo = await analyzeFoodImage(imageBase64);
      const meal = insertMealSchema.parse({ ...mealData, ...nutritionInfo });
      const createdMeal = await storage.createMeal(meal);
      res.json(createdMeal);
    } catch (error) {
      res.status(400).json({ error: error.message });
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
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/users/:userId/progress", async (req, res) => {
    const progress = await storage.getProgressByUserId(Number(req.params.userId));
    res.json(progress);
  });

  const httpServer = createServer(app);
  return httpServer;
}
