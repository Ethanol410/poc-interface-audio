/**
 * Audio Engine Service - Singleton managing Web Audio API and Tone.js
 * Handles audio playback, filtering, pitch shifting, and analysis
 */

import * as Tone from 'tone';
import type {
  AudioState,
  FilterConfig,
  AudioAnalysisData,
  AudioBufferInfo,
} from '@/types/audio';

class AudioEngine {
  private static instance: AudioEngine;
  private player: Tone.Player | null = null;
  private originalPlayer: Tone.Player | null = null; // For A/B comparison
  private lowPassFilter: Tone.Filter | null = null;
  private highPassFilter: Tone.Filter | null = null;
  private pitchShift: Tone.PitchShift | null = null;
  private analyzer: Tone.Analyser | null = null;
  private currentBuffer: AudioBufferInfo | null = null;
  private isInitialized = false;
  private listeners: Map<string, Set<Function>> = new Map();
  private isProcessedMode = true; // true = processed, false = original
  private crossFade: Tone.CrossFade | null = null;

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  /**
   * Initialize the audio engine
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Start Tone.js context
      await Tone.start();

      // Create audio nodes
      this.player = new Tone.Player();
      this.originalPlayer = new Tone.Player();
      this.crossFade = new Tone.CrossFade(1); // Start with processed (1)
      
      this.lowPassFilter = new Tone.Filter({
        type: 'lowpass',
        frequency: 8000,
        Q: 1,
      });
      this.highPassFilter = new Tone.Filter({
        type: 'highpass',
        frequency: 200,
        Q: 1,
      });
      this.pitchShift = new Tone.PitchShift({
        pitch: 0,
        windowSize: 0.1,
        delayTime: 0,
        feedback: 0,
      });
      this.analyzer = new Tone.Analyser('waveform', 2048);

      // Connect audio graph:
      // originalPlayer → crossFade.a
      // player → filters → pitchShift → crossFade.b
      // crossFade → analyzer → destination
      this.originalPlayer.connect(this.crossFade.a);
      this.player.chain(
        this.lowPassFilter,
        this.highPassFilter,
        this.pitchShift,
        this.crossFade.b
      );
      this.crossFade.chain(this.analyzer, Tone.getDestination());

      this.isInitialized = true;
      this.emit('initialized');
    } catch (error) {
      console.error('Failed to initialize audio engine:', error);
      throw error;
    }
  }

  /**
   * Load audio file from URL
   */
  public async loadAudio(url: string, name: string): Promise<void> {
    if (!this.isInitialized || !this.player || !this.originalPlayer) {
      throw new Error('Audio engine not initialized');
    }

    try {
      this.emit('loading', true);

      // Load into both players for A/B comparison
      await Promise.all([
        this.player.load(url),
        this.originalPlayer.load(url),
      ]);

      this.currentBuffer = {
        buffer: this.player.buffer.get() as AudioBuffer,
        url,
        name,
        duration: this.player.buffer.duration,
      };

      this.emit('loaded', this.currentBuffer);
      this.emit('loading', false);
    } catch (error) {
      this.emit('loading', false);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Play audio
   */
  public play(): void {
    if (!this.player || !this.originalPlayer || !this.currentBuffer) {
      throw new Error('No audio loaded');
    }

    // Sync both players
    const now = Tone.now();
    this.player.start(now);
    this.originalPlayer.start(now);
    this.emit('play');
  }

  /**
   * Pause audio
   */
  public pause(): void {
    if (!this.player || !this.originalPlayer) return;
    this.player.stop();
    this.originalPlayer.stop();
    this.emit('pause');
  }

  /**
   * Seek to position (seconds)
   */
  public seek(time: number): void {
    if (!this.player || !this.originalPlayer) return;
    const wasPlaying = this.player.state === 'started';
    
    this.player.stop();
    this.originalPlayer.stop();
    
    if (wasPlaying) {
      const now = Tone.now();
      this.player.start(now, time);
      this.originalPlayer.start(now, time);
    }
    this.emit('seek', time);
  }

  /**
   * Set volume (0-1)
   */
  public setVolume(volume: number): void {
    if (!this.player) return;
    this.player.volume.value = Tone.gainToDb(volume);
    this.emit('volume', volume);
  }

  /**
   * Apply low-pass filter
   */
  public applyLowPassFilter(config: FilterConfig): void {
    if (!this.lowPassFilter) return;
    this.lowPassFilter.frequency.value = config.frequency;
    this.lowPassFilter.Q.value = config.q;
    // Enable/disable by connecting/disconnecting (simplified - keeping connected)
    this.emit('filterChange', { type: 'lowpass', config });
  }

  /**
   * Apply high-pass filter
   */
  public applyHighPassFilter(config: FilterConfig): void {
    if (!this.highPassFilter) return;
    this.highPassFilter.frequency.value = config.frequency;
    this.highPassFilter.Q.value = config.q;
    this.emit('filterChange', { type: 'highpass', config });
  }

  /**
   * Apply pitch shift
   */
  public applyPitchShift(semitones: number, _rampTime = 0.1): void {
    if (!this.pitchShift) return;
    this.pitchShift.pitch = semitones;
    this.emit('pitchShift', semitones);
  }

  /**
   * Toggle A/B comparison (original vs processed)
   */
  public toggleComparison(useProcessed: boolean): void {
    if (!this.crossFade) return;
    
    this.isProcessedMode = useProcessed;
    const fadeTime = 0.1; // 100ms crossfade
    
    if (useProcessed) {
      // Fade to processed (b channel)
      this.crossFade.fade.rampTo(1, fadeTime);
    } else {
      // Fade to original (a channel)
      this.crossFade.fade.rampTo(0, fadeTime);
    }
    
    this.emit('comparison', useProcessed);
  }

  /**
   * Get comparison mode state
   */
  public isInProcessedMode(): boolean {
    return this.isProcessedMode;
  }

  /**
   * Get current audio analysis data
   */
  public getAnalysisData(): AudioAnalysisData | null {
    if (!this.analyzer) return null;

    const waveformData = this.analyzer.getValue() as Float32Array;
    const frequencyData = new Uint8Array(waveformData.length);

    // Simple conversion for frequency representation
    for (let i = 0; i < waveformData.length; i++) {
      frequencyData[i] = Math.abs(waveformData[i]) * 255;
    }

    // Calculate RMS and peak
    let rms = 0;
    let peak = 0;
    for (let i = 0; i < waveformData.length; i++) {
      const abs = Math.abs(waveformData[i]);
      rms += abs * abs;
      peak = Math.max(peak, abs);
    }
    rms = Math.sqrt(rms / waveformData.length);

    return {
      frequencyData,
      waveformData,
      rms,
      peakLevel: peak,
    };
  }

  /**
   * Get current audio state
   */
  public getState(): Partial<AudioState> {
    if (!this.player || !this.currentBuffer) {
      return {
        isPlaying: false,
        currentTime: 0,
        duration: 0,
      };
    }

    return {
      isPlaying: this.player.state === 'started',
      currentTime: Tone.getTransport().seconds,
      duration: this.currentBuffer.duration,
    };
  }

  /**
   * Cleanup and dispose resources
   */
  public cleanup(): void {
    this.player?.dispose();
    this.lowPassFilter?.dispose();
    this.highPassFilter?.dispose();
    this.pitchShift?.dispose();
    this.analyzer?.dispose();
    this.isInitialized = false;
    this.listeners.clear();
  }

  // Event emitter methods
  private emit(event: string, data?: any): void {
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
