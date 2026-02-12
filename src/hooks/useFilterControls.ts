/**
 * Custom hook for audio filter controls
 */

import { useCallback } from 'react';
import { useAudioStore } from '@/stores/audioStore';
import { audioEngine } from '@/services/audioEngine';
import type { FilterConfig } from '@/types/audio';

export const useFilterControls = () => {
  const {
    lowPassFilter,
    highPassFilter,
    setLowPassFilter,
    setHighPassFilter,
  } = useAudioStore();

  const updateLowPassFilter = useCallback(
    (config: Partial<FilterConfig>) => {
      const newConfig = { ...lowPassFilter, ...config };
      setLowPassFilter(config);
      audioEngine.applyLowPassFilter(newConfig);
    },
    [lowPassFilter, setLowPassFilter]
  );

  const updateHighPassFilter = useCallback(
    (config: Partial<FilterConfig>) => {
      const newConfig = { ...highPassFilter, ...config };
      setHighPassFilter(config);
      audioEngine.applyHighPassFilter(newConfig);
    },
    [highPassFilter, setHighPassFilter]
  );

  const applyPreset = useCallback(
    (preset: 'clear' | 'remove-mask' | 'deep-analysis') => {
      switch (preset) {
        case 'clear':
          updateLowPassFilter({ frequency: 8000, enabled: false });
          updateHighPassFilter({ frequency: 200, enabled: false });
          break;
        case 'remove-mask':
          updateLowPassFilter({ frequency: 3000, enabled: true });
          updateHighPassFilter({ frequency: 300, enabled: true });
          break;
        case 'deep-analysis':
          updateLowPassFilter({ frequency: 5000, enabled: true });
          updateHighPassFilter({ frequency: 250, enabled: true });
          break;
      }
    },
    [updateLowPassFilter, updateHighPassFilter]
  );

  return {
    lowPassFilter,
    highPassFilter,
    updateLowPassFilter,
    updateHighPassFilter,
    applyPreset,
  };
};
