import { 
  type User, type WaterLog, type StepLog, type Task,
  type InsertUser, type InsertWaterLog, type InsertStepLog, type InsertTask 
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  updateUser(id: number, data: InsertUser): Promise<User>;

  // Water tracking
  addWaterLog(userId: number, log: InsertWaterLog): Promise<WaterLog>;
  getWaterLogs(userId: number, date: Date): Promise<WaterLog[]>;

  // Step tracking
  addStepLog(userId: number, log: InsertStepLog): Promise<StepLog>;
  getStepLogs(userId: number, date: Date): Promise<StepLog[]>;

  // Task management
  addTask(userId: number, task: InsertTask): Promise<Task>;
  getTasks(userId: number): Promise<Task[]>;
  updateTask(id: number, completed: boolean): Promise<Task>;
  deleteTask(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private waterLogs: Map<number, WaterLog[]>;
  private stepLogs: Map<number, StepLog[]>;
  private tasks: Map<number, Task[]>;
  private nextId: number;

  constructor() {
    this.users = new Map([[1, {
      id: 1,
      waterGoal: 8,
      stepGoal: 10000,
      waterInterval: 60
    }]]);
    this.waterLogs = new Map();
    this.stepLogs = new Map();
    this.tasks = new Map();
    this.nextId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async updateUser(id: number, data: InsertUser): Promise<User> {
    const userUpdate: User = {
      id,
      waterGoal: data.waterGoal,
      stepGoal: data.stepGoal,
      waterInterval: data.waterInterval
    };
    this.users.set(id, userUpdate);
    return userUpdate;
  }

  async addWaterLog(userId: number, log: InsertWaterLog): Promise<WaterLog> {
    const waterLog: WaterLog = {
      id: this.nextId++,
      userId,
      ...log,
      timestamp: new Date()
    };

    const logs = this.waterLogs.get(userId) || [];
    logs.push(waterLog);
    this.waterLogs.set(userId, logs);

    return waterLog;
  }

  async getWaterLogs(userId: number, date: Date): Promise<WaterLog[]> {
    const logs = this.waterLogs.get(userId) || [];
    return logs.filter(log => 
      log.timestamp.toDateString() === date.toDateString()
    );
  }

  async addStepLog(userId: number, log: InsertStepLog): Promise<StepLog> {
    const stepLog: StepLog = {
      id: this.nextId++,
      userId,
      ...log,
      timestamp: new Date()
    };

    const logs = this.stepLogs.get(userId) || [];
    logs.push(stepLog);
    this.stepLogs.set(userId, logs);

    return stepLog;
  }

  async getStepLogs(userId: number, date: Date): Promise<StepLog[]> {
    const logs = this.stepLogs.get(userId) || [];
    return logs.filter(log => 
      log.timestamp.toDateString() === date.toDateString()
    );
  }

  async addTask(userId: number, task: InsertTask): Promise<Task> {
    const newTask: Task = {
      id: this.nextId++,
      userId,
      ...task,
      completed: false
    };

    const tasks = this.tasks.get(userId) || [];
    tasks.push(newTask);
    this.tasks.set(userId, tasks);

    return newTask;
  }

  async getTasks(userId: number): Promise<Task[]> {
    return this.tasks.get(userId) || [];
  }

  async updateTask(id: number, completed: boolean): Promise<Task> {
    for (const tasks of this.tasks.values()) {
      const task = tasks.find((t: Task) => t.id === id);
      if (task) {
        task.completed = completed;
        return task;
      }
    }
    throw new Error("Task not found");
  }

  async deleteTask(id: number): Promise<void> {
    for (const tasks of this.tasks.values()) {
      const index = tasks.findIndex((t: Task) => t.id === id);
      if (index !== -1) {
        tasks.splice(index, 1);
        return;
      }
    }
    throw new Error("Task not found");
  }
}

export const storage = new MemStorage();