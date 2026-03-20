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
  imperativeApplyPreset,
} from '@/services/filterActions';
import { PRESET_CYCLE } from './streamDeckMappings';
import type { ButtonAction, DialAction, DialPushAction } from './streamDeckMappings';

let presetIndex = 0;
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
    case 'cycle-preset':
      imperativeApplyPreset(PRESET_CYCLE[presetIndex]);
      presetIndex = (presetIndex + 1) % PRESET_CYCLE.length;
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
  }
}
