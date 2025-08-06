import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Pause, Play, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TimeBlock, Task, BlockType } from '@shared/schema';

interface FocusTimerProps {
  isOpen: boolean;
  onClose: () => void;
  currentBlock: TimeBlock | null;
  blockType: BlockType | null;
  tasks: Task[];
  weekStart: Date;
}

export function FocusTimer({ isOpen, onClose, currentBlock, blockType, tasks, weekStart }: FocusTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Calculate initial time remaining
  useEffect(() => {
    if (currentBlock && isOpen && weekStart) {
      const now = new Date();
      
      // Calculate the actual date for this time block
      const blockDate = new Date(weekStart);
      blockDate.setDate(blockDate.getDate() + currentBlock.dayOfWeek);
      
      // Parse end time and create full datetime
      const [endHours, endMinutes] = currentBlock.endTime.split(':').map(Number);
      const endTime = new Date(blockDate);
      endTime.setHours(endHours, endMinutes, 0, 0);
      
      const remaining = Math.max(0, endTime.getTime() - now.getTime());
      setTimeRemaining(Math.floor(remaining / 1000));
      setIsRunning(true);
      setIsPaused(false);
    }
  }, [currentBlock, isOpen, weekStart]);

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && !isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, isPaused, timeRemaining]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const stopTimer = () => {
    setIsRunning(false);
    onClose();
  };

  if (!isOpen || !currentBlock) {
    return null;
  }

  // Handle buffer time (when no specific block type is assigned)
  const isBufferTime = currentBlock.blockTypeId === 'buffer-time';
  const displayBlockType = isBufferTime ? {
    id: 'buffer-time',
    name: 'Buffer Time',
    color: '#6B7280', // gray-500
    createdAt: new Date()
  } : blockType;

  if (!displayBlockType) {
    return null;
  }

  // For buffer time, show universal tasks (tasks without blockTypeId)
  // For regular blocks, show tasks assigned to that block type
  const blockTasks = isBufferTime 
    ? tasks.filter(task => !task.blockTypeId) // Universal tasks
    : tasks.filter(task => task.blockTypeId === blockType?.id);
  
  const completedTasks = blockTasks.filter(task => task.completed);
  const pendingTasks = blockTasks.filter(task => !task.completed);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center">
      <div className="w-full h-full flex flex-col items-center justify-center text-white relative">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:bg-white/10"
          data-testid="button-close-timer"
        >
          <X className="w-6 h-6" />
        </Button>

        {/* Block Type Header */}
        <div className="text-center mb-8">
          <div 
            className="inline-flex items-center px-6 py-3 rounded-full text-lg font-semibold mb-4"
            style={{ 
              backgroundColor: `${displayBlockType.color}30`,
              color: displayBlockType.color,
              border: `2px solid ${displayBlockType.color}50`
            }}
          >
            <div 
              className="w-4 h-4 rounded-full mr-3" 
              style={{ backgroundColor: displayBlockType.color }}
            />
            {displayBlockType.name}
          </div>
          <div className="text-gray-300 text-lg">
            {currentBlock.startTime} - {currentBlock.endTime}
          </div>
        </div>

        {/* Timer Display */}
        <div className="text-center mb-12">
          <div className={cn(
            "text-8xl font-mono font-bold mb-4 transition-colors duration-300",
            timeRemaining <= 60 && timeRemaining > 0 ? "text-red-400" : "text-white",
            timeRemaining === 0 ? "text-green-400" : ""
          )}>
            {formatTime(timeRemaining)}
          </div>
          <div className="text-xl text-gray-300">
            {timeRemaining === 0 ? "Session Complete!" : 
             isPaused ? "Timer Paused" : "Time Remaining"}
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex items-center space-x-4 mb-8">
          <Button
            onClick={togglePause}
            disabled={timeRemaining === 0}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
            data-testid="button-pause-timer"
          >
            {isPaused ? (
              <>
                <Play className="w-5 h-5" />
                <span>Resume</span>
              </>
            ) : (
              <>
                <Pause className="w-5 h-5" />
                <span>Pause</span>
              </>
            )}
          </Button>
          
          <Button
            onClick={stopTimer}
            variant="outline"
            className="flex items-center space-x-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-6 py-3"
            data-testid="button-stop-timer"
          >
            <Square className="w-5 h-5" />
            <span>Stop</span>
          </Button>
        </div>

        {/* Associated Tasks */}
        {blockTasks.length > 0 && (
          <div className="max-w-2xl w-full px-8">
            <h3 className="text-2xl font-semibold mb-6 text-center">
              {isBufferTime ? 'Universal Tasks' : 'Associated Tasks'} ({completedTasks.length}/{blockTasks.length} completed)
            </h3>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-h-80 overflow-y-auto">
              <div className="space-y-3">
                {blockTasks.map(task => (
                  <div
                    key={task.id}
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-lg transition-all",
                      task.completed 
                        ? "bg-green-500/20 text-green-200" 
                        : "bg-white/10 text-white hover:bg-white/20"
                    )}
                    data-testid={`task-${task.id}`}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                      task.completed 
                        ? "bg-green-500 border-green-500" 
                        : "border-white/50"
                    )}>
                      {task.completed && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className={cn(
                        "font-medium",
                        task.completed && "line-through opacity-75"
                      )}>
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="text-sm opacity-75 mt-1">
                          {task.description}
                        </div>
                      )}
                    </div>
                    
                    {task.priority && (
                      <div className="text-orange-400 text-sm font-medium">
                        High Priority
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {pendingTasks.length === 0 && (
                <div className="text-center py-8 text-green-300">
                  <div className="text-4xl mb-2">🎉</div>
                  <div className="text-lg font-medium">All tasks completed!</div>
                  <div className="text-sm opacity-75">Great work on this session.</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* No Tasks Message */}
        {blockTasks.length === 0 && (
          <div className="max-w-2xl w-full px-8 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
              <div className="text-4xl mb-4">{isBufferTime ? '⏰' : '🎯'}</div>
              <h3 className="text-xl font-medium mb-2">
                {isBufferTime ? 'Buffer Time' : 'Focus Time'}
              </h3>
              <p className="text-gray-300">
                {isBufferTime 
                  ? 'No universal tasks assigned. Use this buffer time for breaks, planning, or catching up on tasks.'
                  : 'No specific tasks assigned to this block. Use this time for deep work and focused attention.'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}