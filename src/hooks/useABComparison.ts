/**
 * Custom hook for A/B comparison controls
 */

import { useCallback } from 'react';
import { useAudioStore } from '@/stores/audioStore';
import { audioEngine } from '@/services/audioEngine';

export const useABComparison = () => {
  const { isComparisonMode, toggleComparisonMode } = useAudioStore();

  const toggleComparison = useCallback(() => {
    const newMode = !isComparisonMode;
    toggleComparisonMode();
    audioEngine.toggleComparison(newMode);
  }, [isComparisonMode, toggleComparisonMode]);

  const setToOriginal = useCallback(() => {
    if (isComparisonMode) {
      toggleComparisonMode();
      audioEngine.toggleComparison(false);
    }
  }, [isComparisonMode, toggleComparisonMode]);

  const setToProcessed = useCallback(() => {
    if (!isComparisonMode) {
      toggleComparisonMode();
      audioEngine.toggleComparison(true);
    }
  }, [isComparisonMode, toggleComparisonMode]);

  return {
    isComparisonMode,
    toggleComparison,
    setToOriginal,
    setToProcessed,
  };
};
