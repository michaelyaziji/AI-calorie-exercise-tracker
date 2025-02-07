import { pgTable, text, serial, integer, boolean, jsonb, timestamp, real, index, primaryKey } from "drizzle-orm/pg-core";
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
}, (table) => {
  return {
    usernameIdx: index("username_idx").on(table.username),
  }
});

export const meals = pgTable("meals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  imageUrl: text("image_url").notNull(),
  calories: integer("calories").notNull(),
  protein: real("protein").notNull(),
  carbs: real("carbs").notNull(),
  fat: real("fat").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
}, (table) => {
  return {
    userIdIdx: index("meals_user_id_idx").on(table.userId),
    timestampIdx: index("meals_timestamp_idx").on(table.timestamp),
  }
});

export const progress = pgTable("progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  weight: real("weight").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
}, (table) => {
  return {
    userIdIdx: index("progress_user_id_idx").on(table.userId),
    timestampIdx: index("progress_timestamp_idx").on(table.timestamp),
  }
});

export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text("type").notNull(),
  intensity: text("intensity"),
  duration: integer("duration"),
  description: text("description"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
}, (table) => {
  return {
    userIdIdx: index("exercises_user_id_idx").on(table.userId),
    timestampIdx: index("exercises_timestamp_idx").on(table.timestamp),
  }
});

// Enhanced validation schemas
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true })
  .extend({
    gender: z.enum(["male", "female", "other"]),
    activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
    height: z.number().min(50).max(300),
    weight: z.number().min(20).max(500),
    targetWeight: z.number().min(20).max(500),
    workoutsPerWeek: z.number().min(0).max(14),
    socialSource: z.enum(["instagram", "facebook", "tiktok", "youtube", "google", "tv"]),
  });

export const insertMealSchema = createInsertSchema(meals)
  .omit({ id: true, timestamp: true })
  .extend({
    calories: z.number().min(0).max(5000),
    protein: z.number().min(0).max(500),
    carbs: z.number().min(0).max(500),
    fat: z.number().min(0).max(500),
  });

export const insertProgressSchema = createInsertSchema(progress)
  .omit({ id: true, timestamp: true })
  .extend({
    weight: z.number().min(20).max(500),
  });

export const insertExerciseSchema = createInsertSchema(exercises)
  .omit({ id: true, timestamp: true })
  .extend({
    type: z.enum(["cardio", "strength", "flexibility", "sports", "other"]),
    intensity: z.enum(["low", "medium", "high"]).optional(),
    duration: z.number().min(1).max(480).optional(),
  });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Meal = typeof meals.$inferSelect;
export type InsertMeal = z.infer<typeof insertMealSchema>;
export type Progress = typeof progress.$inferSelect;
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;