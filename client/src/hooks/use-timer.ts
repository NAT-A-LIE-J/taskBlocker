import { useState, useEffect, useCallback, useRef } from 'react';
import { TimerSession, InsertTimerSession } from '@shared/schema';
import { useStorage } from './use-storage';
import { getCurrentActiveBlock, getTimeRemainingInBlock } from '@/lib/time-utils';

export interface TimerState {
  isActive: boolean;
  isPaused: boolean;
  timeRemaining: number; // in seconds
  totalTime: number; // in seconds
  blockTypeId?: string;
  sessionId?: string;
}

export function useTimer() {
  const { data, refreshData, storage } = useStorage();
  const [timerState, setTimerState] = useState<TimerState>({
    isActive: false,
    isPaused: false,
    timeRemaining: 0,
    totalTime: 0,
  });

  const intervalRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<Date>();
  const pausedDurationRef = useRef(0);

  const getCurrentActiveBlockData = useCallback(() => {
    return getCurrentActiveBlock(data.timeBlocks, data.blockTypes);
  }, [data.timeBlocks, data.blockTypes]);

  const startTimer = useCallback((blockTypeId: string, duration?: number) => {
    const activeBlock = getCurrentActiveBlockData();
    let timeInSeconds: number;

    if (duration) {
      timeInSeconds = duration * 60; // convert minutes to seconds
    } else if (activeBlock) {
      const remainingMinutes = getTimeRemainingInBlock(activeBlock);
      timeInSeconds = remainingMinutes * 60;
    } else {
      timeInSeconds = 25 * 60; // default 25 minutes
    }

    // Create timer session
    const sessionData: InsertTimerSession = {
      blockTypeId,
      startTime: new Date(),
      pausedTime: 0,
      completed: false,
      endedEarly: false,
    };

    const session = storage.createTimerSession(sessionData);
    refreshData();

    setTimerState({
      isActive: true,
      isPaused: false,
      timeRemaining: timeInSeconds,
      totalTime: timeInSeconds,
      blockTypeId,
      sessionId: session.id,
    });

    startTimeRef.current = new Date();
    pausedDurationRef.current = 0;

    // Start the countdown
    intervalRef.current = setInterval(() => {
      setTimerState(prev => {
        const newTimeRemaining = prev.timeRemaining - 1;
        
        if (newTimeRemaining <= 0) {
          // Timer completed
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          
          // Update session as completed
          if (prev.sessionId) {
            storage.updateTimerSession(prev.sessionId, { completed: true });
            refreshData();
          }

          return {
            ...prev,
            isActive: false,
            timeRemaining: 0,
          };
        }

        return {
          ...prev,
          timeRemaining: newTimeRemaining,
        };
      });
    }, 1000);
  }, [getCurrentActiveBlockData, storage, refreshData]);

  const pauseTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setTimerState(prev => ({
      ...prev,
      isPaused: true,
    }));

    // Update paused time in session
    if (timerState.sessionId && startTimeRef.current) {
      const now = new Date();
      const sessionDuration = now.getTime() - startTimeRef.current.getTime();
      pausedDurationRef.current += sessionDuration;
      
      storage.updateTimerSession(timerState.sessionId, {
        pausedTime: pausedDurationRef.current,
      });
      refreshData();
    }
  }, [timerState.sessionId, storage, refreshData]);

  const resumeTimer = useCallback(() => {
    if (!timerState.isPaused) return;

    setTimerState(prev => ({
      ...prev,
      isPaused: false,
    }));

    startTimeRef.current = new Date();

    intervalRef.current = setInterval(() => {
      setTimerState(prev => {
        const newTimeRemaining = prev.timeRemaining - 1;
        
        if (newTimeRemaining <= 0) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          
          if (prev.sessionId) {
            storage.updateTimerSession(prev.sessionId, { completed: true });
            refreshData();
          }

          return {
            ...prev,
            isActive: false,
            timeRemaining: 0,
          };
        }

        return {
          ...prev,
          timeRemaining: newTimeRemaining,
        };
      });
    }, 1000);
  }, [timerState.isPaused, storage, refreshData]);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Mark session as ended early
    if (timerState.sessionId) {
      storage.updateTimerSession(timerState.sessionId, { 
        endedEarly: true,
        pausedTime: pausedDurationRef.current,
      });
      refreshData();
    }

    setTimerState({
      isActive: false,
      isPaused: false,
      timeRemaining: 0,
      totalTime: 0,
    });

    pausedDurationRef.current = 0;
  }, [timerState.sessionId, storage, refreshData]);

  const adjustTimer = useCallback((minutes: number) => {
    setTimerState(prev => {
      const adjustment = minutes * 60; // convert to seconds
      const newTime = Math.max(0, prev.timeRemaining + adjustment);
      const newTotal = Math.max(prev.totalTime, newTime);
      
      return {
        ...prev,
        timeRemaining: newTime,
        totalTime: newTotal,
      };
    });
  }, []);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getProgress = useCallback((): number => {
    if (timerState.totalTime === 0) return 0;
    return ((timerState.totalTime - timerState.timeRemaining) / timerState.totalTime) * 100;
  }, [timerState.totalTime, timerState.timeRemaining]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    timerState,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    adjustTimer,
    formatTime,
    getProgress,
    getCurrentActiveBlockData,
  };
}
