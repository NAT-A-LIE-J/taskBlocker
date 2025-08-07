import { AppData, BlockType, TimeBlock, Task, TimerSession, Event, InsertBlockType, InsertTimeBlock, InsertTask, InsertTimerSession, InsertEvent } from '@shared/schema';
import { nanoid } from 'nanoid';

const STORAGE_KEY = 'timeblock-pro-data';
const BACKUP_KEY = 'timeblock-pro-backup';
const VALIDATION_KEY = 'timeblock-pro-validation';
const APP_VERSION = '1.0.0';

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
  events: [],
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
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.data = this.validateAndLoadData();
    this.setupAutoSave();
  }

  // Subscribe to data changes for auto-refresh
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  private setupAutoSave(): void {
    // Create a backup on startup
    this.createBackup();
    
    // Auto-save validation check
    this.validateDataIntegrity();
  }

  private validateAndLoadData(): AppData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = this.parseAndValidateData(stored);
        if (data) {
          console.log('✅ Data loaded and validated successfully');
          return data;
        }
      }
    } catch (error) {
      console.error('❌ Failed to load data from localStorage:', error);
      this.createCorruptionBackup();
    }
    
    console.log('🔧 Using default app data');
    return { ...defaultAppData };
  }

  private parseAndValidateData(storedData: string): AppData | null {
    try {
      const parsed = JSON.parse(storedData);
      
      // Validate data structure
      if (!this.isValidAppData(parsed)) {
        throw new Error('Invalid data structure');
      }

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
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
        archivedAt: task.archivedAt ? new Date(task.archivedAt) : undefined,
        subtasks: task.subtasks?.map((st: any) => ({
          ...st,
          createdAt: new Date(st.createdAt),
        })) || [],
      }));
      
      parsed.timerSessions = parsed.timerSessions.map((ts: any) => ({
        ...ts,
        startTime: new Date(ts.startTime),
      }));
      
      parsed.events = parsed.events?.map((event: any) => ({
        ...event,
        startTime: new Date(event.startTime),
        endTime: new Date(event.endTime),
        createdAt: new Date(event.createdAt),
        updatedAt: new Date(event.updatedAt),
      })) || [];
      
      return parsed;
    } catch (error) {
      console.error('Data parsing/validation failed:', error);
      return null;
    }
  }

  private isValidAppData(data: any): boolean {
    return (
      data &&
      Array.isArray(data.blockTypes) &&
      Array.isArray(data.timeBlocks) &&
      Array.isArray(data.tasks) &&
      Array.isArray(data.timerSessions) &&
      Array.isArray(data.events || []) &&
      data.settings &&
      typeof data.settings === 'object'
    );
  }

  private validateDataIntegrity(): boolean {
    try {
      // Check for orphaned references
      const blockTypeIds = new Set(this.data.blockTypes.map(bt => bt.id));
      
      // Remove tasks with invalid blockTypeId references
      const invalidTasks = this.data.tasks.filter(task => 
        task.blockTypeId && !blockTypeIds.has(task.blockTypeId)
      );
      
      if (invalidTasks.length > 0) {
        console.warn(`🔧 Found ${invalidTasks.length} tasks with invalid blockType references, cleaning up...`);
        this.data.tasks.forEach(task => {
          if (task.blockTypeId && !blockTypeIds.has(task.blockTypeId)) {
            task.blockTypeId = undefined;
          }
        });
        this.saveData();
      }

      // Remove time blocks with invalid blockTypeId references  
      const invalidTimeBlocks = this.data.timeBlocks.filter(tb => 
        !blockTypeIds.has(tb.blockTypeId)
      );
      
      if (invalidTimeBlocks.length > 0) {
        console.warn(`🔧 Found ${invalidTimeBlocks.length} timeBlocks with invalid blockType references, removing...`);
        this.data.timeBlocks = this.data.timeBlocks.filter(tb => 
          blockTypeIds.has(tb.blockTypeId)
        );
        this.saveData();
      }

      console.log('✅ Data integrity validation completed');
      return true;
    } catch (error) {
      console.error('❌ Data integrity validation failed:', error);
      return false;
    }
  }

  private createCorruptionBackup(): void {
    const corrupted = localStorage.getItem(STORAGE_KEY);
    if (corrupted) {
      const timestamp = new Date().toISOString();
      localStorage.setItem(`${STORAGE_KEY}-corrupted-${timestamp}`, corrupted);
      console.log(`💾 Corrupted data backed up to: ${STORAGE_KEY}-corrupted-${timestamp}`);
    }
  }

  private saveData(notifyListeners: boolean = true): void {
    try {
      // Add metadata to the saved data
      const dataToSave = {
        ...this.data,
        _metadata: {
          version: APP_VERSION,
          lastSaved: new Date().toISOString(),
          checksum: this.generateChecksum(this.data)
        }
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      
      // Store validation info
      localStorage.setItem(VALIDATION_KEY, JSON.stringify({
        lastValidation: new Date().toISOString(),
        version: APP_VERSION
      }));
      
      if (notifyListeners) {
        this.notifyListeners();
      }
      
    } catch (error) {
      console.error('❌ Failed to save data to localStorage:', error);
    }
  }

  private generateChecksum(data: AppData): string {
    // Simple checksum based on data length and content
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  // Export/Import functionality
  exportData(): string {
    const exportData = {
      ...this.data,
      _export: {
        version: APP_VERSION,
        exportedAt: new Date().toISOString(),
        appName: 'TimeBlock Pro',
        checksum: this.generateChecksum(this.data)
      }
    };
    return JSON.stringify(exportData, null, 2);
  }

  downloadJsonExport(): void {
    try {
      const jsonData = this.exportData();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `timeblock-pro-export-${timestamp}.json`;
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log(`📥 Data exported to ${filename}`);
    } catch (error) {
      console.error('❌ Failed to export data:', error);
      throw new Error('Failed to export data. Please try again.');
    }
  }

  async importFromJson(jsonString: string): Promise<{ success: boolean; message: string; stats?: any }> {
    try {
      const importData = JSON.parse(jsonString);
      
      // Validate import data structure
      if (!this.isValidAppData(importData)) {
        return { success: false, message: 'Invalid data format. Please check the JSON file.' };
      }

      // Create backup before import
      this.createBackup();
      
      // Parse and validate the imported data
      const validatedData = this.parseAndValidateData(jsonString);
      if (!validatedData) {
        return { success: false, message: 'Data validation failed. File may be corrupted.' };
      }

      // Calculate import statistics
      const stats = {
        blockTypes: validatedData.blockTypes.length,
        timeBlocks: validatedData.timeBlocks.length,
        tasks: validatedData.tasks.length,
        events: validatedData.events.length,
        timerSessions: validatedData.timerSessions.length
      };

      // Replace current data
      this.data = validatedData;
      this.saveData();
      
      console.log('✅ Data imported successfully:', stats);
      return { 
        success: true, 
        message: 'Data imported successfully!',
        stats
      };
    } catch (error) {
      console.error('❌ Import failed:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to import data. Please check the file format.' 
      };
    }
  }

  restoreFromBackup(): boolean {
    try {
      const backup = localStorage.getItem(BACKUP_KEY);
      if (!backup) {
        console.warn('⚠️ No backup available');
        return false;
      }

      const backupData = JSON.parse(backup);
      const validatedData = this.parseAndValidateData(JSON.stringify(backupData));
      
      if (validatedData) {
        this.data = validatedData;
        this.saveData();
        console.log('✅ Data restored from backup');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to restore from backup:', error);
      return false;
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

  // Events
  getEvents(): Event[] {
    return this.data.events;
  }

  createEvent(event: InsertEvent): Event {
    const newEvent: Event = {
      ...event,
      id: nanoid(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.data.events.push(newEvent);
    this.saveData();
    return newEvent;
  }

  updateEvent(id: string, updates: Partial<InsertEvent>): Event | null {
    const index = this.data.events.findIndex(e => e.id === id);
    if (index === -1) return null;
    
    this.data.events[index] = { 
      ...this.data.events[index], 
      ...updates, 
      updatedAt: new Date()
    };
    this.saveData();
    return this.data.events[index];
  }

  deleteEvent(id: string): boolean {
    const index = this.data.events.findIndex(e => e.id === id);
    if (index === -1) return false;
    
    this.data.events.splice(index, 1);
    this.saveData();
    return true;
  }

  getEventsByDateRange(startDate: Date, endDate: Date): Event[] {
    return this.data.events.filter(event => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      return (eventStart >= startDate && eventStart <= endDate) ||
             (eventEnd >= startDate && eventEnd <= endDate) ||
             (eventStart <= startDate && eventEnd >= endDate);
    });
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

  createBackup(): void {
    try {
      const backup = {
        data: this.data,
        timestamp: new Date().toISOString(),
        version: APP_VERSION
      };
      localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
    } catch (error) {
      console.error('❌ Failed to create backup:', error);
    }
  }

  // Get all data
  getAllData(): AppData {
    return this.data;
  }
}

export const storage = new StorageService();
