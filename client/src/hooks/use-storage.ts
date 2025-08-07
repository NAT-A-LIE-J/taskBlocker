import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { AppData } from '@shared/schema';

export function useStorage() {
  const [data, setData] = useState<AppData>(storage.getAllData());

  const refreshData = () => {
    setData(storage.getAllData());
  };

  useEffect(() => {
    // Subscribe to storage changes for auto-refresh
    const unsubscribe = storage.subscribe(refreshData);

    // Set up periodic backups (weekly)
    const backupInterval = setInterval(() => {
      storage.createBackup();
    }, 7 * 24 * 60 * 60 * 1000); // 7 days

    return () => {
      unsubscribe();
      clearInterval(backupInterval);
    };
  }, []);

  const updateSettings = (updates: Partial<AppData['settings']>) => {
    storage.updateSettings(updates);
    // Auto-refresh handled by subscription
  };

  const archiveTask = (taskId: string) => {
    storage.archiveTask(taskId);
    // Auto-refresh handled by subscription
  };

  const unarchiveTask = (taskId: string) => {
    storage.unarchiveTask(taskId);
    // Auto-refresh handled by subscription
  };

  const deleteArchivedTasks = () => {
    const count = storage.deleteArchivedTasks();
    // Auto-refresh handled by subscription
    return count;
  };

  const getArchivedTasks = () => {
    return storage.getArchivedTasks();
  };

  // Export/Import functions
  const exportJsonData = () => {
    try {
      storage.downloadJsonExport();
      return { success: true, message: 'Data exported successfully!' };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Export failed' };
    }
  };

  const importJsonData = async (file: File): Promise<{ success: boolean; message: string; stats?: any }> => {
    try {
      const text = await file.text();
      const result = await storage.importFromJson(text);
      // Auto-refresh handled by subscription
      return result;
    } catch (error) {
      return { 
        success: false, 
        message: 'Failed to read file. Please check the file format.' 
      };
    }
  };

  const restoreBackup = () => {
    const success = storage.restoreFromBackup();
    // Auto-refresh handled by subscription
    return success;
  };

  return {
    data,
    refreshData,
    storage,
    updateSettings,
    archiveTask,
    unarchiveTask,
    deleteArchivedTasks,
    getArchivedTasks,
    exportJsonData,
    importJsonData,
    restoreBackup,
  };
}
