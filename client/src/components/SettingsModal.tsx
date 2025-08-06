import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Volume2, VolumeX, TestTube } from 'lucide-react';
import { useAudioNotifications } from '@/hooks/use-audio-notifications';

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