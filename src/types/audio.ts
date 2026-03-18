// Audio state types
export interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isLoading: boolean;
  error: string | null;
}

// Filter configuration
export interface FilterConfig {
  type: 'lowpass' | 'highpass' | 'bandpass' | 'notch';
  frequency: number;
  q: number;
  enabled: boolean;
}

// Compressor configuration
export interface CompressorConfig {
  enabled: boolean;
  threshold: number; // dB, -100 to 0
  ratio: number;     // 1 to 20
}

// Pitch shift configuration
export interface PitchShiftConfig {
  semitones: number;
  cents: number;
  enabled: boolean;
}

// Audio analysis data
export interface AudioAnalysisData {
  frequencyData: Uint8Array;
  waveformData: Float32Array;
  rms: number;
  peakLevel: number;
}

// Audio buffer info
export interface AudioBufferInfo {
  buffer: AudioBuffer | null;
  url: string;
  name: string;
  duration: number;
}
