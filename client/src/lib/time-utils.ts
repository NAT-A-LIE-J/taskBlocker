import { startOfWeek, addWeeks, format, addMinutes, differenceInMinutes, isSameDay, isAfter, isBefore, parseISO, addDays } from 'date-fns';

export const TIME_SLOTS = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00'
];

export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const FULL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function getCurrentWeekStart(weekOffset = 0): Date {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 0 }); // Sunday
  return addWeeks(weekStart, weekOffset);
}

export function formatWeekRange(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 6);
  const startFormat = format(weekStart, 'MMM d');
  const endFormat = format(weekEnd, 'd, yyyy');
  return `${startFormat}-${endFormat}`;
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export function formatTime12Hour(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function getCurrentActiveBlock(timeBlocks: any[], blockTypes: any[]): any | null {
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = format(now, 'HH:mm');
  const currentMinutes = timeToMinutes(currentTime);

  const activeBlock = timeBlocks.find(block => {
    if (block.dayOfWeek !== currentDay) return false;
    
    const startMinutes = timeToMinutes(block.startTime);
    const endMinutes = timeToMinutes(block.endTime);
    
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  });

  if (activeBlock) {
    const blockType = blockTypes.find(bt => bt.id === activeBlock.blockTypeId);
    return { ...activeBlock, blockType };
  }

  return null;
}

export function getTimeRemainingInBlock(block: any): number {
  const now = new Date();
  const currentTime = format(now, 'HH:mm');
  const currentMinutes = timeToMinutes(currentTime);
  const endMinutes = timeToMinutes(block.endTime);
  
  return Math.max(0, endMinutes - currentMinutes);
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  }
  return `${mins}:00`;
}

export function checkTimeBlockOverlap(
  blocks: any[],
  newBlock: { dayOfWeek: number; startTime: string; endTime: string },
  excludeId?: string
): boolean {
  const newStartMinutes = timeToMinutes(newBlock.startTime);
  const newEndMinutes = timeToMinutes(newBlock.endTime);

  return blocks.some(block => {
    if (excludeId && block.id === excludeId) return false;
    if (block.dayOfWeek !== newBlock.dayOfWeek) return false;
    
    const blockStartMinutes = timeToMinutes(block.startTime);
    const blockEndMinutes = timeToMinutes(block.endTime);
    
    // Check for overlap
    return (
      (newStartMinutes >= blockStartMinutes && newStartMinutes < blockEndMinutes) ||
      (newEndMinutes > blockStartMinutes && newEndMinutes <= blockEndMinutes) ||
      (newStartMinutes <= blockStartMinutes && newEndMinutes >= blockEndMinutes)
    );
  });
}

export function getWeekDates(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export function hasDeadlineOnDate(tasks: any[], date: Date): boolean {
  return tasks.some(task => task.deadline && isSameDay(new Date(task.deadline), date));
}

export function getDeadlineUrgency(deadline: Date): 'overdue' | 'today' | 'this-week' | 'future' {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const taskDate = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
  
  if (isBefore(taskDate, today)) return 'overdue';
  if (isSameDay(taskDate, today)) return 'today';
  
  const weekEnd = addDays(startOfWeek(now, { weekStartsOn: 0 }), 6);
  if (isBefore(taskDate, addDays(weekEnd, 1))) return 'this-week';
  
  return 'future';
}
