import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Expand, Combine, Plus, Search, Filter, Star, AlertCircle } from 'lucide-react';
import { useTasks } from '@/hooks/use-tasks';
import { Task } from '@shared/schema';
import { cn } from '@/lib/utils';
import { getDeadlineUrgency } from '@/lib/time-utils';

interface TodoListProps {
  isExpanded: boolean;
  onToggleExpansion: () => void;
  onAddTask: () => void;
}

export function TodoList({ isExpanded, onToggleExpansion, onAddTask }: TodoListProps) {
  const { tasks, blockTypes, toggleTaskCompletion } = useTasks();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlockType, setSelectedBlockType] = useState<string>('all');

  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter(task => !task.completed);

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply block type filter
    if (selectedBlockType !== 'all') {
      if (selectedBlockType === 'unassigned') {
        filtered = filtered.filter(task => !task.blockTypeId);
      } else {
        filtered = filtered.filter(task => task.blockTypeId === selectedBlockType);
      }
    }

    return filtered;
  }, [tasks, searchQuery, selectedBlockType]);

  const priorityTasks = filteredTasks.filter(task => task.priority);
  const tasksByBlockType = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    
    blockTypes.forEach(blockType => {
      const blockTasks = filteredTasks.filter(task => task.blockTypeId === blockType.id);
      if (blockTasks.length > 0) {
        grouped[blockType.id] = blockTasks.sort((a, b) => {
          // Priority tasks first, then by creation date
          if (a.priority && !b.priority) return -1;
          if (!a.priority && b.priority) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      }
    });
    
    return grouped;
  }, [filteredTasks, blockTypes]);

  const unassignedTasks = filteredTasks.filter(task => !task.blockTypeId);

  const TaskItem = ({ task, blockType }: { task: Task; blockType?: any }) => {
    const urgency = task.deadline ? getDeadlineUrgency(task.deadline) : null;
    
    return (
      <div
        className={cn(
          "task-item bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200",
          task.priority && "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
        )}
        data-testid={`task-${task.id}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              {task.priority && <Star className="w-4 h-4 text-orange-500 fill-current" />}
              <h4 className="font-medium text-sm truncate">{task.title}</h4>
            </div>
            
            {task.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
            
            <div className="flex items-center mt-2 space-x-3">
              {blockType && (
                <span 
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: `${blockType.color}20`,
                    color: blockType.color 
                  }}
                >
                  {blockType.name}
                </span>
              )}
              
              {task.deadline && (
                <div className="flex items-center space-x-1">
                  <AlertCircle className={cn(
                    "w-3 h-3",
                    urgency === 'overdue' && "text-red-500",
                    urgency === 'today' && "text-orange-500",
                    urgency === 'this-week' && "text-yellow-500",
                    urgency === 'future' && "text-gray-400"
                  )} />
                  <span className="text-xs text-gray-500">
                    Due: {new Date(task.deadline).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              )}
              
              <span className="text-xs text-gray-400">
                Created: {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="touch-target w-6 h-6 p-0 rounded-full border-2 border-gray-200 hover:border-green-500 ml-3 shrink-0"
            onClick={() => toggleTaskCompletion(task.id)}
            data-testid={`button-complete-${task.id}`}
          >
            <span className="sr-only">Complete task</span>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className={cn(
      "view-transition bg-white dark:bg-gray-900 flex flex-col",
      isExpanded ? "w-full" : "w-96"
    )}>
      {/* Todo Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold" data-testid="text-todo-title">Tasks</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onAddTask}
            className="touch-target text-blue-600"
            title="Add Task"
            data-testid="button-add-task"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleExpansion}
            className="touch-target"
            title={isExpanded ? "Collapse Todo List" : "Expand Todo List"}
            data-testid="button-expand-todo"
          >
            {isExpanded ? <Combine className="w-4 h-4" /> : <Expand className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      
      {/* Filter/Search */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-tasks"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={selectedBlockType} onValueChange={setSelectedBlockType}>
            <SelectTrigger className="flex-1" data-testid="select-block-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Block Types</SelectItem>
              {blockTypes.map(blockType => (
                <SelectItem key={blockType.id} value={blockType.id}>
                  {blockType.name}
                </SelectItem>
              ))}
              <SelectItem value="unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            className="touch-target"
            data-testid="button-filter"
          >
            <Filter className="w-4 h-4 text-gray-400" />
          </Button>
        </div>
      </div>
      
      {/* Task List */}
      <div className="flex-1 overflow-auto p-4 space-y-6" data-testid="task-list">
        {/* Priority Tasks Section */}
        {priorityTasks.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center">
              <Star className="w-4 h-4 text-orange-500 mr-2 fill-current" />
              Priority Tasks ({priorityTasks.length})
            </h3>
            <div className="space-y-2">
              {priorityTasks.map(task => {
                const blockType = task.blockTypeId ? blockTypes.find(bt => bt.id === task.blockTypeId) : undefined;
                return <TaskItem key={task.id} task={task} blockType={blockType} />;
              })}
            </div>
          </div>
        )}
        
        {/* Tasks by Block Type */}
        {Object.entries(tasksByBlockType).map(([blockTypeId, blockTypeTasks]) => {
          const blockType = blockTypes.find(bt => bt.id === blockTypeId);
          if (!blockType) return null;
          
          return (
            <div key={blockTypeId}>
              <h3 className="text-sm font-semibold mb-3 flex items-center" style={{ color: blockType.color }}>
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: blockType.color }}
                />
                {blockType.name} ({blockTypeTasks.length} task{blockTypeTasks.length !== 1 ? 's' : ''})
              </h3>
              <div className="space-y-2">
                {blockTypeTasks.map(task => (
                  <TaskItem key={task.id} task={task} blockType={blockType} />
                ))}
              </div>
            </div>
          );
        })}
        
        {/* Unassigned Tasks */}
        {unassignedTasks.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center">
              <div className="w-3 h-3 bg-gray-400 rounded-full mr-2" />
              Unassigned ({unassignedTasks.length} task{unassignedTasks.length !== 1 ? 's' : ''})
            </h3>
            <div className="space-y-2 opacity-75">
              {unassignedTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}
        
        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <div className="text-center py-12 text-gray-500" data-testid="empty-state">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="font-medium mb-2">No tasks found</h3>
            <p className="text-sm">
              {searchQuery || selectedBlockType !== 'all' 
                ? 'Try adjusting your filters or search query.'
                : 'Start by adding your first task!'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
