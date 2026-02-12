/**
 * Audio Analysis Service
 * Provides advanced audio analysis features: FFT, pitch detection, spectral analysis
 */

import * as Tone from 'tone';

export interface SpectralData {
  frequencies: Float32Array;
  magnitudes: Float32Array;
  dominantFrequency: number;
  spectralCentroid: number;
}

export interface PitchDetectionResult {
  frequency: number;
  note: string;
  cents: number;
  confidence: number;
}

class AudioAnalysisService {
  private static instance: AudioAnalysisService;
  private fftAnalyzer: Tone.FFT | null = null;
  private waveformAnalyzer: Tone.Waveform | null = null;

  private constructor() {}

  public static getInstance(): AudioAnalysisService {
    if (!AudioAnalysisService.instance) {
      AudioAnalysisService.instance = new AudioAnalysisService();
    }
    return AudioAnalysisService.instance;
  }

  /**
   * Initialize analyzers
   */
  public initialize(fftSize: number = 2048): void {
    this.fftAnalyzer = new Tone.FFT(fftSize);
    this.waveformAnalyzer = new Tone.Waveform(fftSize);
  }

  /**
   * Connect to audio source
   */
  public connect(source: Tone.ToneAudioNode): void {
    if (this.fftAnalyzer && this.waveformAnalyzer) {
      source.connect(this.fftAnalyzer);
      source.connect(this.waveformAnalyzer);
    }
  }

  /**
   * Get frequency spectrum data
   */
  public getSpectralData(): SpectralData | null {
    if (!this.fftAnalyzer) return null;

    const values = this.fftAnalyzer.getValue();
    const frequencies = new Float32Array(values.length);
    const magnitudes = new Float32Array(values.length);

    let maxMag = -Infinity;
    let maxIdx = 0;
    let spectralSum = 0;
    let magnitudeSum = 0;

    for (let i = 0; i < values.length; i++) {
      const frequency = (i * Tone.getContext().sampleRate) / (values.length * 2);
      const magnitude = values[i];

      frequencies[i] = frequency;
      magnitudes[i] = magnitude;

      if (magnitude > maxMag) {
        maxMag = magnitude;
        maxIdx = i;
      }

      const linearMag = Math.pow(10, magnitude / 20);
      spectralSum += frequency * linearMag;
      magnitudeSum += linearMag;
    }

    const dominantFrequency = frequencies[maxIdx];
    const spectralCentroid = magnitudeSum > 0 ? spectralSum / magnitudeSum : 0;

    return {
      frequencies,
      magnitudes,
      dominantFrequency,
      spectralCentroid,
    };
  }

  /**
   * Get waveform data
   */
  public getWaveformData(): Float32Array | null {
    if (!this.waveformAnalyzer) return null;
    return this.waveformAnalyzer.getValue();
  }

  /**
   * Detect pitch using autocorrelation
   */
  public detectPitch(): PitchDetectionResult | null {
    const waveform = this.getWaveformData();
    if (!waveform || waveform.length === 0) return null;

    const sampleRate = Tone.getContext().sampleRate;
    const minFreq = 80; // Hz
    const maxFreq = 1000; // Hz
    const minPeriod = Math.floor(sampleRate / maxFreq);
    const maxPeriod = Math.floor(sampleRate / minFreq);

    // Autocorrelation
    let bestCorrelation = 0;
    let bestPeriod = 0;

    for (let period = minPeriod; period < maxPeriod; period++) {
      let correlation = 0;
      for (let i = 0; i < waveform.length - period; i++) {
        correlation += waveform[i] * waveform[i + period];
      }

      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestPeriod = period;
      }
    }

    if (bestPeriod === 0) return null;

    const frequency = sampleRate / bestPeriod;
    const { note, cents } = this.frequencyToNote(frequency);
    const confidence = bestCorrelation / waveform.length;

    return {
      frequency,
      note,
      cents,
      confidence,
    };
  }

  /**
   * Convert frequency to musical note
   */
  private frequencyToNote(frequency: number): { note: string; cents: number } {
    const A4 = 440;
    const noteNames = [
      'C',
      'C#',
      'D',
      'D#',
      'E',
      'F',
      'F#',
      'G',
      'G#',
      'A',
      'A#',
      'B',
    ];

    const halfStepsFromA4 = 12 * Math.log2(frequency / A4);
    const noteNumber = Math.round(halfStepsFromA4) + 69; // MIDI note number
    const cents = Math.round((halfStepsFromA4 - Math.round(halfStepsFromA4)) * 100);

    const octave = Math.floor(noteNumber / 12) - 1;
    const noteName = noteNames[noteNumber % 12];

    return {
      note: `${noteName}${octave}`,
      cents,
    };
  }

  /**
   * Calculate RMS (Root Mean Square) level
   */
  public calculateRMS(samples: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < samples.length; i++) {
      sum += samples[i] * samples[i];
    }
    return Math.sqrt(sum / samples.length);
  }

  /**
   * Calculate peak level
   */
  public calculatePeakLevel(samples: Float32Array): number {
    let peak = 0;
    for (let i = 0; i < samples.length; i++) {
      const abs = Math.abs(samples[i]);
      if (abs > peak) peak = abs;
    }
    return peak;
  }

  /**
   * Cleanup
   */
  public cleanup(): void {
    this.fftAnalyzer?.dispose();
    this.waveformAnalyzer?.dispose();
    this.fftAnalyzer = null;
    this.waveformAnalyzer = null;
  }
}

export const audioAnalysisService = AudioAnalysisService.getInstance();
