import React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { type BlockType } from '@shared/schema';

interface BlockTypeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; color: string }) => void;
  blockType?: BlockType; // For editing existing block types
}

export function BlockTypeDialog({ isOpen, onClose, onSave, blockType }: BlockTypeDialogProps) {
  const [name, setName] = useState(blockType?.name || '');
  const [color, setColor] = useState(blockType?.color || '#3b82f6');

  const predefinedColors = [
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6', // Purple
    '#06b6d4', // Cyan
    '#f97316', // Orange
    '#84cc16', // Lime
    '#ec4899', // Pink
    '#6b7280', // Gray
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave({ name: name.trim(), color });
      handleClose();
    }
  };

  const handleClose = () => {
    setName(blockType?.name || '');
    setColor(blockType?.color || '#3b82f6');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-block-type">
        <DialogHeader>
          <DialogTitle data-testid="title-block-type">
            {blockType ? 'Edit Block Type' : 'Create New Block Type'}
          </DialogTitle>
          <DialogDescription>
            {blockType 
              ? 'Update the name and color for this block type.'
              : 'Create a new block type for organizing your time blocks.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Deep Work, Exercise, Reading"
              required
              data-testid="input-block-type-name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                id="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                data-testid="input-block-type-color"
              />
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#3b82f6"
                className="flex-1"
                data-testid="input-block-type-color-text"
              />
            </div>
            
            {/* Predefined color palette */}
            <div className="grid grid-cols-10 gap-2 mt-2">
              {predefinedColors.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  className="w-6 h-6 rounded border-2 border-gray-200 hover:border-gray-400 transition-colors"
                  style={{ backgroundColor: presetColor }}
                  onClick={() => setColor(presetColor)}
                  data-testid={`color-preset-${presetColor}`}
                />
              ))}
            </div>
          </div>
          
          <DialogFooter className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              data-testid="button-cancel-block-type"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              data-testid="button-save-block-type"
            >
              {blockType ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}