import { useState, useCallback } from 'react';
import { TimeBlock, InsertTimeBlock, BlockType, InsertBlockType } from '@shared/schema';
import { useStorage } from './use-storage';
import { checkTimeBlockOverlap } from '@/lib/time-utils';
import { useToast } from './use-toast';

export function useTimeBlocks() {
  const { data, refreshData, storage } = useStorage();
  const { toast } = useToast();

  // Time Block functions
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
      toast({
        title: "Time block updated",
        description: "Your changes have been saved.",
      });
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

  // Block Type functions
  const createBlockType = useCallback((blockType: InsertBlockType): BlockType | null => {
    // Check if name already exists
    if (data.blockTypes.some(bt => bt.name.toLowerCase() === blockType.name.toLowerCase())) {
      toast({
        title: "Name already exists",
        description: "A block type with this name already exists.",
        variant: "destructive",
      });
      return null;
    }

    const newBlockType = storage.createBlockType(blockType);
    refreshData();
    toast({
      title: "Block type created",
      description: `"${blockType.name}" has been added to your block types.`,
    });
    return newBlockType;
  }, [data.blockTypes, storage, refreshData, toast]);

  const updateBlockType = useCallback((id: string, updates: Partial<InsertBlockType>): BlockType | null => {
    // Check if name already exists (excluding current block type)
    if (updates.name && data.blockTypes.some(bt => 
      bt.id !== id && bt.name.toLowerCase() === updates.name!.toLowerCase()
    )) {
      toast({
        title: "Name already exists",
        description: "A block type with this name already exists.",
        variant: "destructive",
      });
      return null;
    }

    const updated = storage.updateBlockType(id, updates);
    if (updated) {
      refreshData();
      toast({
        title: "Block type updated",
        description: "Your changes have been saved.",
      });
    }
    return updated;
  }, [data.blockTypes, storage, refreshData, toast]);

  const deleteBlockType = useCallback((id: string): boolean => {
    const success = storage.deleteBlockType(id);
    if (success) {
      refreshData();
      toast({
        title: "Block type deleted",
        description: "The block type has been removed.",
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
    createBlockType,
    updateBlockType,
    deleteBlockType,
  };
}
