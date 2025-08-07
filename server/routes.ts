import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Block Types routes
  app.get("/api/block-types", async (req, res) => {
    try {
      const blockTypes = await storage.getBlockTypes();
      res.json(blockTypes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch block types" });
    }
  });

  app.post("/api/block-types", async (req, res) => {
    try {
      const blockType = await storage.createBlockType(req.body);
      res.status(201).json(blockType);
    } catch (error) {
      res.status(500).json({ error: "Failed to create block type" });
    }
  });

  app.put("/api/block-types/:id", async (req, res) => {
    try {
      const blockType = await storage.updateBlockType(req.params.id, req.body);
      if (!blockType) {
        return res.status(404).json({ error: "Block type not found" });
      }
      res.json(blockType);
    } catch (error) {
      res.status(500).json({ error: "Failed to update block type" });
    }
  });

  app.delete("/api/block-types/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteBlockType(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Block type not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete block type" });
    }
  });

  // Time Blocks routes
  app.get("/api/time-blocks", async (req, res) => {
    try {
      const timeBlocks = await storage.getTimeBlocks();
      res.json(timeBlocks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch time blocks" });
    }
  });

  app.post("/api/time-blocks", async (req, res) => {
    try {
      const timeBlock = await storage.createTimeBlock(req.body);
      res.status(201).json(timeBlock);
    } catch (error) {
      res.status(500).json({ error: "Failed to create time block" });
    }
  });

  app.put("/api/time-blocks/:id", async (req, res) => {
    try {
      const timeBlock = await storage.updateTimeBlock(req.params.id, req.body);
      if (!timeBlock) {
        return res.status(404).json({ error: "Time block not found" });
      }
      res.json(timeBlock);
    } catch (error) {
      res.status(500).json({ error: "Failed to update time block" });
    }
  });

  app.delete("/api/time-blocks/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTimeBlock(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Time block not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete time block" });
    }
  });

  // Tasks routes
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const task = await storage.createTask(req.body);
      res.status(201).json(task);
    } catch (error) {
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  app.put("/api/tasks/:id", async (req, res) => {
    try {
      const task = await storage.updateTask(req.params.id, req.body);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTask(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // Timer Sessions routes
  app.get("/api/timer-sessions", async (req, res) => {
    try {
      const sessions = await storage.getTimerSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch timer sessions" });
    }
  });

  app.post("/api/timer-sessions", async (req, res) => {
    try {
      const session = await storage.createTimerSession(req.body);
      res.status(201).json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to create timer session" });
    }
  });

  app.put("/api/timer-sessions/:id", async (req, res) => {
    try {
      const session = await storage.updateTimerSession(req.params.id, req.body);
      if (!session) {
        return res.status(404).json({ error: "Timer session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to update timer session" });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);

  return httpServer;
}
