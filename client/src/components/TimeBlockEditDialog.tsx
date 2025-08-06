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
import { TIME_SLOTS, formatTime12Hour } from '@/lib/time-utils';

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
  const [startTime, setStartTime] = useState(timeBlock?.startTime || '');
  const [endTime, setEndTime] = useState(timeBlock?.endTime || '');

  // Reset form when timeBlock changes
  React.useEffect(() => {
    if (timeBlock) {
      setBlockTypeId(timeBlock.blockTypeId);
      setStartTime(timeBlock.startTime);
      setEndTime(timeBlock.endTime);
    }
  }, [timeBlock]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (timeBlock && blockTypeId && startTime && endTime) {
      onUpdate(timeBlock.id, {
        blockTypeId,
        startTime,
        endTime,
      });
      onClose();
    }
  };

  const handleDelete = () => {
    if (timeBlock && confirm('Are you sure you want to delete this time block?')) {
      onDelete(timeBlock.id);
      onClose();
    }
  };

  const getAvailableEndTimes = () => {
    const startIndex = TIME_SLOTS.indexOf(startTime);
    if (startIndex === -1) return TIME_SLOTS;
    
    // Return times from start time onwards, plus the final slot at 23:30
    return [...TIME_SLOTS.slice(startIndex + 1), '23:30'];
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
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger data-testid="select-start-time">
                  <SelectValue placeholder="Start time" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((time) => (
                    <SelectItem key={time} value={time}>
                      {formatTime12Hour(time)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger data-testid="select-end-time">
                  <SelectValue placeholder="End time" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableEndTimes().map((time) => (
                    <SelectItem key={time} value={time}>
                      {formatTime12Hour(time)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                {startTime && endTime && (
                  `${formatTime12Hour(startTime)} - ${formatTime12Hour(endTime)}`
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
                disabled={!blockTypeId || !startTime || !endTime}
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