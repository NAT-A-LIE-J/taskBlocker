import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Calendar } from '@/components/Calendar';
import { TodoList } from '@/components/TodoList';
import { TimerModal } from '@/components/TimerModal';
import { TaskModal } from '@/components/TaskModal';
import { TimeBlockEditDialog } from '@/components/TimeBlockEditDialog';
import { FocusTimer } from '@/components/FocusTimer';
import { getCurrentWeekStart } from '@/lib/time-utils';
import { useTimeBlocks } from '@/hooks/use-time-blocks';
import { useStorage } from '@/hooks/use-storage';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { TimeBlock } from '@shared/schema';

export default function Home() {
  const { data, storage } = useStorage();
  const { createTimeBlock, updateTimeBlock, deleteTimeBlock, createBlockType, updateBlockType, deleteBlockType } = useTimeBlocks();
  const { toast } = useToast();
  
  const [weekStart, setWeekStart] = useState(getCurrentWeekStart());
  const [calendarExpanded, setCalendarExpanded] = useState(false);
  const [todoExpanded, setTodoExpanded] = useState(false);
  const [timerModalOpen, setTimerModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [timeBlockEditOpen, setTimeBlockEditOpen] = useState(false);
  const [focusTimerOpen, setFocusTimerOpen] = useState(false);
  const [selectedBlockTypeId, setSelectedBlockTypeId] = useState<string>();
  const [editingTimeBlock, setEditingTimeBlock] = useState<TimeBlock | null>(null);
  const [currentActiveBlock, setCurrentActiveBlock] = useState<TimeBlock | null>(null);

  // Theme management
  const [darkMode, setDarkMode] = useState(data.settings.darkMode);

  useEffect(() => {
    // Apply dark mode class to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Update settings
    storage.updateSettings({ darkMode });
  }, [darkMode, storage]);

  useEffect(() => {
    // Load dark mode from system preference if not set
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('timeblock-dark-mode')) {
        setDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleWeekChange = (direction: 'prev' | 'next') => {
    const offset = direction === 'next' ? 1 : -1;
    setWeekStart(getCurrentWeekStart(getCurrentWeekStart().getTime() === weekStart.getTime() ? offset : 0));
  };

  const handleToggleCalendarExpansion = () => {
    setCalendarExpanded(!calendarExpanded);
    if (!calendarExpanded && todoExpanded) {
      setTodoExpanded(false);
    }
  };

  const handleToggleTodoExpansion = () => {
    setTodoExpanded(!todoExpanded);
    if (!todoExpanded && calendarExpanded) {
      setCalendarExpanded(false);
    }
  };

  const handleStartTimer = () => {
    // Find the current active time block
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Debug logging
    console.log('Current day:', currentDay, 'Current time:', currentTime);
    console.log('Available time blocks:', data.timeBlocks);
    
    const activeBlock = data.timeBlocks.find(block => {
      const isRightDay = block.dayOfWeek === currentDay;
      const isAfterStart = block.startTime <= currentTime;
      const isBeforeEnd = block.endTime > currentTime;
      
      console.log(`Block ${block.id}: day=${block.dayOfWeek} (${isRightDay}), start=${block.startTime} (${isAfterStart}), end=${block.endTime} (${isBeforeEnd})`);
      
      return isRightDay && isAfterStart && isBeforeEnd;
    });
    
    console.log('Active block found:', activeBlock);
    
    if (activeBlock) {
      setCurrentActiveBlock(activeBlock);
      setFocusTimerOpen(true);
    } else {
      // For testing, let's always show the focus timer with a sample block
      // Find any block for today or create a mock one for demonstration
      const todayBlocks = data.timeBlocks.filter(block => block.dayOfWeek === currentDay);
      const demoBlock = todayBlocks[0] || data.timeBlocks[0];
      
      if (demoBlock) {
        toast({
          title: "No active time block",
          description: "Showing focus timer with available block for demo purposes.",
        });
        setCurrentActiveBlock(demoBlock);
        setFocusTimerOpen(true);
      } else {
        // Fallback to timer modal if no blocks exist at all
        setTimerModalOpen(true);
      }
    }
  };

  const handleTimeBlockClick = useCallback((blockId: string) => {
    const timeBlock = data.timeBlocks.find(tb => tb.id === blockId);
    if (timeBlock) {
      setEditingTimeBlock(timeBlock);
      setTimeBlockEditOpen(true);
    }
  }, [data.timeBlocks]);

  const handleTimeBlockUpdate = useCallback((id: string, updates: { blockTypeId?: string; startTime?: string; endTime?: string }) => {
    updateTimeBlock(id, updates);
  }, [updateTimeBlock]);

  const handleTimeBlockDelete = useCallback((id: string) => {
    deleteTimeBlock(id);
  }, [deleteTimeBlock]);

  const handleCreateTimeBlock = (blockData: { dayOfWeek: number; startTime: string; endTime: string }) => {
    // For now, create with first available block type
    // In a real app, this would open a dialog to select block type
    const firstBlockType = data.blockTypes[0];
    if (firstBlockType) {
      createTimeBlock({
        ...blockData,
        blockTypeId: firstBlockType.id,
      });
    } else {
      toast({
        title: "No block types available",
        description: "Please create a block type first.",
        variant: "destructive",
      });
    }
  };

  const handleAddTask = () => {
    setTaskModalOpen(true);
  };

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('timeblock-dark-mode', (!darkMode).toString());
  };

  // Block Type management handlers
  const handleCreateBlockType = useCallback((data: { name: string; color: string }) => {
    return createBlockType(data);
  }, [createBlockType]);

  const handleUpdateBlockType = useCallback((id: string, data: { name: string; color: string }) => {
    return updateBlockType(id, data);
  }, [updateBlockType]);

  const handleDeleteBlockType = useCallback((id: string) => {
    return deleteBlockType(id);
  }, [deleteBlockType]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            handleAddTask();
            break;
          case 't':
            e.preventDefault();
            handleStartTimer();
            break;
          case 'd':
            e.preventDefault();
            handleToggleDarkMode();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header
        weekStart={weekStart}
        onWeekChange={handleWeekChange}
        onStartTimer={handleStartTimer}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />
      
      <main className="flex-1 flex overflow-hidden">
        {/* Calendar View */}
        <div className={cn(
          "transition-all duration-300 ease-in-out",
          calendarExpanded ? "w-full" : todoExpanded ? "hidden" : "flex-1"
        )}>
          <Calendar
            weekStart={weekStart}
            isExpanded={calendarExpanded}
            onToggleExpansion={handleToggleCalendarExpansion}
            onTimeBlockClick={handleTimeBlockClick}
            onCreateTimeBlock={handleCreateTimeBlock}
          />
        </div>
        
        {/* Todo List View */}
        <div className={cn(
          "transition-all duration-300 ease-in-out",
          todoExpanded ? "w-full" : calendarExpanded ? "hidden" : "w-96"
        )}>
          <TodoList
            isExpanded={todoExpanded}
            onToggleExpansion={handleToggleTodoExpansion}
            onAddTask={handleAddTask}
            onCreateBlockType={handleCreateBlockType}
            onUpdateBlockType={handleUpdateBlockType}
            onDeleteBlockType={handleDeleteBlockType}
          />
        </div>
      </main>

      {/* Modals */}
      <TimerModal
        isOpen={timerModalOpen}
        onClose={() => {
          setTimerModalOpen(false);
          setSelectedBlockTypeId(undefined);
        }}
        blockTypeId={selectedBlockTypeId}
      />
      
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
      />
      
      <TimeBlockEditDialog
        isOpen={timeBlockEditOpen}
        onClose={() => {
          setTimeBlockEditOpen(false);
          setEditingTimeBlock(null);
        }}
        timeBlock={editingTimeBlock}
        blockTypes={data.blockTypes}
        onUpdate={handleTimeBlockUpdate}
        onDelete={handleTimeBlockDelete}
      />

      <FocusTimer
        isOpen={focusTimerOpen}
        onClose={() => {
          setFocusTimerOpen(false);
          setCurrentActiveBlock(null);
        }}
        currentBlock={currentActiveBlock}
        blockType={currentActiveBlock ? data.blockTypes.find(bt => bt.id === currentActiveBlock.blockTypeId) || null : null}
        tasks={data.tasks}
        weekStart={weekStart}
      />
    </div>
  );
}
