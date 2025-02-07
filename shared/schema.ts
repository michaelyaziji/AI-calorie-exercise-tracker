import { pgTable, text, serial, integer, boolean, jsonb, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

const ACTIVITY_LEVELS = ["sedentary", "light", "moderate", "active", "very_active"] as const;

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
  // Add fields for weightlifting
  sets: integer("sets"),
  reps: integer("reps"),
  weight: real("weight"),
  // Add fields for running
  distance: real("distance"),
  pace: real("pace"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users, {
  username: z.string().min(3).max(50),
  password: z.string().min(8),
  gender: z.enum(["male", "female", "other"]),
  height: z.number().min(50).max(300),
  weight: z.number().min(20).max(500),
  targetWeight: z.number().min(20).max(500),
  activityLevel: z.enum(ACTIVITY_LEVELS),
  workoutsPerWeek: z.number().min(0).max(14),
  socialSource: z.string(),
}).omit({ id: true });

export const insertMealSchema = createInsertSchema(meals).omit({ id: true, timestamp: true });
export const insertProgressSchema = createInsertSchema(progress).omit({ id: true, timestamp: true });
export const insertExerciseSchema = createInsertSchema(exercises, {
  type: z.enum(["custom", "run", "weightlifting"]),
  intensity: z.string().optional(),
  duration: z.number().optional(),
  description: z.string().optional(),
  // Weightlifting specific fields
  sets: z.number().optional(),
  reps: z.number().optional(),
  weight: z.number().optional(),
  // Running specific fields
  distance: z.number().optional(),
  pace: z.number().optional(),
}).omit({ id: true, timestamp: true })
.superRefine((data, ctx) => {
  if (data.type === "weightlifting") {
    if (!data.sets || !data.reps || !data.weight) {
      ctx.addIssue({
        code: "custom",
        message: "Sets, reps, and weight are required for weightlifting exercises",
        path: ["type"],
      });
    }
  } else if (data.type === "run") {
    if (!data.distance || !data.duration) {
      ctx.addIssue({
        code: "custom",
        message: "Distance and duration are required for running exercises",
        path: ["type"],
      });
    }
  }
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Meal = typeof meals.$inferSelect;
export type InsertMeal = z.infer<typeof insertMealSchema>;
export type Progress = typeof progress.$inferSelect;
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;