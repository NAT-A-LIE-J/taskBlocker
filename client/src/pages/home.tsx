import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Calendar } from '@/components/Calendar';
import { TodoList } from '@/components/TodoList';
import { TimerModal } from '@/components/TimerModal';
import { TaskModal } from '@/components/TaskModal';
import { getCurrentWeekStart } from '@/lib/time-utils';
import { useTimeBlocks } from '@/hooks/use-time-blocks';
import { useStorage } from '@/hooks/use-storage';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function Home() {
  const { data, storage } = useStorage();
  const { createTimeBlock } = useTimeBlocks();
  const { toast } = useToast();
  
  const [weekStart, setWeekStart] = useState(getCurrentWeekStart());
  const [calendarExpanded, setCalendarExpanded] = useState(false);
  const [todoExpanded, setTodoExpanded] = useState(false);
  const [timerModalOpen, setTimerModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedBlockTypeId, setSelectedBlockTypeId] = useState<string>();

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
    setTimerModalOpen(true);
  };

  const handleTimeBlockClick = (blockId: string) => {
    const timeBlock = data.timeBlocks.find(tb => tb.id === blockId);
    if (timeBlock) {
      setSelectedBlockTypeId(timeBlock.blockTypeId);
      setTimerModalOpen(true);
    }
  };

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
    </div>
  );
}
