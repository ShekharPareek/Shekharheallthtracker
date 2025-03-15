import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertWaterLogSchema, insertStepLogSchema, insertTaskSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const userId = 1; // Hardcoded for demo

  // User settings
  app.get("/api/user", async (req, res) => {
    const user = await storage.getUser(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  });

  app.patch("/api/user", async (req, res) => {
    const result = insertUserSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid user data" });
      return;
    }
    const user = await storage.updateUser(userId, result.data);
    res.json(user);
  });

  // Water tracking
  app.post("/api/water", async (req, res) => {
    const result = insertWaterLogSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid water log data" });
      return;
    }
    const log = await storage.addWaterLog(userId, result.data);
    res.json(log);
  });

  app.get("/api/water", async (req, res) => {
    const date = new Date();
    const logs = await storage.getWaterLogs(userId, date);
    res.json(logs);
  });

  // Step tracking
  app.post("/api/steps", async (req, res) => {
    const result = insertStepLogSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid step log data" });
      return;
    }
    const log = await storage.addStepLog(userId, result.data);
    res.json(log);
  });

  app.get("/api/steps", async (req, res) => {
    const date = new Date();
    const logs = await storage.getStepLogs(userId, date);
    res.json(logs);
  });

  // Task management
  app.post("/api/tasks", async (req, res) => {
    const result = insertTaskSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid task data" });
      return;
    }
    const task = await storage.addTask(userId, result.data);
    res.json(task);
  });

  app.get("/api/tasks", async (req, res) => {
    const tasks = await storage.getTasks(userId);
    res.json(tasks);
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const completed = req.body.completed;
    if (typeof completed !== "boolean") {
      res.status(400).json({ message: "Invalid task update" });
      return;
    }
    try {
      const task = await storage.updateTask(id, completed);
      res.json(task);
    } catch (error) {
      res.status(404).json({ message: "Task not found" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      await storage.deleteTask(id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ message: "Task not found" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
