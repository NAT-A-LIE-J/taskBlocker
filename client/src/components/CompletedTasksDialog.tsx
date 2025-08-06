import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2, CheckCircle2, Trash, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Task } from '@shared/schema';
import { format } from 'date-fns';

interface CompletedTasksDialogProps {
  isOpen: boolean;
  onClose: () => void;
  completedTasks: Task[];
  onDeleteTask: (taskId: string) => void;
  onDeleteAllCompleted: () => void;
}

export function CompletedTasksDialog({ 
  isOpen, 
  onClose, 
  completedTasks, 
  onDeleteTask, 
  onDeleteAllCompleted 
}: CompletedTasksDialogProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());

  const toggleTaskSelection = (taskId: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const selectAll = () => {
    setSelectedTasks(new Set(completedTasks.map(task => task.id)));
  };

  const clearSelection = () => {
    setSelectedTasks(new Set());
  };

  const deleteSelected = () => {
    selectedTasks.forEach(taskId => onDeleteTask(taskId));
    setSelectedTasks(new Set());
  };

  const displayedTasks = isExpanded ? completedTasks : completedTasks.slice(0, 5);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span>Completed Tasks</span>
            <span className="text-sm text-muted-foreground">
              ({completedTasks.length} total)
            </span>
          </DialogTitle>
        </DialogHeader>

        {completedTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500/30" />
            <p>No completed tasks yet.</p>
            <p className="text-sm">Completed tasks will appear here for cleanup.</p>
          </div>
        ) : (
          <div className="flex flex-col space-y-4 flex-1 min-h-0">
            {/* Action Bar */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectedTasks.size === completedTasks.length ? clearSelection : selectAll}
                  data-testid="button-select-all-completed"
                >
                  {selectedTasks.size === completedTasks.length ? 'Clear All' : 'Select All'}
                </Button>
                {selectedTasks.size > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {selectedTasks.size} selected
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {selectedTasks.size > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={deleteSelected}
                    data-testid="button-delete-selected"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onDeleteAllCompleted}
                  data-testid="button-delete-all-completed"
                >
                  <Trash className="w-4 h-4 mr-2" />
                  Delete All
                </Button>
              </div>
            </div>

            {/* Tasks List */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {displayedTasks.map(task => (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg border transition-all hover:bg-muted/50",
                    selectedTasks.has(task.id) 
                      ? "bg-primary/10 border-primary/50" 
                      : "bg-background border-border"
                  )}
                  data-testid={`completed-task-${task.id}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedTasks.has(task.id)}
                    onChange={() => toggleTaskSelection(task.id)}
                    className="w-4 h-4 rounded"
                    data-testid={`checkbox-select-task-${task.id}`}
                  />
                  
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm line-through opacity-75">
                      {task.title}
                    </div>
                    {task.description && (
                      <div className="text-xs text-muted-foreground mt-1 line-through opacity-60">
                        {task.description}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      Completed {format(task.createdAt, 'MMM d, yyyy')}
                    </div>
                  </div>
                  
                  {task.priority && (
                    <div className="text-orange-400 text-xs font-medium">
                      High Priority
                    </div>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteTask(task.id)}
                    className="text-destructive hover:text-destructive"
                    data-testid={`button-delete-completed-task-${task.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Expand/Collapse Button */}
            {completedTasks.length > 5 && (
              <div className="text-center pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  data-testid="button-toggle-completed-tasks"
                >
                  {isExpanded ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Show All ({completedTasks.length - 5} more)
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}