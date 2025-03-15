// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  users;
  waterLogs;
  stepLogs;
  tasks;
  nextId;
  constructor() {
    this.users = /* @__PURE__ */ new Map([[1, {
      id: 1,
      waterGoal: 8,
      stepGoal: 1e4,
      waterInterval: 60
    }]]);
    this.waterLogs = /* @__PURE__ */ new Map();
    this.stepLogs = /* @__PURE__ */ new Map();
    this.tasks = /* @__PURE__ */ new Map();
    this.nextId = 1;
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async updateUser(id, data) {
    const userUpdate = {
      id,
      waterGoal: data.waterGoal,
      stepGoal: data.stepGoal,
      waterInterval: data.waterInterval
    };
    this.users.set(id, userUpdate);
    return userUpdate;
  }
  async addWaterLog(userId, log2) {
    const waterLog = {
      id: this.nextId++,
      userId,
      ...log2,
      timestamp: /* @__PURE__ */ new Date()
    };
    const logs = this.waterLogs.get(userId) || [];
    logs.push(waterLog);
    this.waterLogs.set(userId, logs);
    return waterLog;
  }
  async getWaterLogs(userId, date) {
    const logs = this.waterLogs.get(userId) || [];
    return logs.filter(
      (log2) => log2.timestamp.toDateString() === date.toDateString()
    );
  }
  async addStepLog(userId, log2) {
    const stepLog = {
      id: this.nextId++,
      userId,
      ...log2,
      timestamp: /* @__PURE__ */ new Date()
    };
    const logs = this.stepLogs.get(userId) || [];
    logs.push(stepLog);
    this.stepLogs.set(userId, logs);
    return stepLog;
  }
  async getStepLogs(userId, date) {
    const logs = this.stepLogs.get(userId) || [];
    return logs.filter(
      (log2) => log2.timestamp.toDateString() === date.toDateString()
    );
  }
  async addTask(userId, task) {
    const newTask = {
      id: this.nextId++,
      userId,
      ...task,
      completed: false
    };
    const tasks2 = this.tasks.get(userId) || [];
    tasks2.push(newTask);
    this.tasks.set(userId, tasks2);
    return newTask;
  }
  async getTasks(userId) {
    return this.tasks.get(userId) || [];
  }
  async updateTask(id, completed) {
    for (const tasks2 of this.tasks.values()) {
      const task = tasks2.find((t) => t.id === id);
      if (task) {
        task.completed = completed;
        return task;
      }
    }
    throw new Error("Task not found");
  }
  async deleteTask(id) {
    for (const tasks2 of this.tasks.values()) {
      const index = tasks2.findIndex((t) => t.id === id);
      if (index !== -1) {
        tasks2.splice(index, 1);
        return;
      }
    }
    throw new Error("Task not found");
  }
};
var storage = new MemStorage();

// shared/schema.ts.....
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  waterGoal: integer("water_goal").notNull().default(8),
  stepGoal: integer("step_goal").notNull().default(1e4),
  waterInterval: integer("water_interval").notNull().default(60)
});
var waterLogs = pgTable("water_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: integer("amount").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow()
});
var stepLogs = pgTable("step_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  count: integer("count").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow()
});
var tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  completed: boolean("completed").notNull().default(false)
});
var insertUserSchema = createInsertSchema(users).pick({
  waterGoal: true,
  stepGoal: true,
  waterInterval: true
});
var insertWaterLogSchema = createInsertSchema(waterLogs).pick({
  amount: true
});
var insertStepLogSchema = createInsertSchema(stepLogs).pick({
  count: true
});
var insertTaskSchema = createInsertSchema(tasks).pick({
  title: true
});

// server/routes.ts
async function registerRoutes(app2) {
  const userId = 1;
  app2.get("/api/user", async (req, res) => {
    const user = await storage.getUser(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  });
  app2.patch("/api/user", async (req, res) => {
    const result = insertUserSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid user data" });
      return;
    }
    const user = await storage.updateUser(userId, result.data);
    res.json(user);
  });
  app2.post("/api/water", async (req, res) => {
    const result = insertWaterLogSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid water log data" });
      return;
    }
    const log2 = await storage.addWaterLog(userId, result.data);
    res.json(log2);
  });
  app2.get("/api/water", async (req, res) => {
    const date = /* @__PURE__ */ new Date();
    const logs = await storage.getWaterLogs(userId, date);
    res.json(logs);
  });
  app2.post("/api/steps", async (req, res) => {
    const result = insertStepLogSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid step log data" });
      return;
    }
    const log2 = await storage.addStepLog(userId, result.data);
    res.json(log2);
  });
  app2.get("/api/steps", async (req, res) => {
    const date = /* @__PURE__ */ new Date();
    const logs = await storage.getStepLogs(userId, date);
    res.json(logs);
  });
  app2.post("/api/tasks", async (req, res) => {
    const result = insertTaskSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ message: "Invalid task data" });
      return;
    }
    const task = await storage.addTask(userId, result.data);
    res.json(task);
  });
  app2.get("/api/tasks", async (req, res) => {
    const tasks2 = await storage.getTasks(userId);
    res.json(tasks2);
  });
  app2.patch("/api/tasks/:id", async (req, res) => {
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
  app2.delete("/api/tasks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      await storage.deleteTask(id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ message: "Task not found" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
