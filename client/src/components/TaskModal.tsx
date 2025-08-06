import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Star, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, setHours, setMinutes } from 'date-fns';
import { useTasks } from '@/hooks/use-tasks';
import { InsertTask } from '@shared/schema';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId?: string;
}

export function TaskModal({ isOpen, onClose, taskId }: TaskModalProps) {
  const { tasks, blockTypes, createTask, updateTask } = useTasks();
  const existingTask = taskId ? tasks.find(t => t.id === taskId) : null;

  const [formData, setFormData] = useState<InsertTask>({
    title: existingTask?.title || '',
    description: existingTask?.description || '',
    deadline: existingTask?.deadline,
    priority: existingTask?.priority || false,
    blockTypeId: existingTask?.blockTypeId,
    completed: existingTask?.completed || false,
    archived: existingTask?.archived || false,
    subtasks: existingTask?.subtasks || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deadlineDateOpen, setDeadlineDateOpen] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper functions for date/time handling
  const formatDisplayDateTime = (date: Date | null | undefined) => {
    if (!date) return 'Select deadline';
    return format(date, 'MMM d, yyyy h:mm a');
  };

  const formatDateTimeForInput = (date: Date | null | undefined) => {
    if (!date) return '';
    return format(date, "yyyy-MM-dd'T'HH:mm");
  };

  const updateDeadlineDateTime = (date: Date, time?: string) => {
    let newDate = new Date(date);
    
    if (time) {
      const [hours, minutes] = time.split(':').map(Number);
      newDate = setHours(setMinutes(newDate, minutes), hours);
    }
    
    setFormData({
      ...formData,
      deadline: newDate
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (existingTask) {
        updateTask(existingTask.id, formData);
      } else {
        createTask(formData);
      }
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        deadline: undefined,
        priority: false,
        blockTypeId: undefined,
        completed: false,
        archived: false,
        subtasks: [],
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      deadline: undefined,
      priority: false,
      blockTypeId: undefined,
      completed: false,
      archived: false,
      subtasks: [],
    });
    setErrors({});
    onClose();
  };



  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle data-testid="text-modal-title">
            {existingTask ? 'Edit Task' : 'Add New Task'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Title */}
          <div>
            <Label htmlFor="title" className="text-sm font-medium">
              Task Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter task title..."
              className={errors.title ? 'border-red-500' : ''}
              data-testid="input-task-title"
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add task details..."
              rows={3}
              className="resize-none"
              data-testid="textarea-task-description"
            />
          </div>

          {/* Block Type */}
          <div>
            <Label className="text-sm font-medium">Block Type</Label>
            <Select
              value={formData.blockTypeId || 'unassigned'}
              onValueChange={(value) => 
                setFormData({ 
                  ...formData, 
                  blockTypeId: value === 'unassigned' ? undefined : value 
                })
              }
            >
              <SelectTrigger data-testid="select-block-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {blockTypes.map(blockType => (
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

          {/* Deadline and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="deadline" className="text-sm font-medium">
                Deadline (Optional)
              </Label>
              <div className="space-y-2">
                <Popover open={deadlineDateOpen} onOpenChange={setDeadlineDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.deadline && "text-muted-foreground"
                      )}
                      data-testid="button-deadline-date-picker"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formatDisplayDateTime(formData.deadline)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.deadline || undefined}
                      onSelect={(date) => {
                        if (date) {
                          const currentTime = formData.deadline ? format(formData.deadline, 'HH:mm') : '09:00';
                          updateDeadlineDateTime(date, currentTime);
                          setDeadlineDateOpen(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="time"
                  value={formData.deadline ? format(formData.deadline, 'HH:mm') : ''}
                  onChange={(e) => {
                    const currentDate = formData.deadline || new Date();
                    updateDeadlineDateTime(currentDate, e.target.value);
                  }}
                  placeholder="09:00"
                  data-testid="input-deadline-time"
                />
              </div>
            </div>
            
            <div className="flex items-end">
              <div className="flex items-center space-x-2 py-3">
                <Checkbox
                  id="priority"
                  checked={formData.priority}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, priority: !!checked })
                  }
                  data-testid="checkbox-priority"
                />
                <Label htmlFor="priority" className="text-sm font-medium flex items-center space-x-1">
                  <span>Priority</span>
                  <Star className="w-4 h-4 text-orange-500" />
                </Label>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              data-testid="button-cancel-task"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="button-save-task"
            >
              {existingTask ? 'Update Task' : 'Add Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
