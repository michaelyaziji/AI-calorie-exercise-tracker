import { type User, type InsertUser, type Meal, type InsertMeal, type Progress, type InsertProgress } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private meals: Map<number, Meal>;
  private progress: Map<number, Progress>;
  private currentId: { users: number; meals: number; progress: number };

  constructor() {
    this.users = new Map();
    this.meals = new Map();
    this.progress = new Map();
    this.currentId = { users: 1, meals: 1, progress: 1 };
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createMeal(insertMeal: InsertMeal): Promise<Meal> {
    const id = this.currentId.meals++;
    const meal: Meal = { ...insertMeal, id, timestamp: new Date() };
    this.meals.set(id, meal);
    return meal;
  }

  async getMealsByUserId(userId: number): Promise<Meal[]> {
    return Array.from(this.meals.values()).filter(meal => meal.userId === userId);
  }

  async createProgress(insertProgress: InsertProgress): Promise<Progress> {
    const id = this.currentId.progress++;
    const progress: Progress = { ...insertProgress, id, timestamp: new Date() };
    this.progress.set(id, progress);
    return progress;
  }

  async getProgressByUserId(userId: number): Promise<Progress[]> {
    return Array.from(this.progress.values())
      .filter(progress => progress.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}

export const storage = new MemStorage();
