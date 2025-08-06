import { useState, useCallback } from 'react';
import { TimeBlock, InsertTimeBlock } from '@shared/schema';
import { useStorage } from './use-storage';
import { checkTimeBlockOverlap } from '@/lib/time-utils';
import { useToast } from './use-toast';

export function useTimeBlocks() {
  const { data, refreshData, storage } = useStorage();
  const { toast } = useToast();

  const createTimeBlock = useCallback((timeBlock: InsertTimeBlock): TimeBlock | null => {
    // Check for overlaps
    if (checkTimeBlockOverlap(data.timeBlocks, timeBlock)) {
      toast({
        title: "Overlap detected",
        description: "This time block overlaps with an existing block.",
        variant: "destructive",
      });
      return null;
    }

    const newBlock = storage.createTimeBlock(timeBlock);
    refreshData();
    return newBlock;
  }, [data.timeBlocks, storage, refreshData, toast]);

  const updateTimeBlock = useCallback((id: string, updates: Partial<InsertTimeBlock>): TimeBlock | null => {
    const currentBlock = data.timeBlocks.find(b => b.id === id);
    if (!currentBlock) return null;

    const updatedData = { ...currentBlock, ...updates };
    
    // Check for overlaps (excluding current block)
    if (checkTimeBlockOverlap(data.timeBlocks, updatedData, id)) {
      toast({
        title: "Overlap detected",
        description: "This time block would overlap with an existing block.",
        variant: "destructive",
      });
      return null;
    }

    const updated = storage.updateTimeBlock(id, updates);
    if (updated) {
      refreshData();
    }
    return updated;
  }, [data.timeBlocks, storage, refreshData, toast]);

  const deleteTimeBlock = useCallback((id: string): boolean => {
    const success = storage.deleteTimeBlock(id);
    if (success) {
      refreshData();
      toast({
        title: "Time block deleted",
        description: "The time block has been removed.",
      });
    }
    return success;
  }, [storage, refreshData, toast]);

  return {
    timeBlocks: data.timeBlocks,
    blockTypes: data.blockTypes,
    createTimeBlock,
    updateTimeBlock,
    deleteTimeBlock,
  };
}
