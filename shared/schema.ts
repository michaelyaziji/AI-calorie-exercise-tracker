import { pgTable, text, serial, integer, boolean, jsonb, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  gender: text("gender").notNull(),
  height: real("height").notNull(),
  weight: real("weight").notNull(),
  targetWeight: real("target_weight").notNull(),
  activityLevel: text("activity_level").notNull(),
  workoutsPerWeek: integer("workouts_per_week").notNull(),
  socialSource: text("social_source").notNull(),
  dailyCalories: integer("daily_calories").notNull().default(2000),
  dailyProtein: real("daily_protein").notNull().default(150),
  dailyCarbs: real("daily_carbs").notNull().default(200),
  dailyFat: real("daily_fat").notNull().default(50),
});

export const meals = pgTable("meals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  imageUrl: text("image_url").notNull(),
  calories: integer("calories").notNull(),
  protein: real("protein").notNull(),
  carbs: real("carbs").notNull(),
  fat: real("fat").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const progress = pgTable("progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  weight: real("weight").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), 
  intensity: text("intensity"), 
  duration: integer("duration"), 
  description: text("description"), 
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertMealSchema = createInsertSchema(meals).omit({ id: true, timestamp: true });
export const insertProgressSchema = createInsertSchema(progress).omit({ id: true, timestamp: true });
export const insertExerciseSchema = createInsertSchema(exercises).omit({ id: true, timestamp: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Meal = typeof meals.$inferSelect;
export type InsertMeal = z.infer<typeof insertMealSchema>;
export type Progress = typeof progress.$inferSelect;
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;