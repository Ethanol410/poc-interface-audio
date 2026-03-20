/**
 * Custom hook for audio filter controls
 */

import { useCallback } from 'react';
import { useAudioStore } from '@/stores/audioStore';
import {
  imperativeUpdateLowPassFilter,
  imperativeUpdateHighPassFilter,
  imperativeApplyPreset,
} from '@/services/filterActions';
import type { FilterConfig } from '@/types/audio';

export const useFilterControls = () => {
  const { lowPassFilter, highPassFilter } = useAudioStore();

  const updateLowPassFilter = useCallback((config: Partial<FilterConfig>) => {
    imperativeUpdateLowPassFilter(config);
  }, []);

  const updateHighPassFilter = useCallback((config: Partial<FilterConfig>) => {
    imperativeUpdateHighPassFilter(config);
  }, []);

  const applyPreset = useCallback(
    (preset: 'clear' | 'remove-mask' | 'deep-analysis') => {
      imperativeApplyPreset(preset);
    },
    []
  );

  return {
    lowPassFilter,
    highPassFilter,
    updateLowPassFilter,
    updateHighPassFilter,
    applyPreset,
  };
};
