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

    const updated = storage.updateTask(id, { completed: !task.completed });
    if (updated) {
      refreshData();
      toast({
        title: updated.completed ? "Task completed" : "Task reopened",
        description: updated.completed ? "Great job!" : "Task marked as incomplete.",
      });
    }
    return updated;
  }, [data.tasks, storage, refreshData, toast]);

  const getTasksByBlockType = useCallback((blockTypeId?: string) => {
    return data.tasks.filter(task => task.blockTypeId === blockTypeId);
  }, [data.tasks]);

  const getPriorityTasks = useCallback(() => {
    return data.tasks.filter(task => task.priority && !task.completed);
  }, [data.tasks]);

  const getUnassignedTasks = useCallback(() => {
    return data.tasks.filter(task => !task.blockTypeId && !task.completed);
  }, [data.tasks]);

  return {
    tasks: data.tasks,
    blockTypes: data.blockTypes,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    getTasksByBlockType,
    getPriorityTasks,
    getUnassignedTasks,
  };
}
