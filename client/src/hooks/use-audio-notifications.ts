import { useCallback, useRef, useEffect } from 'react';
import { useStorage } from './use-storage';

export function useAudioNotifications() {
  const { data, updateSettings } = useStorage();
  const audioContextRef = useRef<AudioContext | null>(null);
  const isEnabled = data.settings.audioNotifications;

  // Initialize audio context on first use
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.warn('Audio notifications not supported:', error);
      }
    }
    return audioContextRef.current;
  }, []);

  // Generate tone using Web Audio API
  const playTone = useCallback((frequency: number, duration: number, volume: number = 0.1) => {
    if (!isEnabled) return;

    const audioContext = initAudioContext();
    if (!audioContext) return;

    try {
      // Resume audio context if needed (for user interaction requirement)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Error playing audio notification:', error);
    }
  }, [isEnabled, initAudioContext]);

  // Notification sounds
  const playBlockStartSound = useCallback(() => {
    // Pleasant ascending chime for block start
    playTone(523.25, 0.2, 0.15); // C5
    setTimeout(() => playTone(659.25, 0.2, 0.15), 100); // E5
    setTimeout(() => playTone(783.99, 0.3, 0.15), 200); // G5
  }, [playTone]);

  const playBlockEndSound = useCallback(() => {
    // Gentle descending chime for block end
    playTone(783.99, 0.2, 0.12); // G5
    setTimeout(() => playTone(659.25, 0.2, 0.12), 100); // E5
    setTimeout(() => playTone(523.25, 0.3, 0.12), 200); // C5
  }, [playTone]);

  const toggleAudioNotifications = useCallback(() => {
    updateSettings({
      ...data.settings,
      audioNotifications: !isEnabled
    });
  }, [data.settings, isEnabled, updateSettings]);

  // Test sound function
  const playTestSound = useCallback(() => {
    playBlockStartSound();
  }, [playBlockStartSound]);

  // Initialize audio context on user interaction to comply with browser policies
  useEffect(() => {
    const handleUserInteraction = () => {
      initAudioContext();
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, [initAudioContext]);

  return {
    isEnabled,
    toggleAudioNotifications,
    playBlockStartSound,
    playBlockEndSound,
    playTestSound
  };
}