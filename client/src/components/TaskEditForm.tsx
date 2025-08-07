import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { DayPicker } from 'react-day-picker';
import { CalendarIcon, Check, X, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Task, BlockType, insertTaskSchema, Subtask } from '@shared/schema';
import { z } from 'zod';
import { nanoid } from 'nanoid';

const editTaskSchema = insertTaskSchema.extend({
  id: z.string(),
}).partial().required({ id: true, title: true });

type EditTaskData = z.infer<typeof editTaskSchema>;

interface TaskEditFormProps {
  task: Task;
  blockTypes: BlockType[];
  onSave: (data: Partial<Task>) => void;
  onCancel: () => void;
}

export function TaskEditForm({ task, blockTypes, onSave, onCancel }: TaskEditFormProps) {
  const [subtasks, setSubtasks] = useState<Subtask[]>(task.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const form = useForm<EditTaskData>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      id: task.id,
      title: task.title,
      description: task.description || '',
      blockTypeId: task.blockTypeId || undefined,
      priority: task.priority || false,
      deadline: task.deadline ? new Date(task.deadline) : undefined,
    }
  });

  const handleSubmit = (data: EditTaskData) => {
    const { id, ...updateData } = data;
    onSave({ ...updateData, subtasks });
  };

  const addSubtask = () => {
    if (newSubtaskTitle.trim()) {
      const newSubtask: Subtask = {
        id: nanoid(),
        title: newSubtaskTitle.trim(),
        completed: false,
        createdAt: new Date(),
      };
      setSubtasks([...subtasks, newSubtask]);
      setNewSubtaskTitle('');
    }
  };

  const toggleSubtask = (subtaskId: string) => {
    setSubtasks(subtasks.map(subtask => 
      subtask.id === subtaskId 
        ? { ...subtask, completed: !subtask.completed }
        : subtask
    ));
  };

  const deleteSubtask = (subtaskId: string) => {
    setSubtasks(subtasks.filter(subtask => subtask.id !== subtaskId));
  };

  const updateSubtaskTitle = (subtaskId: string, newTitle: string) => {
    setSubtasks(subtasks.map(subtask => 
      subtask.id === subtaskId 
        ? { ...subtask, title: newTitle }
        : subtask
    ));
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mt-3 border border-gray-200 dark:border-gray-600">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Task title..." 
                    {...field} 
                    data-testid="input-edit-task-title"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Add a description..." 
                    className="min-h-[80px] resize-none"
                    {...field}
                    data-testid="textarea-edit-task-description"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="blockTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Block Type</FormLabel>
                  <Select value={field.value || "none"} onValueChange={(value) => field.onChange(value === "none" ? undefined : value)}>
                    <FormControl>
                      <SelectTrigger data-testid="select-edit-task-blocktype">
                        <SelectValue placeholder="Select block type..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
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
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deadline</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          data-testid="button-edit-task-deadline"
                        >
                          {field.value ? format(field.value, "PPP") : "Pick a date"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <DayPicker
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        className="p-3"
                      />
                      {field.value && (
                        <div className="p-3 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => field.onChange(undefined)}
                            className="w-full"
                          >
                            Clear Date
                          </Button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>High Priority</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Mark this task as high priority
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="switch-edit-task-priority"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Subtasks Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Subtasks</Label>
            
            {/* Existing Subtasks */}
            <div className="space-y-2">
              {subtasks.map((subtask) => (
                <div 
                  key={subtask.id}
                  className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-700 rounded border"
                >
                  <Checkbox
                    checked={subtask.completed}
                    onCheckedChange={() => toggleSubtask(subtask.id)}
                    data-testid={`checkbox-subtask-${subtask.id}`}
                  />
                  <Input
                    value={subtask.title}
                    onChange={(e) => updateSubtaskTitle(subtask.id, e.target.value)}
                    className={cn(
                      "flex-1 border-none shadow-none focus:ring-0",
                      subtask.completed && "line-through text-gray-500"
                    )}
                    data-testid={`input-subtask-title-${subtask.id}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSubtask(subtask.id)}
                    className="text-red-500 hover:text-red-700"
                    data-testid={`button-delete-subtask-${subtask.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Add New Subtask */}
            <div className="flex items-center space-x-2">
              <Input
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Add a subtask..."
                onKeyPress={(e) => e.key === 'Enter' && addSubtask()}
                data-testid="input-new-subtask"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSubtask}
                disabled={!newSubtaskTitle.trim()}
                data-testid="button-add-subtask"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              data-testid="button-cancel-edit-task"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button 
              type="submit"
              data-testid="button-save-edit-task"
            >
              <Check className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}