import { users, type User, type InsertUser, type File, type InsertFile, type TestCase, type InsertTestCase, type TestPlan, type InsertTestPlan } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private files: Map<number, File>;
  private testCases: Map<number, TestCase>;
  private testPlans: Map<number, TestPlan>;
  currentUserId: number;
  currentFileId: number;
  currentTestCaseId: number;
  currentTestPlanId: number;

  constructor() {
    this.users = new Map();
    this.files = new Map();
    this.testCases = new Map();
    this.testPlans = new Map();
    this.currentUserId = 1;
    this.currentFileId = 1;
    this.currentTestCaseId = 1;
    this.currentTestPlanId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // File operations
  async createFile(insertFile: InsertFile): Promise<File> {
    const id = this.currentFileId++;
    const now = new Date();
    const file: File = { 
      ...insertFile, 
      id, 
      uploadedAt: now 
    };
    this.files.set(id, file);
    return file;
  }

  async getFile(id: number): Promise<File | undefined> {
    return this.files.get(id);
  }

  async getAllFiles(): Promise<File[]> {
    return Array.from(this.files.values());
  }

  async deleteFile(id: number): Promise<void> {
    this.files.delete(id);
  }

  // Test case operations
  async createTestCase(insertTestCase: InsertTestCase): Promise<TestCase> {
    const id = this.currentTestCaseId++;
    const now = new Date();
    const testCase: TestCase = { 
      ...insertTestCase, 
      id, 
      createdAt: now,
      selected: false
    };
    this.testCases.set(id, testCase);
    return testCase;
  }

  async getTestCase(id: number): Promise<TestCase | undefined> {
    return this.testCases.get(id);
  }

  async getAllTestCases(): Promise<TestCase[]> {
    return Array.from(this.testCases.values());
  }

  async updateTestCaseSelection(id: number, selected: boolean): Promise<TestCase> {
    const testCase = this.testCases.get(id);
    if (!testCase) {
      throw new Error(`Test case with ID ${id} not found`);
    }
    
    const updatedTestCase = { ...testCase, selected };
    this.testCases.set(id, updatedTestCase);
    return updatedTestCase;
  }

  // Test plan operations
  async createTestPlan(insertTestPlan: InsertTestPlan): Promise<TestPlan> {
    const id = this.currentTestPlanId++;
    const now = new Date();
    const testPlan: TestPlan = { 
      ...insertTestPlan, 
      id, 
      createdAt: now 
    };
    this.testPlans.set(id, testPlan);
    return testPlan;
  }

  async getTestPlan(id: number): Promise<TestPlan | undefined> {
    return this.testPlans.get(id);
  }

  async getAllTestPlans(): Promise<TestPlan[]> {
    return Array.from(this.testPlans.values());
  }
}

export const storage = new MemStorage();
