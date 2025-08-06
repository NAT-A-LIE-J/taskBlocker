import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Play, Moon, Sun, Settings } from 'lucide-react';
import { formatWeekRange, getCurrentActiveBlock } from '@/lib/time-utils';
import { useStorage } from '@/hooks/use-storage';
import { SettingsModal } from './SettingsModal';

interface HeaderProps {
  weekStart: Date;
  onWeekChange: (direction: 'prev' | 'next') => void;
  onStartTimer: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenCompletedTasks: () => void;
}

export function Header({ 
  weekStart, 
  onWeekChange, 
  onStartTimer, 
  darkMode, 
  onToggleDarkMode,
  onOpenCompletedTasks 
}: HeaderProps) {
  const { data } = useStorage();
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  const activeBlock = getCurrentActiveBlock(data.timeBlocks, data.blockTypes);
  const currentBlockName = activeBlock ? activeBlock.blockType?.name : 'Focus';

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold text-blue-600" data-testid="app-title">
          TimeBlock Pro
        </h1>
        <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onWeekChange('prev')}
            className="touch-target"
            data-testid="button-prev-week"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <span className="px-4 py-2 text-sm font-semibold" data-testid="text-current-week">
            {formatWeekRange(weekStart)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onWeekChange('next')}
            className="touch-target"
            data-testid="button-next-week"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button
          onClick={onStartTimer}
          className="touch-target flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white"
          data-testid="button-start-timer"
        >
          <Play className="w-4 h-4" />
          <span>Start {currentBlockName}</span>
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleDarkMode}
          className="touch-target"
          data-testid="button-toggle-darkmode"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSettingsOpen(true)}
          className="touch-target"
          data-testid="button-settings"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
      
      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        darkMode={darkMode}
        onToggleDarkMode={onToggleDarkMode}
      />
    </header>
  );
}
