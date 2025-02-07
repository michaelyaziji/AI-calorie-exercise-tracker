import { type User, type InsertUser, type Meal, type InsertMeal, type Progress, type InsertProgress, users, meals, progress } from "@shared/schema";
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
    const [progress] = await db
      .insert(progress)
      .values(insertProgress)
      .returning();
    return progress;
  }

  async getProgressByUserId(userId: number): Promise<Progress[]> {
    return db
      .select()
      .from(progress)
      .where(eq(progress.userId, userId))
      .orderBy(progress.timestamp);
  }
}

export const storage = new DatabaseStorage();