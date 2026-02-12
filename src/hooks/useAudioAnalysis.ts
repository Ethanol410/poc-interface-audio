/**
 * Custom hook for audio analysis (FFT, pitch detection, spectral data)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { audioAnalysisService } from '@/services/audioAnalysis';
import type { SpectralData, PitchDetectionResult } from '@/services/audioAnalysis';

export const useAudioAnalysis = (isPlaying: boolean) => {
  const [spectralData, setSpectralData] = useState<SpectralData | null>(null);
  const [pitchData, setPitchData] = useState<PitchDetectionResult | null>(null);
  const [waveformData, setWaveformData] = useState<Float32Array | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Initialize analysis service
  useEffect(() => {
    audioAnalysisService.initialize(2048);
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  // Real-time analysis loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      return;
    }

    const updateAnalysis = () => {
      // Update spectral data
      const spectral = audioAnalysisService.getSpectralData();
      if (spectral) {
        setSpectralData(spectral);
      }

      // Update waveform
      const waveform = audioAnalysisService.getWaveformData();
      if (waveform) {
        setWaveformData(waveform);
      }

      animationFrameId.current = requestAnimationFrame(updateAnalysis);
    };

    updateAnalysis();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPlaying]);

  // Detect pitch on demand
  const detectPitch = useCallback(() => {
    const result = audioAnalysisService.detectPitch();
    setPitchData(result);
    return result;
  }, []);

  return {
    spectralData,
    pitchData,
    waveformData,
    detectPitch,
  };
};
