/**
 * Audio Store - Global audio state management with Zustand
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AudioState, FilterConfig, PitchShiftConfig } from '@/types/audio';

interface AudioUrls {
  evidenceDistorted: string;
  evidenceClean: string;
  suspect1: string;
  suspect2: string;
  suspect3: string;
}

interface AudioStore extends AudioState {
  // Audio URLs
  audioUrls: AudioUrls | null;
  setAudioUrls: (urls: AudioUrls) => void;
  
  // Playback state
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // Filter state
  lowPassFilter: FilterConfig;
  highPassFilter: FilterConfig;
  setLowPassFilter: (config: Partial<FilterConfig>) => void;
  setHighPassFilter: (config: Partial<FilterConfig>) => void;

  // Pitch shift state
  pitchShift: PitchShiftConfig;
  setPitchShift: (config: Partial<PitchShiftConfig>) => void;

  // Analysis progress
  analysisProgress: number;
  setAnalysisProgress: (progress: number) => void;

  // Comparison mode
  isComparisonMode: boolean;
  toggleComparisonMode: () => void;

  // Reset state
  reset: () => void;
}

const initialState = {
  audioUrls: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isLoading: false,
  error: null,
  lowPassFilter: {
    type: 'lowpass' as const,
    frequency: 8000,
    q: 1,
    enabled: false,
  },
  highPassFilter: {
    type: 'highpass' as const,
    frequency: 200,
    q: 1,
    enabled: false,
  },
  pitchShift: {
    semitones: 0,
    cents: 0,
    enabled: false,
  },
  analysisProgress: 0,
  isComparisonMode: false,
};

export const useAudioStore = create<AudioStore>()(
  persist(
    (set) => ({
      ...initialState,

      // Audio URL actions
      setAudioUrls: (audioUrls) => set({ audioUrls }),

      // Playback actions
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setCurrentTime: (currentTime) => set({ currentTime }),
      setDuration: (duration) => set({ duration }),
      setVolume: (volume) => set({ volume }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Filter actions
      setLowPassFilter: (config) =>
        set((state) => ({
          lowPassFilter: { ...state.lowPassFilter, ...config },
        })),
      setHighPassFilter: (config) =>
        set((state) => ({
          highPassFilter: { ...state.highPassFilter, ...config },
        })),

      // Pitch shift actions
      setPitchShift: (config) =>
        set((state) => ({
          pitchShift: { ...state.pitchShift, ...config },
        })),

      // Analysis actions
      setAnalysisProgress: (analysisProgress) => set({ analysisProgress }),

      // Comparison actions
      toggleComparisonMode: () =>
        set((state) => ({ isComparisonMode: !state.isComparisonMode })),

      // Reset
      reset: () => set(initialState),
    }),
    {
      name: 'audio-storage',
      partialize: (state) => ({
        volume: state.volume,
        lowPassFilter: state.lowPassFilter,
        highPassFilter: state.highPassFilter,
        pitchShift: state.pitchShift,
      }),
    }
  )
);
