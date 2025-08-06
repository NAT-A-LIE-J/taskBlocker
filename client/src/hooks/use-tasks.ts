import { useCallback } from 'react';
import { Task, InsertTask } from '@shared/schema';
import { useStorage } from './use-storage';
import { useToast } from './use-toast';

export function useTasks() {
  const { data, refreshData, storage } = useStorage();
  const { toast } = useToast();

  const createTask = useCallback((task: InsertTask): Task => {
    const newTask = storage.createTask(task);
    refreshData();
    toast({
      title: "Task created",
      description: "Your task has been added successfully.",
    });
    return newTask;
  }, [storage, refreshData, toast]);

  const updateTask = useCallback((id: string, updates: Partial<InsertTask>): Task | null => {
    const updated = storage.updateTask(id, updates);
    if (updated) {
      refreshData();
    }
    return updated;
  }, [storage, refreshData]);

  const deleteTask = useCallback((id: string): boolean => {
    const success = storage.deleteTask(id);
    if (success) {
      refreshData();
      toast({
        title: "Task deleted",
        description: "The task has been removed.",
      });
    }
    return success;
  }, [storage, refreshData, toast]);

  const toggleTaskCompletion = useCallback((id: string): Task | null => {
    const task = data.tasks.find(t => t.id === id);
    if (!task) return null;

    const updated = storage.updateTask(id, { 
      completed: !task.completed,
      completedAt: !task.completed ? new Date() : undefined
    });
    if (updated) {
      refreshData();
      toast({
        title: updated.completed ? "Task completed" : "Task reopened",
        description: updated.completed ? "Great job!" : "Task marked as incomplete.",
      });
    }
    return updated;
  }, [data.tasks, storage, refreshData, toast]);

  const archiveTask = useCallback((id: string): boolean => {
    const success = storage.archiveTask(id);
    if (success) {
      refreshData();
      const task = data.tasks.find(t => t.id === id);
      toast({
        title: "Task archived",
        description: task ? `"${task.title}" moved to archive` : "Task archived",
      });
    }
    return success;
  }, [storage, refreshData, data.tasks, toast]);

  const getTasksByBlockType = useCallback((blockTypeId?: string) => {
    return data.tasks.filter(task => task.blockTypeId === blockTypeId);
  }, [data.tasks]);

  const getPriorityTasks = useCallback(() => {
    return data.tasks.filter(task => task.priority && !task.completed);
  }, [data.tasks]);

  const getUnassignedTasks = useCallback(() => {
    return data.tasks.filter(task => !task.blockTypeId && !task.completed);
  }, [data.tasks]);

  const getCompletedTasks = useCallback(() => {
    return data.tasks.filter(task => task.completed);
  }, [data.tasks]);

  const deleteAllCompleted = useCallback(() => {
    const completedTasks = data.tasks.filter(task => task.completed);
    completedTasks.forEach(task => storage.deleteTask(task.id));
    refreshData();
    toast({
      title: "All completed tasks deleted",
      description: `Removed ${completedTasks.length} completed tasks.`,
    });
  }, [data.tasks, storage, refreshData, toast]);

  return {
    tasks: data.tasks.filter(t => !t.archived),
    blockTypes: data.blockTypes,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    archiveTask,
    getTasksByBlockType,
    getPriorityTasks,
    getUnassignedTasks,
    getCompletedTasks,
    deleteAllCompleted,
  };
}
