/**
 * Waveform Component - Audio waveform visualization with Wavesurfer.js
 */

import { useEffect, useRef, useState, useCallback, memo } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { useAudioStore } from '@/stores/audioStore';

interface WaveformProps {
  audioUrl?: string;
  height?: number;
  onReady?: () => void;
  onError?: (error: Error) => void;
}

const Waveform = memo(({
  audioUrl,
  height = 128,
  onReady,
  onError,
}: WaveformProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  const { setIsPlaying, setCurrentTime, setDuration } = useAudioStore();

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Wavesurfer
    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'rgba(0, 212, 255, 0.3)',
      progressColor: 'rgba(0, 212, 255, 1)',
      cursorColor: '#00ff88',
      cursorWidth: 2,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height,
      normalize: true,
      backend: 'WebAudio',
      interact: true,
    });

    wavesurferRef.current = wavesurfer;

    // Event listeners
    wavesurfer.on('ready', () => {
      setIsReady(true);
      setDuration(wavesurfer.getDuration());
      onReady?.();
    });

    wavesurfer.on('play', () => {
      setIsPlaying(true);
    });

    wavesurfer.on('pause', () => {
      setIsPlaying(false);
    });

    wavesurfer.on('audioprocess', () => {
      setCurrentTime(wavesurfer.getCurrentTime());
    });

    wavesurfer.on('interaction', () => {
      setCurrentTime(wavesurfer.getCurrentTime());
    });

    wavesurfer.on('error', (error: Error) => {
      console.error('Wavesurfer error:', error);
      onError?.(error);
    });

    // Load audio if URL provided
    if (audioUrl) {
      wavesurfer.load(audioUrl);
    }

    // Cleanup
    return () => {
      wavesurfer.destroy();
    };
  }, [audioUrl, height, setIsPlaying, setCurrentTime, setDuration, onReady, onError]);

  // Play/pause control - memoized
  const togglePlayPause = useCallback(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  }, []);

  return (
    <div className="waveform-container">
      <div
        ref={containerRef}
        className="waveform-canvas border border-forensics-cyan rounded-lg overflow-hidden bg-forensics-bg-light"
        onClick={togglePlayPause}
        style={{ cursor: isReady ? 'pointer' : 'default' }}
      />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-forensics-cyan font-mono text-sm animate-pulse">
            Chargement waveform...
          </span>
        </div>
      )}
    </div>
  );
});

Waveform.displayName = 'Waveform';

export default Waveform;
