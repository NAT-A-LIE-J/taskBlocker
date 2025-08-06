import { type BlockType, type TimeBlock, type Task, type TimerSession } from "@shared/schema";
import { randomUUID } from "crypto";

// TimeBlock Pro storage interface for in-memory storage
export interface IStorage {
  // Block Types
  getBlockTypes(): Promise<BlockType[]>;
  createBlockType(blockType: Omit<BlockType, 'id' | 'createdAt'>): Promise<BlockType>;
  updateBlockType(id: string, updates: Partial<Omit<BlockType, 'id' | 'createdAt'>>): Promise<BlockType | null>;
  deleteBlockType(id: string): Promise<boolean>;

  // Time Blocks
  getTimeBlocks(): Promise<TimeBlock[]>;
  createTimeBlock(timeBlock: Omit<TimeBlock, 'id' | 'createdAt'>): Promise<TimeBlock>;
  updateTimeBlock(id: string, updates: Partial<Omit<TimeBlock, 'id' | 'createdAt'>>): Promise<TimeBlock | null>;
  deleteTimeBlock(id: string): Promise<boolean>;

  // Tasks
  getTasks(): Promise<Task[]>;
  createTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task>;
  updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<Task | null>;
  deleteTask(id: string): Promise<boolean>;

  // Timer Sessions
  getTimerSessions(): Promise<TimerSession[]>;
  createTimerSession(session: Omit<TimerSession, 'id'>): Promise<TimerSession>;
  updateTimerSession(id: string, updates: Partial<Omit<TimerSession, 'id'>>): Promise<TimerSession | null>;
}

export class MemStorage implements IStorage {
  private blockTypes: Map<string, BlockType> = new Map();
  private timeBlocks: Map<string, TimeBlock> = new Map();
  private tasks: Map<string, Task> = new Map();
  private timerSessions: Map<string, TimerSession> = new Map();

  constructor() {
    // Initialize with default data
    this.initializeDefaults();
  }

  private initializeDefaults() {
    const defaultBlockTypes: BlockType[] = [
      {
        id: randomUUID(),
        name: 'Study Time',
        color: 'hsl(142, 76%, 36%)',
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: 'Work Focus',
        color: 'hsl(262, 83%, 58%)',
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: 'Morning Routine',
        color: 'hsl(221, 83%, 53%)',
        createdAt: new Date(),
      },
    ];

    defaultBlockTypes.forEach(bt => this.blockTypes.set(bt.id, bt));
  }

  // Block Types
  async getBlockTypes(): Promise<BlockType[]> {
    return Array.from(this.blockTypes.values());
  }

  async createBlockType(blockType: Omit<BlockType, 'id' | 'createdAt'>): Promise<BlockType> {
    const id = randomUUID();
    const newBlockType: BlockType = {
      ...blockType,
      id,
      createdAt: new Date(),
    };
    this.blockTypes.set(id, newBlockType);
    return newBlockType;
  }

  async updateBlockType(id: string, updates: Partial<Omit<BlockType, 'id' | 'createdAt'>>): Promise<BlockType | null> {
    const existing = this.blockTypes.get(id);
    if (!existing) return null;
    
    const updated: BlockType = { ...existing, ...updates };
    this.blockTypes.set(id, updated);
    return updated;
  }

  async deleteBlockType(id: string): Promise<boolean> {
    return this.blockTypes.delete(id);
  }

  // Time Blocks
  async getTimeBlocks(): Promise<TimeBlock[]> {
    return Array.from(this.timeBlocks.values());
  }

  async createTimeBlock(timeBlock: Omit<TimeBlock, 'id' | 'createdAt'>): Promise<TimeBlock> {
    const id = randomUUID();
    const newTimeBlock: TimeBlock = {
      ...timeBlock,
      id,
      createdAt: new Date(),
    };
    this.timeBlocks.set(id, newTimeBlock);
    return newTimeBlock;
  }

  async updateTimeBlock(id: string, updates: Partial<Omit<TimeBlock, 'id' | 'createdAt'>>): Promise<TimeBlock | null> {
    const existing = this.timeBlocks.get(id);
    if (!existing) return null;
    
    const updated: TimeBlock = { ...existing, ...updates };
    this.timeBlocks.set(id, updated);
    return updated;
  }

  async deleteTimeBlock(id: string): Promise<boolean> {
    return this.timeBlocks.delete(id);
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async createTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    const id = randomUUID();
    const newTask: Task = {
      ...task,
      id,
      createdAt: new Date(),
    };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<Task | null> {
    const existing = this.tasks.get(id);
    if (!existing) return null;
    
    const updated: Task = { ...existing, ...updates };
    this.tasks.set(id, updated);
    return updated;
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Timer Sessions
  async getTimerSessions(): Promise<TimerSession[]> {
    return Array.from(this.timerSessions.values());
  }

  async createTimerSession(session: Omit<TimerSession, 'id'>): Promise<TimerSession> {
    const id = randomUUID();
    const newSession: TimerSession = {
      ...session,
      id,
    };
    this.timerSessions.set(id, newSession);
    return newSession;
  }

  async updateTimerSession(id: string, updates: Partial<Omit<TimerSession, 'id'>>): Promise<TimerSession | null> {
    const existing = this.timerSessions.get(id);
    if (!existing) return null;
    
    const updated: TimerSession = { ...existing, ...updates };
    this.timerSessions.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
