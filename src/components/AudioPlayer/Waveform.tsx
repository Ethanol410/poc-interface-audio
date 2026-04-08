/**
 * Waveform Component - Audio waveform visualization with Wavesurfer.js
 */

import { useEffect, useRef, useState, useCallback, memo } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { useAudioStore } from '@/stores/audioStore';
import { audioEngine } from '@/services/audioEngine';
import Spinner from '@/components/Layout/Spinner';

interface WaveformProps {
  audioUrl?: string;
  height?: number;
  isBrainCity?: boolean;
  onReady?: () => void;
  onError?: (error: Error) => void;
}

const Waveform = memo(({
  audioUrl,
  height = 128,
  isBrainCity = false,
  onReady,
  onError,
}: WaveformProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { setIsPlaying, setCurrentTime, setDuration } = useAudioStore();

  useEffect(() => {
    if (!containerRef.current) return;
    if (!audioUrl) {
      setError('Aucun fichier audio');
      return;
    }

    let isDestroyed = false;
    console.log('Waveform: Initialisation avec URL:', audioUrl);

    // Initialize Wavesurfer
    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: isBrainCity ? 'rgba(6, 214, 160, 0.4)' : 'rgba(0, 212, 255, 0.3)',
      progressColor: isBrainCity ? '#118AB2' : 'rgba(0, 212, 255, 1)',
      cursorColor: isBrainCity ? '#EF476F' : '#00ff88',
      cursorWidth: isBrainCity ? 4 : 2,
      barWidth: isBrainCity ? 4 : 2,
      barGap: isBrainCity ? 2 : 1,
      barRadius: isBrainCity ? 4 : 2,
      height,
      normalize: true,
      interact: true,
    });

    wavesurferRef.current = wavesurfer;

    // Event listeners
    wavesurfer.on('ready', () => {
      if (isDestroyed) return;
      console.log('Waveform: Prêt !');
      setIsReady(true);
      setDuration(wavesurfer.getDuration());
      // Route audio through engine's filter/processing chain
      const mediaEl = wavesurfer.getMediaElement();
      if (mediaEl) {
        audioEngine.connectMediaElement(mediaEl);
      }
      audioEngine.setPlayPauseCallback(() => wavesurfer.playPause());
      onReady?.();
    });

    wavesurfer.on('play', () => {
      if (isDestroyed) return;
      setIsPlaying(true);
    });

    wavesurfer.on('pause', () => {
      if (isDestroyed) return;
      setIsPlaying(false);
    });

    wavesurfer.on('audioprocess', () => {
      if (isDestroyed) return;
      setCurrentTime(wavesurfer.getCurrentTime());
    });

    wavesurfer.on('interaction', () => {
      if (isDestroyed) return;
      setCurrentTime(wavesurfer.getCurrentTime());
    });

    wavesurfer.on('error', (err: Error) => {
      if (isDestroyed) return;
      // Ignore AbortError en mode dev (React StrictMode)
      if (err.name === 'AbortError') {
        console.log('Waveform: Chargement annulé (normal en mode dev)');
        return;
      }
      console.error('Wavesurfer error:', err);
      setError(err.message || 'Erreur de chargement');
      onError?.(err);
    });

    // Load audio
    console.log('Waveform: Chargement de l\'audio...');
    wavesurfer.load(audioUrl).catch((err: Error) => {
      if (err?.name !== 'AbortError') {
        console.error('Wavesurfer load error:', err);
      }
    });

    // Cleanup
    return () => {
      isDestroyed = true;
      console.log('Waveform: Nettoyage');
      audioEngine.setPlayPauseCallback(null);
      // Destroy silencieusement sans propager les erreurs d'abort
      try {
        wavesurfer.destroy();
      } catch (err) {
        // Ignore expected WebAudio errors during cleanup (AbortError, InvalidAccessError)
        const name = err instanceof Error ? err.name : (err as DOMException)?.name ?? '';
        if (name !== 'AbortError' && name !== 'InvalidAccessError') {
          console.error('Error during wavesurfer cleanup:', err);
        }
      }
    };
  }, [audioUrl, height, setIsPlaying, setCurrentTime, setDuration, onReady, onError]);

  // Play/pause control - memoized
  const togglePlayPause = useCallback(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  }, []);

  return (
    <div className="waveform-container relative">
      <div
        ref={containerRef}
        className={`waveform-canvas overflow-hidden ${
          isBrainCity 
            ? 'rounded-[24px] border-4 border-braincity-border bg-[#FFF9EC]'
            : 'border border-forensics-cyan rounded-lg bg-forensics-bg-light'
        }`}
        onClick={togglePlayPause}
        style={{ cursor: isReady ? 'pointer' : 'default', minHeight: `${height}px` }}
      />
      {!isReady && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner size="md" color="border-forensics-cyan" label="Chargement waveform..." />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-red-500 font-mono text-sm">
            ❌ {error}
          </span>
        </div>
      )}
    </div>
  );
});

Waveform.displayName = 'Waveform';

export default Waveform;
