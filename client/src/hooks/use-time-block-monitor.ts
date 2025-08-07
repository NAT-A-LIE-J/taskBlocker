import { useEffect, useRef } from 'react';
import { useStorage } from './use-storage';
import { useAudioNotifications } from './use-audio-notifications';
import { getCurrentActiveBlock, timeToMinutes } from '@/lib/time-utils';

export function useTimeBlockMonitor() {
  const { data } = useStorage();
  const { playBlockStartSound, playBlockEndSound } = useAudioNotifications();
  const lastActiveBlockRef = useRef<string | null>(null);

  useEffect(() => {
    const checkTimeBlockTransition = () => {
      const activeBlockData = getCurrentActiveBlock(data.timeBlocks, data.blockTypes);
      const currentActiveBlockId = activeBlockData ? activeBlockData.id : null;

      // Check if we've transitioned between blocks
      if (lastActiveBlockRef.current !== currentActiveBlockId) {
        if (lastActiveBlockRef.current !== null && currentActiveBlockId === null) {
          // Block ended
          playBlockEndSound();
        } else if (lastActiveBlockRef.current === null && currentActiveBlockId !== null) {
          // Block started
          playBlockStartSound();
        } else if (lastActiveBlockRef.current !== null && currentActiveBlockId !== null) {
          // Block changed to another block
          playBlockEndSound();
          setTimeout(() => playBlockStartSound(), 500); // Brief delay between sounds
        }
        
        lastActiveBlockRef.current = currentActiveBlockId;
      }
    };

    // Check every 30 seconds for time block transitions
    const interval = setInterval(checkTimeBlockTransition, 30000);
    
    // Initial check
    checkTimeBlockTransition();

    return () => clearInterval(interval);
  }, [data.timeBlocks, data.blockTypes, playBlockStartSound, playBlockEndSound]);

  // Also check for minute-level precision around block boundaries
  useEffect(() => {
    const checkPreciseTransitions = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      // Check if we're at the exact start or end time of any block
      data.timeBlocks.forEach(block => {
        const startMinutes = timeToMinutes(block.startTime);
        const endMinutes = timeToMinutes(block.endTime);
        
        // Check if we just hit the start time (within the last minute)
        if (Math.abs(currentMinutes - startMinutes) === 0) {
          playBlockStartSound();
        }
        
        // Check if we just hit the end time (within the last minute)
        if (Math.abs(currentMinutes - endMinutes) === 0) {
          playBlockEndSound();
        }
      });
    };

    // Check every minute at the exact minute mark
    const now = new Date();
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    
    const initialTimeout = setTimeout(() => {
      checkPreciseTransitions();
      const interval = setInterval(checkPreciseTransitions, 60000); // Every minute
      
      return () => clearInterval(interval);
    }, msUntilNextMinute);

    return () => clearTimeout(initialTimeout);
  }, [data.timeBlocks, playBlockStartSound, playBlockEndSound]);
}