/**
 * Custom hook for audio playback controls
 */

import { useEffect, useCallback } from 'react';
import { useAudioStore } from '@/stores/audioStore';
import { audioEngine } from '@/services/audioEngine';

export const useAudioControls = () => {
  const {
    isPlaying,
    volume,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setIsLoading,
    setError,
  } = useAudioStore();

  // Initialize audio engine
  useEffect(() => {
    const init = async () => {
      try {
        await audioEngine.initialize();
      } catch (error) {
        setError('Failed to initialize audio engine');
        console.error(error);
      }
    };

    init();

    // Setup event listeners
    audioEngine.on('play', () => setIsPlaying(true));
    audioEngine.on('pause', () => setIsPlaying(false));
    audioEngine.on('loading', setIsLoading);
    audioEngine.on('loaded', (buffer: any) => setDuration(buffer.duration));
    audioEngine.on('error', (error: any) =>
      setError(error?.message || 'Audio error')
    );

    return () => {
      audioEngine.cleanup();
    };
  }, [setIsPlaying, setIsLoading, setDuration, setError]);

  // Sync volume
  useEffect(() => {
    audioEngine.setVolume(volume);
  }, [volume]);

  const play = useCallback(() => {
    try {
      audioEngine.play();
    } catch (error) {
      setError('Failed to play audio');
    }
  }, [setError]);

  const pause = useCallback(() => {
    audioEngine.pause();
  }, []);

  const seek = useCallback((time: number) => {
    audioEngine.seek(time);
    setCurrentTime(time);
  }, [setCurrentTime]);

  const loadAudio = useCallback(
    async (url: string, name: string) => {
      try {
        await audioEngine.loadAudio(url, name);
      } catch (error) {
        setError('Failed to load audio file');
      }
    },
    [setError]
  );

  return {
    isPlaying,
    play,
    pause,
    seek,
    loadAudio,
  };
};
