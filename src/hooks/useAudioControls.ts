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

    // Keep stable references so we can remove them on unmount
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onLoading = (v: boolean) => setIsLoading(v);
    const onLoaded = (buffer: any) => setDuration(buffer.duration);
    const onError = (error: any) => setError(error?.message || 'Audio error');

    audioEngine.on('play', onPlay);
    audioEngine.on('pause', onPause);
    audioEngine.on('loading', onLoading);
    audioEngine.on('loaded', onLoaded);
    audioEngine.on('error', onError);

    return () => {
      // Remove listeners — the singleton keeps running across navigations
      audioEngine.off('play', onPlay);
      audioEngine.off('pause', onPause);
      audioEngine.off('loading', onLoading);
      audioEngine.off('loaded', onLoaded);
      audioEngine.off('error', onError);
      // Stop playback when leaving the workspace
      try { audioEngine.pause(); } catch { /* ignore */ }
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
