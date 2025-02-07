import { type User, type InsertUser, type Meal, type InsertMeal, type Progress, type InsertProgress, type Exercise, type InsertExercise, users, meals, progress, exercises } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUser(id: number): Promise<User | undefined>;

  // Meal operations
  createMeal(meal: InsertMeal): Promise<Meal>;
  getMealsByUserId(userId: number): Promise<Meal[]>;

  // Progress operations
  createProgress(progress: InsertProgress): Promise<Progress>;
  getProgressByUserId(userId: number): Promise<Progress[]>;

  // Exercise operations
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  getExercisesByUserId(userId: number): Promise<Exercise[]>;
}

export class DatabaseStorage implements IStorage {
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    return user;
  }

  async createMeal(insertMeal: InsertMeal): Promise<Meal> {
    const [meal] = await db
      .insert(meals)
      .values(insertMeal)
      .returning();
    return meal;
  }

  async getMealsByUserId(userId: number): Promise<Meal[]> {
    return db
      .select()
      .from(meals)
      .where(eq(meals.userId, userId))
      .orderBy(meals.timestamp);
  }

  async createProgress(insertProgress: InsertProgress): Promise<Progress> {
    const [progressEntry] = await db
      .insert(progress)
      .values(insertProgress)
      .returning();
    return progressEntry;
  }

  async getProgressByUserId(userId: number): Promise<Progress[]> {
    return db
      .select()
      .from(progress)
      .where(eq(progress.userId, userId))
      .orderBy(progress.timestamp);
  }

  async createExercise(insertExercise: InsertExercise): Promise<Exercise> {
    const [exercise] = await db
      .insert(exercises)
      .values(insertExercise)
      .returning();
    return exercise;
  }

  async getExercisesByUserId(userId: number): Promise<Exercise[]> {
    return db
      .select()
      .from(exercises)
      .where(eq(exercises.userId, userId))
      .orderBy(exercises.timestamp);
  }
}

export const storage = new DatabaseStorage();