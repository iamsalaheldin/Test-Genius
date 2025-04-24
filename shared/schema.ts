import { pgTable, text, serial, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// File schema
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  size: integer("size").notNull(), // Size in bytes
  type: text("type").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const insertFileSchema = createInsertSchema(files).pick({
  name: true,
  size: true,
  type: true,
});

// Test case schema
export const testCases = pgTable("test_cases", {
  id: serial("id").primaryKey(),
  testId: text("test_id").notNull(), // e.g. TC-001
  description: text("description").notNull(),
  prerequisites: text("prerequisites"),
  steps: jsonb("steps").$type<string[]>().notNull(),
  expectedResults: text("expected_results").notNull(),
  priority: text("priority").notNull(), // High, Medium, Low
  type: text("type").notNull(), // Functional, Non-functional, Integration
  fileIds: jsonb("file_ids").$type<number[]>(), // Files used to generate this test case
  createdAt: timestamp("created_at").defaultNow().notNull(),
  selected: boolean("selected").default(false),
});

export const insertTestCaseSchema = createInsertSchema(testCases).pick({
  testId: true,
  description: true,
  prerequisites: true,
  steps: true,
  expectedResults: true,
  priority: true,
  type: true,
  fileIds: true,
});

// Test plan schema
export const testPlans = pgTable("test_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  testCaseIds: jsonb("test_case_ids").$type<number[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTestPlanSchema = createInsertSchema(testPlans).pick({
  name: true,
  description: true,
  testCaseIds: true,
});

// Export types
export type InsertFile = z.infer<typeof insertFileSchema>;
export type File = typeof files.$inferSelect;

export type InsertTestCase = z.infer<typeof insertTestCaseSchema>;
export type TestCase = typeof testCases.$inferSelect;

export type InsertTestPlan = z.infer<typeof insertTestPlanSchema>;
export type TestPlan = typeof testPlans.$inferSelect;

// Validation schema for file upload
export const fileValidationSchema = z.object({
  name: z.string().min(1),
  size: z.number().max(10 * 1024 * 1024), // 10MB max
  type: z.string().refine(type => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown'];
    return allowedTypes.includes(type);
  }, {
    message: "File type not supported. Please upload PDF, DOCX, TXT, or MD files."
  }),
});

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
