export function getDeadlineUrgency(deadline: string): 'overdue' | 'today' | 'this-week' | 'future' {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const deadlineDay = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate());
  
  // Check if overdue
  if (deadlineDate < now) {
    return 'overdue';
  }
  
  // Check if today
  if (deadlineDay.getTime() === today.getTime()) {
    return 'today';
  }
  
  // Check if this week (next 7 days)
  const oneWeekFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
  if (deadlineDate <= oneWeekFromNow) {
    return 'this-week';
  }
  
  return 'future';
}

export function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
  const startDay = weekStart.getDate();
  const endDay = weekEnd.getDate();
  const year = weekStart.getFullYear();
  
  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}-${endDay}, ${year}`;
  } else {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  }
}

export function getCurrentActiveBlock(timeBlocks: any[], blockTypes: any[]) {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday
  const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight
  
  // Find active time block
  const activeBlock = timeBlocks.find(block => {
    const blockStartTime = parseInt(block.startTime.replace(':', '')) / 100 * 60 + parseInt(block.startTime.split(':')[1]);
    const blockEndTime = parseInt(block.endTime.replace(':', '')) / 100 * 60 + parseInt(block.endTime.split(':')[1]);
    
    return block.dayOfWeek === currentDay && 
           currentTime >= blockStartTime && 
           currentTime <= blockEndTime;
  });
  
  if (!activeBlock) {
    return null;
  }
  
  const blockType = blockTypes.find(bt => bt.id === activeBlock.blockTypeId);
  
  return {
    ...activeBlock,
    blockType
  };
}

export function checkTimeBlockOverlap(existingBlocks: any[], newBlock: any, excludeId?: string): boolean {
  // Convert time strings to minutes for easier comparison
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const newStart = timeToMinutes(newBlock.startTime);
  const newEnd = timeToMinutes(newBlock.endTime);
  
  // Check for overlaps with existing blocks on the same day
  return existingBlocks.some(block => {
    // Skip the block we're updating (if any)
    if (excludeId && block.id === excludeId) {
      return false;
    }
    
    // Only check blocks on the same day
    if (block.dayOfWeek !== newBlock.dayOfWeek) {
      return false;
    }
    
    const blockStart = timeToMinutes(block.startTime);
    const blockEnd = timeToMinutes(block.endTime);
    
    // Check for any overlap
    return (newStart < blockEnd && newEnd > blockStart);
  });
}

// Calendar constants
export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const TIME_SLOTS = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00'
];

export function formatTime12Hour(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function getWeekDates(weekStart: Date): Date[] {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    dates.push(date);
  }
  return dates;
}

export function hasDeadlineOnDate(tasks: any[], date: Date): boolean {
  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
  
  return tasks.some(task => {
    if (!task.deadline || task.completed) return false;
    const deadline = new Date(task.deadline);
    return deadline >= dayStart && deadline < dayEnd;
  });
}

export function getTimeRemainingInBlock(activeBlock: any): number {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  // Convert end time to minutes
  const [endHours, endMinutes] = activeBlock.endTime.split(':').map(Number);
  const endTimeInMinutes = endHours * 60 + endMinutes;
  
  // Calculate remaining time in minutes
  const remainingMinutes = Math.max(0, endTimeInMinutes - currentTime);
  
  return remainingMinutes;
}

export function getCurrentWeekStart(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Calculate how many days to subtract to get to Sunday
  const daysToSubtract = dayOfWeek;
  
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - daysToSubtract);
  weekStart.setHours(0, 0, 0, 0); // Set to start of day
  
  return weekStart;
}