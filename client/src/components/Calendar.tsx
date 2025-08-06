import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Expand, Combine } from 'lucide-react';
import { TIME_SLOTS, DAYS, formatTime12Hour, getWeekDates, hasDeadlineAtTimeSlot, getTimeBlockPosition, timeToMinutes, getCurrentTimePosition, isCurrentTimeSlot } from '@/lib/time-utils';
import { useTimeBlocks } from '@/hooks/use-time-blocks';
import { useTasks } from '@/hooks/use-tasks';
import { useEvents } from '@/hooks/use-events';
import { cn } from '@/lib/utils';
import { format, isSameDay, isWithinInterval } from 'date-fns';

interface CalendarProps {
  weekStart: Date;
  isExpanded: boolean;
  onToggleExpansion: () => void;
  onTimeBlockClick: (blockId: string) => void;
  onCreateTimeBlock: (data: { dayOfWeek: number; startTime: string; endTime: string }) => void;
}

export function Calendar({ 
  weekStart, 
  isExpanded, 
  onToggleExpansion, 
  onTimeBlockClick,
  onCreateTimeBlock 
}: CalendarProps) {
  const { timeBlocks, blockTypes } = useTimeBlocks();
  const { tasks } = useTasks();
  const { events, getEventsByDateRange } = useEvents();
  const currentTimePosition = getCurrentTimePosition();
  
  const [dragState, setDragState] = useState<{
    isSelecting: boolean;
    startSlot: { day: number; time: string } | null;
    currentSlot: { day: number; time: string } | null;
  }>({
    isSelecting: false,
    startSlot: null,
    currentSlot: null,
  });

  const weekDates = getWeekDates(weekStart);

  const handleMouseDown = (dayIndex: number, time: string) => {
    setDragState({
      isSelecting: true,
      startSlot: { day: dayIndex, time },
      currentSlot: { day: dayIndex, time },
    });
  };

  const handleMouseEnter = (dayIndex: number, time: string) => {
    if (dragState.isSelecting) {
      setDragState(prev => ({
        ...prev,
        currentSlot: { day: dayIndex, time },
      }));
    }
  };

  const handleMouseUp = () => {
    if (dragState.startSlot && dragState.currentSlot) {
      const startIndex = TIME_SLOTS.indexOf(dragState.startSlot.time);
      const endIndex = TIME_SLOTS.indexOf(dragState.currentSlot.time);
      
      if (startIndex !== -1 && endIndex !== -1 && startIndex <= endIndex) {
        const endTime = endIndex < TIME_SLOTS.length - 1 
          ? TIME_SLOTS[endIndex + 1] 
          : '23:30';
          
        onCreateTimeBlock({
          dayOfWeek: dragState.startSlot.day,
          startTime: dragState.startSlot.time,
          endTime,
        });
      }
    }
    
    setDragState({
      isSelecting: false,
      startSlot: null,
      currentSlot: null,
    });
  };

  const isSlotInSelection = (dayIndex: number, time: string) => {
    if (!dragState.isSelecting || !dragState.startSlot || !dragState.currentSlot) return false;
    
    if (dayIndex !== dragState.startSlot.day) return false;
    
    const currentIndex = TIME_SLOTS.indexOf(time);
    const startIndex = TIME_SLOTS.indexOf(dragState.startSlot.time);
    const endIndex = TIME_SLOTS.indexOf(dragState.currentSlot.time);
    
    const minIndex = Math.min(startIndex, endIndex);
    const maxIndex = Math.max(startIndex, endIndex);
    
    return currentIndex >= minIndex && currentIndex <= maxIndex;
  };

  const getTimeBlockForSlot = (dayIndex: number, time: string) => {
    return timeBlocks.find(block => {
      if (block.dayOfWeek !== dayIndex) return false;
      
      const { isInBlock } = getTimeBlockPosition(block.startTime, block.endTime, time);
      return isInBlock;
    });
  };

  const getEventsForSlot = (dayIndex: number, time: string) => {
    const currentDate = weekDates[dayIndex];
    const timeSlotStart = new Date(currentDate);
    const [hours, minutes] = time.split(':').map(Number);
    timeSlotStart.setHours(hours, minutes, 0, 0);
    
    const timeSlotEnd = new Date(timeSlotStart);
    timeSlotEnd.setMinutes(timeSlotEnd.getMinutes() + 30);

    return events.filter(event => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      
      // Check if event overlaps with this time slot
      return (eventStart < timeSlotEnd && eventEnd > timeSlotStart);
    });
  };

  const getBlockTypeById = (id: string) => {
    return blockTypes.find(bt => bt.id === id);
  };

  const getTasksForBlockType = (blockTypeId: string) => {
    return tasks.filter(task => task.blockTypeId === blockTypeId && !task.completed);
  };

  return (
    <div className={cn(
      "view-transition bg-white dark:bg-gray-900 flex flex-col",
      isExpanded ? "w-full" : "flex-1",
      "border-r border-gray-200 dark:border-gray-700"
    )}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold" data-testid="text-calendar-title">Weekly Calendar</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleExpansion}
          className="touch-target"
          title={isExpanded ? "Collapse Calendar" : "Expand Calendar"}
          data-testid="button-expand-calendar"
        >
          {isExpanded ? <Combine className="w-4 h-4" /> : <Expand className="w-4 h-4" />}
        </Button>
      </div>
      
      {/* Days Header */}
      <div className="grid grid-cols-8 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="p-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
          Time
        </div>
        {DAYS.map((day, index) => (
          <div key={day} className="p-3 text-center text-sm font-semibold">
            <div>{day}</div>
            <div className="text-xs text-gray-500 mt-1">
              {weekDates[index].getDate()}
            </div>
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto" data-testid="calendar-grid">
        <div className="grid grid-cols-8 gap-px bg-gray-200 dark:bg-gray-600">
          {TIME_SLOTS.map((time) => (
            <React.Fragment key={time}>
              {/* Time Label */}
              <div className="bg-white dark:bg-gray-900 flex items-center justify-center text-xs text-gray-400 border-r border-gray-200 dark:border-gray-700 min-h-12">
                {formatTime12Hour(time)}
              </div>
              
              {/* Day Cells */}
              {Array.from({ length: 7 }, (_, dayIndex) => {
                const timeBlock = getTimeBlockForSlot(dayIndex, time);
                const blockType = timeBlock ? getBlockTypeById(timeBlock.blockTypeId) : null;
                const blockTasks = timeBlock ? getTasksForBlockType(timeBlock.blockTypeId) : [];
                const eventsInSlot = getEventsForSlot(dayIndex, time);
                const hasDeadline = hasDeadlineAtTimeSlot(tasks, weekDates[dayIndex], time);
                const isSelected = isSlotInSelection(dayIndex, time);
                const isCurrentTime = currentTimePosition.isCurrentWeek && 
                  dayIndex === currentTimePosition.dayIndex && 
                  isCurrentTimeSlot(time);
                
                // Use new positioning system for custom time blocks
                const { isBlockStart, blockHeight, offsetTop } = timeBlock ? 
                  getTimeBlockPosition(timeBlock.startTime, timeBlock.endTime, time) :
                  { isBlockStart: false, blockHeight: 0, offsetTop: 0 };
                
                return (
                  <div
                    key={`${dayIndex}-${time}`}
                    className={cn(
                      "bg-white dark:bg-gray-900 min-h-12 relative cursor-pointer border-b border-gray-100 dark:border-gray-800",
                      isSelected && "bg-blue-100 dark:bg-blue-900",
                      timeBlock && "cursor-pointer"
                    )}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      if (!timeBlock) {
                        handleMouseDown(dayIndex, time);
                      }
                    }}
                    onMouseEnter={() => handleMouseEnter(dayIndex, time)}
                    onMouseUp={handleMouseUp}
                    onClick={() => {
                      if (timeBlock) {
                        onTimeBlockClick(timeBlock.id);
                      }
                    }}
                    data-testid={`cell-${dayIndex}-${time}`}
                  >
                    {/* Time Block */}
                    {timeBlock && isBlockStart && blockType && (
                      <div
                        className="absolute inset-x-1 rounded-lg p-2 border-l-4 transition-all duration-200 hover:transform hover:scale-105 hover:shadow-md z-10"
                        style={{
                          backgroundColor: `${blockType.color}20`,
                          borderLeftColor: blockType.color,
                          height: `${blockHeight}px`,
                          top: `${offsetTop + 4}px`, // 4px padding from cell top
                        }}
                        data-testid={`timeblock-${timeBlock.id}`}
                      >
                        <div className="text-xs font-medium" style={{ color: blockType.color }}>
                          {blockType.name}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {blockTasks.length} task{blockTasks.length !== 1 ? 's' : ''}
                        </div>
                        {blockTasks.some(task => task.priority) && (
                          <div className="flex items-center mt-1">
                            <span className="text-orange-500 text-xs">★</span>
                            <span className="text-xs ml-1 text-gray-400">Priority items</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Events - overlapping with time blocks */}
                    {eventsInSlot.map((event, eventIndex) => {
                      const eventStart = new Date(event.startTime);
                      const eventEnd = new Date(event.endTime);
                      const slotStart = new Date(weekDates[dayIndex]);
                      const [hours, minutes] = time.split(':').map(Number);
                      slotStart.setHours(hours, minutes, 0, 0);
                      
                      // Calculate if this is the first slot where the event appears
                      const isEventStart = eventStart.getTime() >= slotStart.getTime() && 
                                          eventStart.getTime() < slotStart.getTime() + 30 * 60 * 1000;
                      
                      // Calculate event height based on duration
                      const eventDurationMinutes = (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60);
                      const eventHeight = Math.max(20, (eventDurationMinutes / 30) * 48); // 48px per slot
                      
                      return isEventStart && (
                        <div
                          key={`event-${event.id}-${dayIndex}-${time}`}
                          className="absolute inset-x-1 rounded-md p-1 text-white text-xs z-20 shadow-sm border border-opacity-30"
                          style={{
                            backgroundColor: event.color,
                            borderColor: event.color,
                            height: `${eventHeight}px`,
                            top: '2px',
                            right: timeBlock ? '50%' : '2px', // If there's a time block, take only half the width
                          }}
                          title={`${event.title}${event.description ? ': ' + event.description : ''}`}
                          data-testid={`event-${event.id}`}
                        >
                          <div className="font-medium truncate">
                            {event.title}
                          </div>
                          {event.allDay ? (
                            <div className="text-xs opacity-80">All day</div>
                          ) : (
                            <div className="text-xs opacity-80">
                              {format(eventStart, 'h:mm a')}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {/* Deadline Indicator */}
                    {hasDeadline && !timeBlock && (
                      <div
                        className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"
                        title="Task deadline today"
                        data-testid="deadline-indicator"
                      />
                    )}
                    
                    {/* Current Time Indicator */}
                    {isCurrentTime && (
                      <div
                        className="absolute left-0 right-0 bg-yellow-400 opacity-80 pointer-events-none z-20"
                        style={{
                          height: '3px',
                          top: `${Math.floor(currentTimePosition.timeProgress * 48)}px`, // 48px is cell height
                        }}
                        data-testid="current-time-indicator"
                      />
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
