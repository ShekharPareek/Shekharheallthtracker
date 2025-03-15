import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  waterGoal: integer("water_goal").notNull().default(8),
  stepGoal: integer("step_goal").notNull().default(10000),
  waterInterval: integer("water_interval").notNull().default(60),
});

export const waterLogs = pgTable("water_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: integer("amount").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const stepLogs = pgTable("step_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  count: integer("count").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  completed: boolean("completed").notNull().default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  waterGoal: true,
  stepGoal: true,
  waterInterval: true,
});

export const insertWaterLogSchema = createInsertSchema(waterLogs).pick({
  amount: true,
});

export const insertStepLogSchema = createInsertSchema(stepLogs).pick({
  count: true,
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  title: true,
});

export type User = typeof users.$inferSelect;
export type WaterLog = typeof waterLogs.$inferSelect;
export type StepLog = typeof stepLogs.$inferSelect;
export type Task = typeof tasks.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertWaterLog = z.infer<typeof insertWaterLogSchema>;
export type InsertStepLog = z.infer<typeof insertStepLogSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
