import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronDown, ChevronRight, Plus, Edit, Trash2, Clock } from 'lucide-react';
import { useEvents } from '@/hooks/use-events';
import { Event, InsertEvent } from '@shared/schema';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface EventManagerProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function EventManager({ isCollapsed = false, onToggleCollapse }: EventManagerProps) {
  const { events, createEvent, updateEvent, deleteEvent } = useEvents();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    color: '#3b82f6',
    allDay: false,
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      color: '#3b82f6',
      allDay: false,
    });
    setEditingEvent(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;

    const eventData: InsertEvent = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      startTime: new Date(formData.startTime),
      endTime: new Date(formData.endTime),
      color: formData.color,
      allDay: formData.allDay,
    };

    if (editingEvent) {
      updateEvent(editingEvent.id, eventData);
    } else {
      createEvent(eventData);
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      startTime: format(event.startTime, "yyyy-MM-dd'T'HH:mm"),
      endTime: format(event.endTime, "yyyy-MM-dd'T'HH:mm"),
      color: event.color,
      allDay: event.allDay,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      deleteEvent(eventId);
    }
  };

  const formatEventTime = (startTime: Date, endTime: Date, allDay: boolean) => {
    if (allDay) return 'All day';
    
    const start = format(startTime, 'MMM d, h:mm a');
    const end = format(endTime, 'h:mm a');
    const sameDay = format(startTime, 'yyyy-MM-dd') === format(endTime, 'yyyy-MM-dd');
    
    if (sameDay) {
      return `${start} - ${end}`;
    }
    return `${start} - ${format(endTime, 'MMM d, h:mm a')}`;
  };

  return (
    <Card>
      <Collapsible open={!isCollapsed} onOpenChange={onToggleCollapse}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Events
                <Badge variant="secondary" className="text-xs">
                  {events.length}
                </Badge>
              </div>
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-3">
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  data-testid="button-create-event"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingEvent ? 'Edit Event' : 'Create New Event'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="event-title">Title</Label>
                    <Input
                      id="event-title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Event title"
                      required
                      data-testid="input-event-title"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="event-description">Description</Label>
                    <Textarea
                      id="event-description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Optional description"
                      data-testid="textarea-event-description"
                      rows={2}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="event-start">Start Time</Label>
                      <Input
                        id="event-start"
                        type="datetime-local"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        required
                        data-testid="input-event-start"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="event-end">End Time</Label>
                      <Input
                        id="event-end"
                        type="datetime-local"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        required
                        data-testid="input-event-end"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="event-color">Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="event-color"
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-12 h-8"
                        data-testid="input-event-color"
                      />
                      <Input
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        placeholder="#3b82f6"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      id="event-all-day"
                      type="checkbox"
                      checked={formData.allDay}
                      onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
                      data-testid="checkbox-event-all-day"
                    />
                    <Label htmlFor="event-all-day">All day event</Label>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" data-testid="button-save-event">
                      {editingEvent ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {events.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-4">
                  No events created yet
                </div>
              ) : (
                events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div
                        className="w-3 h-3 rounded-full mt-1 shrink-0"
                        style={{ backgroundColor: event.color }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm truncate">{event.title}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Clock className="w-3 h-3" />
                          {formatEventTime(event.startTime, event.endTime, event.allDay)}
                        </div>
                        {event.description && (
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {event.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-blue-500 hover:text-blue-700"
                        onClick={() => handleEdit(event)}
                        data-testid={`button-edit-event-${event.id}`}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(event.id)}
                        data-testid={`button-delete-event-${event.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}