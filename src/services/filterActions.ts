/**
 * Imperative audio filter/playback actions for use outside React.
 * Shared by useFilterControls hook and StreamDeck dispatcher.
 */

import { useAudioStore } from '@/stores/audioStore';
import { audioEngine } from '@/services/audioEngine';
import type { FilterConfig, CompressorConfig } from '@/types/audio';

export function imperativeUpdateLowPassFilter(config: Partial<FilterConfig>): void {
  const state = useAudioStore.getState();
  const newConfig = { ...state.lowPassFilter, ...config };
  state.setLowPassFilter(config);
  audioEngine.applyLowPassFilter(newConfig);
}

export function imperativeUpdateHighPassFilter(config: Partial<FilterConfig>): void {
  const state = useAudioStore.getState();
  const newConfig = { ...state.highPassFilter, ...config };
  state.setHighPassFilter(config);
  audioEngine.applyHighPassFilter(newConfig);
}

export function imperativeUpdateBandPassFilter(config: Partial<FilterConfig>): void {
  const state = useAudioStore.getState();
  const newConfig = { ...state.bandPassFilter, ...config };
  state.setBandPassFilter(config);
  audioEngine.applyBandPassFilter(newConfig);
}

export function imperativeUpdateNotchFilter(config: Partial<FilterConfig>): void {
  const state = useAudioStore.getState();
  const newConfig = { ...state.notchFilter, ...config };
  state.setNotchFilter(config);
  audioEngine.applyNotchFilter(newConfig);
}

export function imperativeUpdateCompressor(config: Partial<CompressorConfig>): void {
  const state = useAudioStore.getState();
  const newConfig = { ...state.compressor, ...config };
  state.setCompressor(config);
  audioEngine.applyCompressor(newConfig);
}

export function imperativeSetVolume(volume: number): void {
  const clamped = Math.max(0, Math.min(1, volume));
  useAudioStore.getState().setVolume(clamped);
  audioEngine.setVolume(clamped);
}

export function imperativeSetPitch(semitones: number): void {
  const clamped = Math.max(-12, Math.min(12, semitones));
  useAudioStore.getState().setPitchShift({ semitones: clamped });
  audioEngine.applyPitchShift(clamped);
}

export function imperativeApplyPreset(preset: 'clear' | 'remove-mask' | 'deep-analysis'): void {
  switch (preset) {
    case 'clear':
      imperativeUpdateLowPassFilter({ frequency: 8000, enabled: false });
      imperativeUpdateHighPassFilter({ frequency: 200, enabled: false });
      break;
    case 'remove-mask':
      imperativeUpdateLowPassFilter({ frequency: 3000, enabled: true });
      imperativeUpdateHighPassFilter({ frequency: 300, enabled: true });
      break;
    case 'deep-analysis':
      imperativeUpdateLowPassFilter({ frequency: 5000, enabled: true });
      imperativeUpdateHighPassFilter({ frequency: 250, enabled: true });
      break;
  }
}
