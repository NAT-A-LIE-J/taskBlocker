import React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';
import { type TimeBlock, type BlockType } from '@shared/schema';
import { formatTime12Hour, validateTimeFormat, convertTo24Hour } from '@/lib/time-utils';

interface TimeBlockEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  timeBlock: TimeBlock | null;
  blockTypes: BlockType[];
  onUpdate: (id: string, updates: { blockTypeId?: string; startTime?: string; endTime?: string }) => void;
  onDelete: (id: string) => void;
}

export function TimeBlockEditDialog({ 
  isOpen, 
  onClose, 
  timeBlock, 
  blockTypes, 
  onUpdate, 
  onDelete 
}: TimeBlockEditDialogProps) {
  const [blockTypeId, setBlockTypeId] = useState(timeBlock?.blockTypeId || '');
  const [startTimeInput, setStartTimeInput] = useState('');
  const [endTimeInput, setEndTimeInput] = useState('');
  const [startTimeError, setStartTimeError] = useState('');
  const [endTimeError, setEndTimeError] = useState('');

  // Reset form when timeBlock changes
  React.useEffect(() => {
    if (timeBlock) {
      setBlockTypeId(timeBlock.blockTypeId);
      // Convert 24-hour format to 12-hour for display
      setStartTimeInput(formatTime12Hour(timeBlock.startTime));
      setEndTimeInput(formatTime12Hour(timeBlock.endTime));
      setStartTimeError('');
      setEndTimeError('');
    }
  }, [timeBlock]);

  const validateAndSetStartTime = (value: string) => {
    setStartTimeInput(value);
    if (value && !validateTimeFormat(value)) {
      setStartTimeError('Invalid time format. Use 9:12 AM or 09:12');
    } else {
      setStartTimeError('');
    }
  };

  const validateAndSetEndTime = (value: string) => {
    setEndTimeInput(value);
    if (value && !validateTimeFormat(value)) {
      setEndTimeError('Invalid time format. Use 9:12 AM or 09:12');
    } else {
      setEndTimeError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!timeBlock || !blockTypeId || !startTimeInput || !endTimeInput) return;
    
    // Validate times before converting
    if (!validateTimeFormat(startTimeInput) || !validateTimeFormat(endTimeInput)) {
      return;
    }

    const startTime24 = convertTo24Hour(startTimeInput);
    const endTime24 = convertTo24Hour(endTimeInput);
    
    // Check that end time is after start time
    const startMinutes = parseInt(startTime24.split(':')[0]) * 60 + parseInt(startTime24.split(':')[1]);
    const endMinutes = parseInt(endTime24.split(':')[0]) * 60 + parseInt(endTime24.split(':')[1]);
    
    if (endMinutes <= startMinutes) {
      setEndTimeError('End time must be after start time');
      return;
    }

    onUpdate(timeBlock.id, {
      blockTypeId,
      startTime: startTime24,
      endTime: endTime24,
    });
    onClose();
  };

  const handleDelete = () => {
    if (timeBlock && confirm('Are you sure you want to delete this time block?')) {
      onDelete(timeBlock.id);
      onClose();
    }
  };



  const selectedBlockType = blockTypes.find(bt => bt.id === blockTypeId);

  if (!timeBlock) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-edit-timeblock">
        <DialogHeader>
          <DialogTitle data-testid="title-edit-timeblock">Edit Time Block</DialogTitle>
          <DialogDescription>
            Modify the block type, timing, or delete this time block.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="blockType">Block Type</Label>
            <Select value={blockTypeId} onValueChange={setBlockTypeId}>
              <SelectTrigger data-testid="select-block-type">
                <SelectValue placeholder="Select block type" />
              </SelectTrigger>
              <SelectContent>
                {blockTypes.map((blockType) => (
                  <SelectItem key={blockType.id} value={blockType.id}>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: blockType.color }}
                      />
                      <span>{blockType.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                value={startTimeInput}
                onChange={(e) => validateAndSetStartTime(e.target.value)}
                placeholder="9:12 AM or 09:12"
                className={startTimeError ? 'border-red-500' : ''}
                data-testid="input-start-time"
              />
              {startTimeError && (
                <p className="text-sm text-red-500" data-testid="error-start-time">{startTimeError}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                value={endTimeInput}
                onChange={(e) => validateAndSetEndTime(e.target.value)}
                placeholder="9:55 AM or 09:55"
                className={endTimeError ? 'border-red-500' : ''}
                data-testid="input-end-time"
              />
              {endTimeError && (
                <p className="text-sm text-red-500" data-testid="error-end-time">{endTimeError}</p>
              )}
            </div>
          </div>
          
          {/* Preview */}
          {selectedBlockType && (
            <div className="p-3 rounded-lg border" style={{ backgroundColor: `${selectedBlockType.color}10` }}>
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedBlockType.color }}
                />
                <span className="font-medium">{selectedBlockType.name}</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {startTimeInput && endTimeInput && !startTimeError && !endTimeError && (
                  `${startTimeInput} - ${endTimeInput}`
                )}
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDelete}
              className="flex items-center space-x-2"
              data-testid="button-delete-timeblock"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </Button>
            
            <div className="flex space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                data-testid="button-cancel-edit"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={!blockTypeId || !startTimeInput || !endTimeInput || !!startTimeError || !!endTimeError}
                data-testid="button-update-timeblock"
              >
                Update
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}