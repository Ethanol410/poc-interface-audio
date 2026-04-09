/**
 * Stream Deck command dispatcher.
 * Maps action names to store/engine calls via shared filterActions.
 */

import { useAudioStore } from '@/stores/audioStore';
import { audioEngine } from '@/services/audioEngine';
import {
  imperativeUpdateLowPassFilter,
  imperativeUpdateHighPassFilter,
  imperativeUpdateBandPassFilter,
  imperativeUpdateNotchFilter,
  imperativeUpdateCompressor,
  imperativeSetVolume,
  imperativeSetPitch,
  imperativeSetSpeed,
  imperativeApplyPreset,
  imperativeResetAllFilters,
} from '@/services/filterActions';
import type { ButtonAction, DialAction, DialPushAction } from './streamDeckMappings';

let isMuted = false;
let savedVolumeBeforeMute = 0.8;

export function dispatchButtonAction(action: ButtonAction): void {
  const state = useAudioStore.getState();
  switch (action) {
    case 'toggle-play':
      audioEngine.triggerPlayPause();
      break;
    case 'toggle-reverse':
      state.toggleReverse();
      break;
    case 'toggle-lowpass':
      imperativeUpdateLowPassFilter({ enabled: !state.lowPassFilter.enabled });
      break;
    case 'toggle-highpass':
      imperativeUpdateHighPassFilter({ enabled: !state.highPassFilter.enabled });
      break;
    case 'toggle-bandpass':
      imperativeUpdateBandPassFilter({ enabled: !state.bandPassFilter.enabled });
      break;
    case 'toggle-notch':
      imperativeUpdateNotchFilter({ enabled: !state.notchFilter.enabled });
      break;
    case 'toggle-compressor':
      imperativeUpdateCompressor({ enabled: !state.compressor.enabled });
      break;
    case 'toggle-comparison':
      state.toggleComparisonMode();
      break;
    case 'reset-all-filters':
      imperativeResetAllFilters();
      break;
    case 'apply-preset-clear':
      imperativeApplyPreset('clear');
      break;
    case 'apply-preset-masque':
      imperativeApplyPreset('remove-mask');
      break;
    case 'apply-preset-analyse':
      imperativeApplyPreset('deep-analysis');
      break;
    case 'switch-page':
      // Handled by StreamDeckService — should not reach here
      break;
  }
}

export function dispatchDialAction(action: DialAction, ticks: number, step: number): void {
  const state = useAudioStore.getState();
  switch (action) {
    case 'set-volume': {
      const newVol = Math.max(0, Math.min(1, state.volume + ticks * step));
      imperativeSetVolume(newVol);
      break;
    }
    case 'set-lowpass-freq': {
      const newFreq = Math.max(200, Math.min(20000, state.lowPassFilter.frequency + ticks * step));
      imperativeUpdateLowPassFilter({ frequency: newFreq });
      break;
    }
    case 'set-highpass-freq': {
      const newFreq = Math.max(20, Math.min(2000, state.highPassFilter.frequency + ticks * step));
      imperativeUpdateHighPassFilter({ frequency: newFreq });
      break;
    }
    case 'set-pitch': {
      const newPitch = Math.max(-12, Math.min(12, state.pitchShift.semitones + ticks * step));
      imperativeSetPitch(newPitch);
      break;
    }
    case 'set-bandpass-freq': {
      const newFreq = Math.max(200, Math.min(8000, state.bandPassFilter.frequency + ticks * step));
      imperativeUpdateBandPassFilter({ frequency: newFreq });
      break;
    }
    case 'set-notch-freq': {
      const newFreq = Math.max(50, Math.min(500, state.notchFilter.frequency + ticks * step));
      imperativeUpdateNotchFilter({ frequency: newFreq });
      break;
    }
    case 'set-speed': {
      const newSpeed = Math.max(0.25, Math.min(2, state.playbackSpeed + ticks * step));
      imperativeSetSpeed(newSpeed);
      break;
    }
  }
}

export function dispatchDialPushAction(action: DialPushAction): void {
  const state = useAudioStore.getState();
  switch (action) {
    case 'mute-toggle':
      if (isMuted) {
        imperativeSetVolume(savedVolumeBeforeMute);
        isMuted = false;
      } else {
        savedVolumeBeforeMute = state.volume;
        imperativeSetVolume(0);
        isMuted = true;
      }
      break;
    case 'toggle-lowpass':
      imperativeUpdateLowPassFilter({ enabled: !state.lowPassFilter.enabled });
      break;
    case 'toggle-highpass':
      imperativeUpdateHighPassFilter({ enabled: !state.highPassFilter.enabled });
      break;
    case 'reset-pitch':
      imperativeSetPitch(0);
      break;
    case 'toggle-bandpass':
      imperativeUpdateBandPassFilter({ enabled: !state.bandPassFilter.enabled });
      break;
    case 'toggle-notch':
      imperativeUpdateNotchFilter({ enabled: !state.notchFilter.enabled });
      break;
    case 'reset-speed':
      imperativeSetSpeed(1.0);
      break;
  }
}
