import { AppData, BlockType, TimeBlock, Task, TimerSession, InsertBlockType, InsertTimeBlock, InsertTask, InsertTimerSession } from '@shared/schema';
import { nanoid } from 'nanoid';

const STORAGE_KEY = 'timeblock-pro-data';
const BACKUP_KEY = 'timeblock-pro-backup';

const defaultBlockTypes: BlockType[] = [
  {
    id: nanoid(),
    name: 'Study Time',
    color: 'hsl(142, 76%, 36%)', // green
    createdAt: new Date(),
  },
  {
    id: nanoid(),
    name: 'Work Focus',
    color: 'hsl(262, 83%, 58%)', // purple
    createdAt: new Date(),
  },
  {
    id: nanoid(),
    name: 'Morning Routine',
    color: 'hsl(221, 83%, 53%)', // blue
    createdAt: new Date(),
  },
];

const defaultAppData: AppData = {
  blockTypes: defaultBlockTypes,
  timeBlocks: [],
  tasks: [],
  timerSessions: [],
  settings: {
    darkMode: false,
    weekStartDay: 0,
    audioNotifications: true,
    timeRange: {
      start: '07:00',
      end: '23:00',
    },
  },
};

export class StorageService {
  private data: AppData;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): AppData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        parsed.blockTypes = parsed.blockTypes.map((bt: any) => ({
          ...bt,
          createdAt: new Date(bt.createdAt),
        }));
        parsed.timeBlocks = parsed.timeBlocks.map((tb: any) => ({
          ...tb,
          createdAt: new Date(tb.createdAt),
        }));
        parsed.tasks = parsed.tasks.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          deadline: task.deadline ? new Date(task.deadline) : undefined,
        }));
        parsed.timerSessions = parsed.timerSessions.map((ts: any) => ({
          ...ts,
          startTime: new Date(ts.startTime),
        }));
        return parsed;
      }
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
    }
    return defaultAppData;
  }

  private saveData(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (error) {
      console.error('Failed to save data to localStorage:', error);
    }
  }

  // Block Types
  getBlockTypes(): BlockType[] {
    return this.data.blockTypes;
  }

  createBlockType(blockType: InsertBlockType): BlockType {
    const newBlockType: BlockType = {
      ...blockType,
      id: nanoid(),
      createdAt: new Date(),
    };
    this.data.blockTypes.push(newBlockType);
    this.saveData();
    return newBlockType;
  }

  updateBlockType(id: string, updates: Partial<InsertBlockType>): BlockType | null {
    const index = this.data.blockTypes.findIndex(bt => bt.id === id);
    if (index === -1) return null;
    
    this.data.blockTypes[index] = { ...this.data.blockTypes[index], ...updates };
    this.saveData();
    return this.data.blockTypes[index];
  }

  deleteBlockType(id: string): boolean {
    const index = this.data.blockTypes.findIndex(bt => bt.id === id);
    if (index === -1) return false;
    
    this.data.blockTypes.splice(index, 1);
    // Remove associated time blocks
    this.data.timeBlocks = this.data.timeBlocks.filter(tb => tb.blockTypeId !== id);
    // Unassign tasks
    this.data.tasks.forEach(task => {
      if (task.blockTypeId === id) {
        task.blockTypeId = undefined;
      }
    });
    this.saveData();
    return true;
  }

  // Time Blocks
  getTimeBlocks(): TimeBlock[] {
    return this.data.timeBlocks;
  }

  createTimeBlock(timeBlock: InsertTimeBlock): TimeBlock {
    const newTimeBlock: TimeBlock = {
      ...timeBlock,
      id: nanoid(),
      createdAt: new Date(),
    };
    this.data.timeBlocks.push(newTimeBlock);
    this.saveData();
    return newTimeBlock;
  }

  updateTimeBlock(id: string, updates: Partial<InsertTimeBlock>): TimeBlock | null {
    const index = this.data.timeBlocks.findIndex(tb => tb.id === id);
    if (index === -1) return null;
    
    this.data.timeBlocks[index] = { ...this.data.timeBlocks[index], ...updates };
    this.saveData();
    return this.data.timeBlocks[index];
  }

  deleteTimeBlock(id: string): boolean {
    const index = this.data.timeBlocks.findIndex(tb => tb.id === id);
    if (index === -1) return false;
    
    this.data.timeBlocks.splice(index, 1);
    this.saveData();
    return true;
  }

  // Tasks
  getTasks(): Task[] {
    return this.data.tasks;
  }

  createTask(task: InsertTask): Task {
    const newTask: Task = {
      ...task,
      id: nanoid(),
      createdAt: new Date(),
    };
    this.data.tasks.push(newTask);
    this.saveData();
    return newTask;
  }

  updateTask(id: string, updates: Partial<InsertTask>): Task | null {
    const index = this.data.tasks.findIndex(t => t.id === id);
    if (index === -1) return null;
    
    this.data.tasks[index] = { ...this.data.tasks[index], ...updates };
    this.saveData();
    return this.data.tasks[index];
  }

  deleteTask(id: string): boolean {
    const index = this.data.tasks.findIndex(t => t.id === id);
    if (index === -1) return false;
    
    this.data.tasks.splice(index, 1);
    this.saveData();
    return true;
  }

  archiveTask(id: string): boolean {
    const index = this.data.tasks.findIndex(t => t.id === id);
    if (index === -1) return false;
    
    this.data.tasks[index] = { 
      ...this.data.tasks[index], 
      archived: true,
      archivedAt: new Date()
    };
    this.saveData();
    return true;
  }

  unarchiveTask(id: string): boolean {
    const index = this.data.tasks.findIndex(t => t.id === id);
    if (index === -1) return false;
    
    this.data.tasks[index] = { 
      ...this.data.tasks[index], 
      archived: false,
      archivedAt: undefined
    };
    this.saveData();
    return true;
  }

  getArchivedTasks(): Task[] {
    return this.data.tasks.filter(task => task.archived);
  }

  deleteArchivedTasks(): number {
    const archivedCount = this.data.tasks.filter(task => task.archived).length;
    this.data.tasks = this.data.tasks.filter(task => !task.archived);
    this.saveData();
    return archivedCount;
  }

  // Timer Sessions
  getTimerSessions(): TimerSession[] {
    return this.data.timerSessions;
  }

  createTimerSession(session: InsertTimerSession): TimerSession {
    const newSession: TimerSession = {
      ...session,
      id: nanoid(),
    };
    this.data.timerSessions.push(newSession);
    this.saveData();
    return newSession;
  }

  updateTimerSession(id: string, updates: Partial<InsertTimerSession>): TimerSession | null {
    const index = this.data.timerSessions.findIndex(ts => ts.id === id);
    if (index === -1) return null;
    
    this.data.timerSessions[index] = { ...this.data.timerSessions[index], ...updates };
    this.saveData();
    return this.data.timerSessions[index];
  }

  // Settings
  getSettings() {
    return this.data.settings;
  }

  updateSettings(updates: Partial<AppData['settings']>): void {
    this.data.settings = { ...this.data.settings, ...updates };
    this.saveData();
  }

  // Backup and Export
  exportData(): string {
    return JSON.stringify(this.data, null, 2);
  }

  importData(dataString: string): boolean {
    try {
      const parsed = JSON.parse(dataString);
      // Basic validation
      if (parsed.blockTypes && parsed.timeBlocks && parsed.tasks) {
        this.data = parsed;
        this.saveData();
        return true;
      }
    } catch (error) {
      console.error('Failed to import data:', error);
    }
    return false;
  }

  createBackup(): void {
    try {
      const backup = {
        data: this.data,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
    } catch (error) {
      console.error('Failed to create backup:', error);
    }
  }

  downloadBackup(): void {
    const dataStr = this.exportData();
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `timeblock-pro-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  // Get all data
  getAllData(): AppData {
    return this.data;
  }
}

export const storage = new StorageService();
