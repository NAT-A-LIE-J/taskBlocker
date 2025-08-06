import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Square, Plus, Minus, Star, Check } from 'lucide-react';
import { useTimer } from '@/hooks/use-timer';
import { useTasks } from '@/hooks/use-tasks';
import { cn } from '@/lib/utils';

interface TimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockTypeId?: string;
}

export function TimerModal({ isOpen, onClose, blockTypeId }: TimerModalProps) {
  const { timerState, startTimer, pauseTimer, resumeTimer, stopTimer, adjustTimer, formatTime, getProgress, getCurrentActiveBlockData } = useTimer();
  const { tasks, blockTypes, toggleTaskCompletion } = useTasks();

  const activeBlockData = getCurrentActiveBlockData();
  const currentBlockType = blockTypeId 
    ? blockTypes.find(bt => bt.id === blockTypeId)
    : activeBlockData?.blockType;

  const blockTasks = currentBlockType 
    ? tasks.filter(task => task.blockTypeId === currentBlockType.id && !task.completed)
    : [];
  const completedBlockTasks = currentBlockType
    ? tasks.filter(task => task.blockTypeId === currentBlockType.id && task.completed)
    : [];

  const handleStartTimer = () => {
    if (currentBlockType) {
      startTimer(currentBlockType.id);
    }
  };

  const handleToggleTimer = () => {
    if (timerState.isPaused) {
      resumeTimer();
    } else {
      pauseTimer();
    }
  };

  const progress = getProgress();
  const circumference = 2 * Math.PI * 45; // radius of 45
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  if (!currentBlockType) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-screen overflow-auto p-0">
        {/* Timer Header */}
        <DialogHeader className="p-6 border-b border-gray-100 dark:border-gray-700">
          <DialogTitle className="text-2xl font-bold text-blue-600" data-testid="text-timer-block-name">
            {currentBlockType.name}
          </DialogTitle>
          <p className="text-gray-500">Focus session in progress</p>
        </DialogHeader>

        <div className="flex p-6 space-x-8">
          {/* Timer Display */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-64 h-64 mb-8">
              {/* Progress Circle */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100" data-testid="timer-circle">
                <circle 
                  cx="50" cy="50" r="45" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  fill="none"
                  className="text-gray-200 dark:text-gray-600"
                />
                <circle 
                  cx="50" cy="50" r="45" 
                  stroke={currentBlockType.color}
                  strokeWidth="4" 
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-300 ease-out"
                />
              </svg>
              
              {/* Timer Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl font-bold" data-testid="text-timer-display">
                  {formatTime(timerState.timeRemaining)}
                </div>
                <div className="text-sm text-gray-500">remaining</div>
              </div>
            </div>
            
            {/* Timer Controls */}
            <div className="flex items-center space-x-4 mb-6">
              <Button
                variant="outline"
                size="icon"
                className="touch-target w-12 h-12 rounded-full"
                onClick={() => adjustTimer(-5)}
                disabled={!timerState.isActive}
                data-testid="button-timer-minus"
              >
                <Minus className="w-4 h-4" />
              </Button>
              
              <Button
                size="lg"
                className="touch-target w-16 h-16 rounded-full"
                style={{ backgroundColor: currentBlockType.color }}
                onClick={timerState.isActive ? handleToggleTimer : handleStartTimer}
                data-testid="button-timer-play-pause"
              >
                {timerState.isActive ? (
                  timerState.isPaused ? (
                    <Play className="w-6 h-6 text-white" />
                  ) : (
                    <Pause className="w-6 h-6 text-white" />
                  )
                ) : (
                  <Play className="w-6 h-6 text-white" />
                )}
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                className="touch-target w-12 h-12 rounded-full"
                onClick={() => adjustTimer(5)}
                disabled={!timerState.isActive}
                data-testid="button-timer-plus"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Additional Controls */}
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => adjustTimer(25)}
                data-testid="button-extend-block"
              >
                Extend Block
              </Button>
              
              <Button
                variant="outline"
                onClick={stopTimer}
                disabled={!timerState.isActive}
                data-testid="button-stop-timer"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop
              </Button>
            </div>
          </div>
          
          {/* Task Panel */}
          <div className="w-96 bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" data-testid="text-timer-tasks-title">
                {currentBlockType.name} Tasks
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="touch-target"
                data-testid="button-add-task-timer"
              >
                <Plus className="w-4 h-4 text-blue-600" />
              </Button>
            </div>
            
            <div className="space-y-3 max-h-64 overflow-auto" data-testid="timer-task-list">
              {blockTasks.map(task => (
                <div
                  key={task.id}
                  className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-100 dark:border-gray-700"
                  data-testid={`timer-task-${task.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        {task.priority && <Star className="w-3 h-3 text-orange-500 fill-current" />}
                        <h4 className="font-medium text-sm truncate">{task.title}</h4>
                      </div>
                      {task.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      {task.priority && (
                        <div className="flex items-center mt-2">
                          <span className="text-xs text-gray-500">Priority</span>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="touch-target w-6 h-6 p-0 rounded-full border-2 border-gray-200 hover:border-green-500 ml-3 shrink-0"
                      onClick={() => toggleTaskCompletion(task.id)}
                      data-testid={`button-complete-timer-${task.id}`}
                    >
                      <span className="sr-only">Complete task</span>
                    </Button>
                  </div>
                </div>
              ))}
              
              {blockTasks.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <div className="text-2xl mb-2">📝</div>
                  <p className="text-sm">No tasks for this block type</p>
                </div>
              )}
            </div>
            
            {/* Progress Summary */}
            <div className="mt-6 p-3 rounded-lg" style={{ backgroundColor: `${currentBlockType.color}10` }}>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Session Progress</span>
                <span className="font-semibold" data-testid="text-progress-count">
                  {completedBlockTasks.length}/{completedBlockTasks.length + blockTasks.length} completed
                </span>
              </div>
              <Progress 
                value={blockTasks.length + completedBlockTasks.length > 0 
                  ? (completedBlockTasks.length / (blockTasks.length + completedBlockTasks.length)) * 100 
                  : 0
                }
                className="h-2"
                data-testid="progress-session"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
