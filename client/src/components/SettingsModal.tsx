import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Volume2, VolumeX, TestTube, Archive, Trash2, RotateCcw, Calendar } from 'lucide-react';
import { useAudioNotifications } from '@/hooks/use-audio-notifications';
import { useStorage } from '@/hooks/use-storage';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function SettingsModal({ 
  open, 
  onOpenChange, 
  darkMode, 
  onToggleDarkMode 
}: SettingsModalProps) {
  const { 
    isEnabled: audioEnabled, 
    toggleAudioNotifications, 
    playTestSound 
  } = useAudioNotifications();
  
  const { 
    getArchivedTasks, 
    unarchiveTask, 
    deleteArchivedTasks, 
    storage 
  } = useStorage();
  
  const { toast } = useToast();
  const [expandedArchiveSection, setExpandedArchiveSection] = useState(false);
  
  const archivedTasks = getArchivedTasks();
  
  const handleUnarchiveTask = (taskId: string) => {
    unarchiveTask(taskId);
    toast({
      title: "Task restored",
      description: "Task has been moved back to your active list",
    });
  };
  
  const handleDeleteAllArchived = () => {
    const count = deleteArchivedTasks();
    toast({
      title: "Archived tasks deleted",
      description: `${count} archived ${count === 1 ? 'task' : 'tasks'} permanently deleted`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize your TimeBlock Pro experience
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Theme Setting */}
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Dark Mode</Label>
              <div className="text-sm text-muted-foreground">
                Switch between light and dark themes
              </div>
            </div>
            <Switch
              checked={darkMode}
              onCheckedChange={onToggleDarkMode}
              data-testid="switch-dark-mode"
            />
          </div>

          {/* Audio Notifications Setting */}
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label className="text-base font-medium flex items-center gap-2">
                {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                Audio Notifications
              </Label>
              <div className="text-sm text-muted-foreground">
                Play sounds when time blocks start and end
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={playTestSound}
                disabled={!audioEnabled}
                className="h-8 w-8 p-0"
                data-testid="button-test-sound"
              >
                <TestTube className="w-4 h-4" />
              </Button>
              <Switch
                checked={audioEnabled}
                onCheckedChange={toggleAudioNotifications}
                data-testid="switch-audio-notifications"
              />
            </div>
          </div>

          {/* Information Section */}
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
            <h4 className="text-sm font-medium mb-2">Audio Notifications</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Pleasant chimes when time blocks start</li>
              <li>• Gentle tones when time blocks end</li>
              <li>• Automatic detection of schedule changes</li>
              <li>• Works only when browser tab is active</li>
            </ul>
          </div>

          <Separator />

          {/* Archived Tasks Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Archive className="w-4 h-4" />
                  Archived Tasks
                </Label>
                <div className="text-sm text-muted-foreground">
                  {archivedTasks.length} archived {archivedTasks.length === 1 ? 'task' : 'tasks'}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedArchiveSection(!expandedArchiveSection)}
                data-testid="button-toggle-archive-section"
              >
                {expandedArchiveSection ? 'Hide' : 'Show'}
              </Button>
            </div>

            {expandedArchiveSection && (
              <Card className="max-h-64 overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Archived Tasks</CardTitle>
                    {archivedTasks.length > 0 && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-7 text-xs"
                            data-testid="button-delete-all-archived"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete All
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete All Archived Tasks?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete all {archivedTasks.length} archived {archivedTasks.length === 1 ? 'task' : 'tasks'}. 
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteAllArchived} className="bg-red-600 hover:bg-red-700">
                              Delete All
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {archivedTasks.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground py-4">
                      No archived tasks
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {archivedTasks.map(task => (
                        <div 
                          key={task.id}
                          className="flex items-start justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{task.title}</div>
                            {task.archivedAt && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Calendar className="w-3 h-3" />
                                Archived {format(new Date(task.archivedAt), 'MMM d, yyyy')}
                              </div>
                            )}
                            {task.description && (
                              <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {task.description}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700"
                              onClick={() => handleUnarchiveTask(task.id)}
                              data-testid={`button-unarchive-${task.id}`}
                              title="Restore task"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                              onClick={() => storage.deleteTask(task.id)}
                              data-testid={`button-delete-${task.id}`}
                              title="Delete permanently"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)} data-testid="button-close-settings">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}