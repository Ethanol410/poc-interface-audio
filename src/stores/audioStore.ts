/**
 * Audio Store - Global audio state management with Zustand
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AudioState, FilterConfig, PitchShiftConfig, CompressorConfig } from '@/types/audio';
import type { ScenarioId } from '@/data/scenarios';

interface AudioUrls {
  evidenceDistorted: string;
  evidenceClean: string;
  evidenceReverse?: string;
  suspect1: string;
  suspect2: string;
  suspect3: string;
  suspect4?: string;
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
  bandPassFilter: FilterConfig;
  notchFilter: FilterConfig;
  setLowPassFilter: (config: Partial<FilterConfig>) => void;
  setHighPassFilter: (config: Partial<FilterConfig>) => void;
  setBandPassFilter: (config: Partial<FilterConfig>) => void;
  setNotchFilter: (config: Partial<FilterConfig>) => void;

  // Pitch shift state
  pitchShift: PitchShiftConfig;
  setPitchShift: (config: Partial<PitchShiftConfig>) => void;

  // Compressor state
  compressor: CompressorConfig;
  setCompressor: (config: Partial<CompressorConfig>) => void;

  // Playback speed
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;

  // Comparison mode
  isComparisonMode: boolean;
  toggleComparisonMode: () => void;

  // Reverse mode
  isReversed: boolean;
  toggleReverse: () => void;

  // Suspect notes (persisted)
  suspectNotes: Record<string, string>;
  setSuspectNote: (suspectId: string, note: string) => void;

  // Discovered clues (pedagogical HUD)
  discoveredClues: string[];
  addClue: (clue: string) => void;
  resetClues: () => void;

  // Scenario
  scenario: ScenarioId;
  setScenario: (scenario: ScenarioId) => void;

  // Mission timer
  missionTimerEnabled: boolean;
  missionDuration: number; // seconds
  missionStartTime: number | null; // timestamp ms
  setMissionTimerEnabled: (enabled: boolean) => void;
  setMissionDuration: (duration: number) => void;
  setMissionStartTime: (time: number | null) => void;

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
  bandPassFilter: {
    type: 'bandpass' as const,
    frequency: 1500,
    q: 1,
    enabled: false,
  },
  notchFilter: {
    type: 'notch' as const,
    frequency: 60,
    q: 10,
    enabled: false,
  },
  compressor: {
    enabled: false,
    threshold: -24,
    ratio: 4,
  },
  playbackSpeed: 1,
  suspectNotes: {} as Record<string, string>,
  isComparisonMode: false,
  isReversed: false,
  discoveredClues: [] as string[],
  scenario: 'corbeau' as ScenarioId,
  missionTimerEnabled: false,
  missionDuration: 480,
  missionStartTime: null as number | null,
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

      // Band-pass filter actions
      setBandPassFilter: (config) =>
        set((state) => ({
          bandPassFilter: { ...state.bandPassFilter, ...config },
        })),

      // Notch filter actions
      setNotchFilter: (config) =>
        set((state) => ({
          notchFilter: { ...state.notchFilter, ...config },
        })),

      // Compressor actions
      setCompressor: (config) =>
        set((state) => ({
          compressor: { ...state.compressor, ...config },
        })),

      // Playback speed actions
      setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),

      // Suspect notes actions
      setSuspectNote: (suspectId, note) =>
        set((state) => ({
          suspectNotes: { ...state.suspectNotes, [suspectId]: note },
        })),

      // Comparison actions
      toggleComparisonMode: () =>
        set((state) => ({ isComparisonMode: !state.isComparisonMode })),

      // Reverse actions
      toggleReverse: () =>
        set((state) => ({ isReversed: !state.isReversed })),

      // Clue actions
      addClue: (clue) =>
        set((state) => ({
          discoveredClues: state.discoveredClues.includes(clue)
            ? state.discoveredClues
            : [...state.discoveredClues, clue],
        })),
      resetClues: () => set({ discoveredClues: [] }),

      // Scenario actions
      setScenario: (scenario) => set({ scenario }),

      // Mission timer actions
      setMissionTimerEnabled: (missionTimerEnabled) => set({ missionTimerEnabled }),
      setMissionDuration: (missionDuration) => set({ missionDuration }),
      setMissionStartTime: (missionStartTime) => set({ missionStartTime }),

      // Reset
      reset: () => set(initialState),
    }),
    {
      name: 'audio-storage',
      partialize: (state) => ({
        volume: state.volume,
        lowPassFilter: state.lowPassFilter,
        highPassFilter: state.highPassFilter,
        bandPassFilter: state.bandPassFilter,
        notchFilter: state.notchFilter,
        compressor: state.compressor,
        pitchShift: state.pitchShift,
        playbackSpeed: state.playbackSpeed,
        suspectNotes: state.suspectNotes,
      }),
    }
  )
);
