import { useCallback } from 'react';
import { Event, InsertEvent } from '@shared/schema';
import { useStorage } from './use-storage';
import { useToast } from './use-toast';

export function useEvents() {
  const { data, refreshData, storage } = useStorage();
  const { toast } = useToast();

  const createEvent = useCallback((event: InsertEvent): Event => {
    const newEvent = storage.createEvent(event);
    refreshData();
    toast({
      title: "Event created",
      description: "Your event has been added to the calendar.",
    });
    return newEvent;
  }, [storage, refreshData, toast]);

  const updateEvent = useCallback((id: string, updates: Partial<InsertEvent>): Event | null => {
    const updated = storage.updateEvent(id, updates);
    if (updated) {
      refreshData();
      toast({
        title: "Event updated",
        description: "Event has been modified successfully.",
      });
    }
    return updated;
  }, [storage, refreshData, toast]);

  const deleteEvent = useCallback((id: string): boolean => {
    const success = storage.deleteEvent(id);
    if (success) {
      refreshData();
      toast({
        title: "Event deleted",
        description: "The event has been removed from your calendar.",
      });
    }
    return success;
  }, [storage, refreshData, toast]);

  const getEventsByDateRange = useCallback((startDate: Date, endDate: Date): Event[] => {
    return storage.getEventsByDateRange(startDate, endDate);
  }, [storage]);

  return {
    events: data.events,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventsByDateRange,
  };
}