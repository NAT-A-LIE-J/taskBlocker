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

export function hasDeadlineAtTimeSlot(tasks: any[], date: Date, timeSlot: string): boolean {
  // Convert time slot to minutes (e.g., "15:00" -> 900 minutes)
  const slotMinutes = timeToMinutes(timeSlot);
  const nextSlotMinutes = slotMinutes + 30; // 30-minute slots
  
  return tasks.some(task => {
    if (!task.deadline || task.completed) return false;
    const deadline = new Date(task.deadline);
    
    // Check if deadline is on the same date
    const taskDate = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
    const cellDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (taskDate.getTime() !== cellDate.getTime()) return false;
    
    // Check if deadline time falls within this time slot
    const deadlineMinutes = deadline.getHours() * 60 + deadline.getMinutes();
    return deadlineMinutes >= slotMinutes && deadlineMinutes < nextSlotMinutes;
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

// Custom time input validation and conversion functions
export function validateTimeFormat(timeStr: string): boolean {
  // Accept formats: 9:12 AM, 9:12 PM, 09:12, 21:12, 9:12am, 9:12pm (case insensitive)
  const timeRegex = /^(\d{1,2}):(\d{2})\s*(am|pm|AM|PM)?$/;
  const match = timeStr.trim().match(timeRegex);
  
  if (!match) return false;
  
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3]?.toLowerCase();
  
  // Validate minutes
  if (minutes < 0 || minutes > 59) return false;
  
  // Validate hours based on format
  if (period) {
    // 12-hour format
    if (hours < 1 || hours > 12) return false;
  } else {
    // 24-hour format
    if (hours < 0 || hours > 23) return false;
  }
  
  return true;
}

export function convertTo24Hour(timeStr: string): string {
  const timeRegex = /^(\d{1,2}):(\d{2})\s*(am|pm|AM|PM)?$/;
  const match = timeStr.trim().match(timeRegex);
  
  if (!match) return timeStr; // Return original if invalid
  
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3]?.toLowerCase();
  
  if (period) {
    // 12-hour format conversion
    if (period === 'am' && hours === 12) {
      hours = 0;
    } else if (period === 'pm' && hours !== 12) {
      hours += 12;
    }
  }
  
  // Ensure two-digit format
  const hoursStr = hours.toString().padStart(2, '0');
  
  return `${hoursStr}:${minutes}`;
}

export function convertTo12Hour(time24: string): string {
  return formatTime12Hour(time24);
}

// Calendar rendering utility functions for custom time blocks
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export function getTimeBlockPosition(startTime: string, endTime: string, slotTime: string): {
  isInBlock: boolean;
  isBlockStart: boolean;
  blockHeight: number;
  offsetTop: number;
} {
  const slotMinutes = timeToMinutes(slotTime);
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  
  // Check if this slot is within the time block
  const isInBlock = slotMinutes >= startMinutes && slotMinutes < endMinutes;
  
  // Check if this is the slot where the block should be rendered (the slot that contains the start time)
  const slotIndex = TIME_SLOTS.findIndex(slot => timeToMinutes(slot) <= startMinutes && 
    (TIME_SLOTS[TIME_SLOTS.indexOf(slot) + 1] ? timeToMinutes(TIME_SLOTS[TIME_SLOTS.indexOf(slot) + 1]) > startMinutes : true));
  
  const isBlockStart = TIME_SLOTS[slotIndex] === slotTime;
  
  if (!isBlockStart) {
    return { isInBlock, isBlockStart: false, blockHeight: 0, offsetTop: 0 };
  }
  
  // Calculate the visual positioning
  const slotHeight = 48; // 48px per 30-minute slot (min-h-12 = 3rem = 48px)
  const slotMinutesStart = timeToMinutes(slotTime);
  const totalBlockMinutes = endMinutes - startMinutes;
  
  // Calculate offset from the top of the current slot
  const minutesIntoSlot = startMinutes - slotMinutesStart;
  const offsetTop = (minutesIntoSlot / 30) * slotHeight;
  
  // Calculate total height of the block
  const blockHeight = (totalBlockMinutes / 30) * slotHeight;
  
  return {
    isInBlock,
    isBlockStart,
    blockHeight,
    offsetTop
  };
}