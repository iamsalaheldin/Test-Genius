import { users, files, testCases, testPlans } from "@shared/schema";
import { type User, type InsertUser, type File, type InsertFile, type TestCase, type InsertTestCase, type TestPlan, type InsertTestPlan } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // File operations
  createFile(file: InsertFile): Promise<File>;
  getFile(id: number): Promise<File | undefined>;
  getAllFiles(): Promise<File[]>;
  deleteFile(id: number): Promise<void>;
  
  // Test case operations
  createTestCase(testCase: InsertTestCase): Promise<TestCase>;
  getTestCase(id: number): Promise<TestCase | undefined>;
  getAllTestCases(): Promise<TestCase[]>;
  updateTestCaseSelection(id: number, selected: boolean): Promise<TestCase>;
  
  // Test plan operations
  createTestPlan(testPlan: InsertTestPlan): Promise<TestPlan>;
  getTestPlan(id: number): Promise<TestPlan | undefined>;
  getAllTestPlans(): Promise<TestPlan[]>;
}

// Database-backed storage implementation
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // File operations
  async createFile(insertFile: InsertFile): Promise<File> {
    const [file] = await db.insert(files).values(insertFile).returning();
    return file;
  }

  async getFile(id: number): Promise<File | undefined> {
    const [file] = await db.select().from(files).where(eq(files.id, id));
    return file;
  }

  async getAllFiles(): Promise<File[]> {
    return await db.select().from(files);
  }

  async deleteFile(id: number): Promise<void> {
    await db.delete(files).where(eq(files.id, id));
  }

  // Test case operations
  async createTestCase(insertTestCase: InsertTestCase): Promise<TestCase> {
    const [testCase] = await db.insert(testCases).values(insertTestCase).returning();
    return testCase;
  }

  async getTestCase(id: number): Promise<TestCase | undefined> {
    const [testCase] = await db.select().from(testCases).where(eq(testCases.id, id));
    return testCase;
  }

  async getAllTestCases(): Promise<TestCase[]> {
    return await db.select().from(testCases);
  }

  async updateTestCaseSelection(id: number, selected: boolean): Promise<TestCase> {
    const [updatedTestCase] = await db
      .update(testCases)
      .set({ selected })
      .where(eq(testCases.id, id))
      .returning();
    
    if (!updatedTestCase) {
      throw new Error(`Test case with ID ${id} not found`);
    }
    
    return updatedTestCase;
  }

  // Test plan operations
  async createTestPlan(insertTestPlan: InsertTestPlan): Promise<TestPlan> {
    const [testPlan] = await db.insert(testPlans).values(insertTestPlan).returning();
    return testPlan;
  }

  async getTestPlan(id: number): Promise<TestPlan | undefined> {
    const [testPlan] = await db.select().from(testPlans).where(eq(testPlans.id, id));
    return testPlan;
  }

  async getAllTestPlans(): Promise<TestPlan[]> {
    return await db.select().from(testPlans);
  }
}

// Export a single instance of the database storage
export const storage = new DatabaseStorage();
