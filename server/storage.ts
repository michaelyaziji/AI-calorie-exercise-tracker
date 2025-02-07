import { type User, type InsertUser, type Meal, type InsertMeal, type Progress, type InsertProgress, type Exercise, type InsertExercise, users, meals, progress, exercises } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  createUser(user: InsertUser): Promise<User>;
  getUser(id: number): Promise<User | undefined>;
  createMeal(meal: InsertMeal): Promise<Meal>;
  getMealsByUserId(userId: number): Promise<Meal[]>;
  createProgress(progress: InsertProgress): Promise<Progress>;
  getProgressByUserId(userId: number): Promise<Progress[]>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  getExercisesByUserId(userId: number): Promise<Exercise[]>;
}

class DatabaseError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "DatabaseError";
  }
}

export class DatabaseStorage implements IStorage {
  private async withErrorHandling<T>(operation: () => Promise<T>, errorMessage: string): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      console.error(`Database error: ${errorMessage}`, error);
      throw new DatabaseError(errorMessage, error);
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return this.withErrorHandling(async () => {
      const [user] = await db
        .insert(users)
        .values(insertUser)
        .returning();
      return user;
    }, "Failed to create user");
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.withErrorHandling(async () => {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      return user;
    }, `Failed to get user with ID ${id}`);
  }

  async createMeal(insertMeal: InsertMeal): Promise<Meal> {
    return this.withErrorHandling(async () => {
      const [meal] = await db
        .insert(meals)
        .values(insertMeal)
        .returning();
      return meal;
    }, "Failed to create meal");
  }

  async getMealsByUserId(userId: number): Promise<Meal[]> {
    return this.withErrorHandling(async () => {
      return db
        .select()
        .from(meals)
        .where(eq(meals.userId, userId))
        .orderBy(meals.timestamp);
    }, `Failed to get meals for user ${userId}`);
  }

  async createProgress(insertProgress: InsertProgress): Promise<Progress> {
    return this.withErrorHandling(async () => {
      const [progressEntry] = await db
        .insert(progress)
        .values(insertProgress)
        .returning();
      return progressEntry;
    }, "Failed to create progress entry");
  }

  async getProgressByUserId(userId: number): Promise<Progress[]> {
    return this.withErrorHandling(async () => {
      return db
        .select()
        .from(progress)
        .where(eq(progress.userId, userId))
        .orderBy(progress.timestamp);
    }, `Failed to get progress for user ${userId}`);
  }

  async createExercise(insertExercise: InsertExercise): Promise<Exercise> {
    return this.withErrorHandling(async () => {
      const [exercise] = await db
        .insert(exercises)
        .values(insertExercise)
        .returning();
      return exercise;
    }, "Failed to create exercise");
  }

  async getExercisesByUserId(userId: number): Promise<Exercise[]> {
    return this.withErrorHandling(async () => {
      return db
        .select()
        .from(exercises)
        .where(eq(exercises.userId, userId))
        .orderBy(exercises.timestamp);
    }, `Failed to get exercises for user ${userId}`);
  }
}

export const storage = new DatabaseStorage();