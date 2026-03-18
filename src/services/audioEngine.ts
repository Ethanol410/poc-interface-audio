/**
 * Audio Engine Service - Singleton managing Web Audio API processing chain
 * Routes WaveSurfer's media element through filter/pitch nodes
 */

import * as Tone from 'tone';
import type {
  AudioState,
  FilterConfig,
  CompressorConfig,
  AudioAnalysisData,
} from '@/types/audio';

class AudioEngine {
  private static instance: AudioEngine;

  // Native Web Audio nodes (use Tone's AudioContext)
  private context: AudioContext | null = null;
  private mediaSource: MediaElementAudioSourceNode | null = null;
  private mediaElement: HTMLMediaElement | null = null;
  private lpFilterNode: BiquadFilterNode | null = null;
  private hpFilterNode: BiquadFilterNode | null = null;
  private bandpassNode: BiquadFilterNode | null = null;
  private notchNode: BiquadFilterNode | null = null;
  private compressorNode: DynamicsCompressorNode | null = null;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;

  private isInitialized = false;
  private listeners: Map<string, Set<Function>> = new Map();

  private constructor() {}

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  /**
   * Initialize the audio engine - sets up native Web Audio processing chain
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Unlock AudioContext (requires user gesture)
      await Tone.start();
      this.context = Tone.getContext().rawContext as AudioContext;

      // Low-pass filter (default: bypass at 20kHz)
      this.lpFilterNode = this.context.createBiquadFilter();
      this.lpFilterNode.type = 'lowpass';
      this.lpFilterNode.frequency.value = 20000;
      this.lpFilterNode.Q.value = 1;

      // High-pass filter (default: bypass at 20Hz)
      this.hpFilterNode = this.context.createBiquadFilter();
      this.hpFilterNode.type = 'highpass';
      this.hpFilterNode.frequency.value = 20;
      this.hpFilterNode.Q.value = 1;

      // Band-pass filter (default: allpass bypass)
      this.bandpassNode = this.context.createBiquadFilter();
      this.bandpassNode.type = 'allpass';
      this.bandpassNode.frequency.value = 1500;
      this.bandpassNode.Q.value = 1;

      // Notch filter (default: allpass bypass)
      this.notchNode = this.context.createBiquadFilter();
      this.notchNode.type = 'allpass';
      this.notchNode.frequency.value = 60;
      this.notchNode.Q.value = 10;

      // Compressor (default: transparent 1:1 ratio)
      this.compressorNode = this.context.createDynamicsCompressor();
      this.compressorNode.threshold.value = 0;
      this.compressorNode.ratio.value = 1;
      this.compressorNode.attack.value = 0.003;
      this.compressorNode.release.value = 0.25;

      // Master gain
      this.gainNode = this.context.createGain();
      this.gainNode.gain.value = 0.8;

      // Analyser for visualizations
      this.analyserNode = this.context.createAnalyser();
      this.analyserNode.fftSize = 2048;
      this.analyserNode.smoothingTimeConstant = 0.8;

      // Chain: source → lpFilter → hpFilter → bandpass → notch → compressor → gain → analyser → destination
      this.lpFilterNode.connect(this.hpFilterNode);
      this.hpFilterNode.connect(this.bandpassNode);
      this.bandpassNode.connect(this.notchNode);
      this.notchNode.connect(this.compressorNode);
      this.compressorNode.connect(this.gainNode);
      this.gainNode.connect(this.analyserNode);
      this.analyserNode.connect(this.context.destination);

      this.isInitialized = true;
      this.emit('initialized');
    } catch (error) {
      console.error('Failed to initialize audio engine:', error);
      throw error;
    }
  }

  /**
   * Connect a WaveSurfer media element to the processing chain.
   * Call this once WaveSurfer fires 'ready'.
   */
  public connectMediaElement(element: HTMLMediaElement): void {
    if (!this.isInitialized || !this.context || !this.lpFilterNode) {
      console.warn('AudioEngine not initialized yet, skipping connectMediaElement');
      return;
    }

    // Disconnect previous source if any
    if (this.mediaSource) {
      try {
        this.mediaSource.disconnect();
      } catch {
        /* ignore */
      }
      this.mediaSource = null;
    }

    try {
      this.mediaElement = element;
      this.mediaSource = this.context.createMediaElementSource(element);
      this.mediaSource.connect(this.lpFilterNode);
      console.log('AudioEngine: media element connected to filter chain');
      this.emit('connected');
    } catch (err) {
      // createMediaElementSource() throws if called twice for the same element
      console.warn('AudioEngine: connectMediaElement error (element may already be connected):', err);
    }
  }

  /**
   * No-op: WaveSurfer handles actual loading and playback.
   * Kept for backward compatibility with useAudioControls.
   */
  public async loadAudio(_url: string, _name: string): Promise<void> {
    // WaveSurfer handles loading via its audioUrl prop
    this.emit('loading', false);
  }

  /** No-op: WaveSurfer handles play */
  public play(): void {
    this.emit('play');
  }

  /** No-op: WaveSurfer handles pause */
  public pause(): void {
    this.emit('pause');
  }

  /** No-op: WaveSurfer handles seek */
  public seek(_time: number): void {}

  /**
   * Set master volume (0–1)
   */
  public setVolume(volume: number): void {
    if (!this.gainNode) return;
    this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    this.emit('volume', volume);
  }

  /**
   * Apply low-pass filter.
   * When enabled=false, set to 20 kHz (transparent/bypass).
   */
  public applyLowPassFilter(config: FilterConfig): void {
    if (!this.lpFilterNode) return;
    if (!config.enabled) {
      this.lpFilterNode.frequency.value = 20000;
    } else {
      this.lpFilterNode.frequency.value = config.frequency;
      this.lpFilterNode.Q.value = config.q;
    }
    this.emit('filterChange', { type: 'lowpass', config });
  }

  /**
   * Apply high-pass filter.
   * When enabled=false, set to 20 Hz (transparent/bypass).
   */
  public applyHighPassFilter(config: FilterConfig): void {
    if (!this.hpFilterNode) return;
    if (!config.enabled) {
      this.hpFilterNode.frequency.value = 20;
    } else {
      this.hpFilterNode.frequency.value = config.frequency;
      this.hpFilterNode.Q.value = config.q;
    }
    this.emit('filterChange', { type: 'highpass', config });
  }

  /**
   * Apply band-pass filter.
   * When disabled, set to allpass (transparent).
   */
  public applyBandPassFilter(config: FilterConfig): void {
    if (!this.bandpassNode) return;
    if (!config.enabled) {
      this.bandpassNode.type = 'allpass';
    } else {
      this.bandpassNode.type = 'bandpass';
      this.bandpassNode.frequency.value = config.frequency;
      this.bandpassNode.Q.value = config.q;
    }
    this.emit('filterChange', { type: 'bandpass', config });
  }

  /**
   * Apply notch filter to remove a specific frequency (e.g., 50/60Hz hum).
   * When disabled, set to allpass (transparent).
   */
  public applyNotchFilter(config: FilterConfig): void {
    if (!this.notchNode) return;
    if (!config.enabled) {
      this.notchNode.type = 'allpass';
    } else {
      this.notchNode.type = 'notch';
      this.notchNode.frequency.value = config.frequency;
      this.notchNode.Q.value = config.q;
    }
    this.emit('filterChange', { type: 'notch', config });
  }

  /**
   * Apply dynamic compression.
   * When disabled, ratio=1 threshold=0 (transparent).
   */
  public applyCompressor(config: CompressorConfig): void {
    if (!this.compressorNode) return;
    if (!config.enabled) {
      this.compressorNode.threshold.value = 0;
      this.compressorNode.ratio.value = 1;
    } else {
      this.compressorNode.threshold.value = config.threshold;
      this.compressorNode.ratio.value = config.ratio;
      this.compressorNode.attack.value = 0.003;
      this.compressorNode.release.value = 0.25;
    }
    this.emit('compressor', config);
  }

  /**
   * Set playback speed (0.25x to 2x).
   */
  public setPlaybackSpeed(rate: number): void {
    if (this.mediaElement) {
      this.mediaElement.playbackRate = Math.max(0.25, Math.min(2, rate));
    }
    this.emit('playbackSpeed', rate);
  }

  /**
   * Apply pitch shift via playback rate.
   * Note: changes speed + pitch together (HTML media element limitation).
   * A rate of 2^(semitones/12) converts semitones to playback rate.
   */
  public applyPitchShift(semitones: number): void {
    if (this.mediaElement) {
      const rate = Math.pow(2, semitones / 12);
      // Clamp to reasonable range to avoid browser errors
      this.mediaElement.playbackRate = Math.max(0.25, Math.min(4, rate));
    }
    this.emit('pitchShift', semitones);
  }

  /**
   * Reverse playback.
   * Note: HTML media elements don't support native reverse.
   * The UI state is tracked in the store for clue discovery.
   */
  public setReverse(_reversed: boolean): void {
    this.emit('reverse', _reversed);
  }

  /**
   * A/B comparison toggle (no-op in simplified engine)
   */
  public toggleComparison(_useProcessed: boolean): void {
    this.emit('comparison', _useProcessed);
  }

  public isInProcessedMode(): boolean {
    return true;
  }

  /**
   * Get current audio analysis data for visualizations
   */
  public getAnalysisData(): AudioAnalysisData | null {
    if (!this.analyserNode) return null;

    const bufferLength = this.analyserNode.frequencyBinCount;
    const waveformData = new Float32Array(bufferLength);
    const frequencyData = new Uint8Array(bufferLength);

    this.analyserNode.getFloatTimeDomainData(waveformData);
    this.analyserNode.getByteFrequencyData(frequencyData);

    let rms = 0;
    let peak = 0;
    for (let i = 0; i < waveformData.length; i++) {
      const abs = Math.abs(waveformData[i]);
      rms += abs * abs;
      peak = Math.max(peak, abs);
    }
    rms = Math.sqrt(rms / waveformData.length);

    return { frequencyData, waveformData, rms, peakLevel: peak };
  }

  /**
   * Get basic playback state (WaveSurfer manages actual time/playing state)
   */
  public getState(): Partial<AudioState> {
    return { isPlaying: false, currentTime: 0, duration: 0 };
  }

  /**
   * Cleanup
   */
  public cleanup(): void {
    if (this.mediaSource) {
      try {
        this.mediaSource.disconnect();
      } catch {
        /* ignore */
      }
      this.mediaSource = null;
    }
    this.mediaElement = null;
    this.lpFilterNode = null;
    this.hpFilterNode = null;
    this.bandpassNode = null;
    this.notchNode = null;
    this.compressorNode = null;
    this.gainNode = null;
    this.analyserNode = null;
    this.isInitialized = false;
    this.listeners.clear();
  }

  // Event emitter
  private emit(event: string, data?: unknown): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  public on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  public off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }
}

export const audioEngine = AudioEngine.getInstance();
