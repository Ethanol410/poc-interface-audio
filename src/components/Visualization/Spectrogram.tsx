/**
 * Spectrogram Component - Frequency spectrum visualization over time
 */

import { useEffect, useRef, useState, useMemo, memo } from 'react';
import WaveSurfer from 'wavesurfer.js';
import SpectrogramPlugin from 'wavesurfer.js/dist/plugins/spectrogram';

interface SpectrogramProps {
  audioUrl?: string;
  height?: number;
  fftSize?: number;
  isBrainCity?: boolean;
}

const Spectrogram = memo(({
  audioUrl,
  height = 200,
  fftSize = 2048,
  isBrainCity = false,
}: SpectrogramProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize color map calculation (expensive)
  // Values must be floats 0-1 (r, g, b, a) per WaveSurfer SpectrogramPlugin spec
  const colorMap = useMemo(() => {
    const map: [number, number, number, number][] = [];
    for (let i = 0; i < 256; i++) {
      const value = i / 255;
      if (value < 0.25) {
        // Transparent dark blue (silent)
        map.push([10 / 255, 14 / 255, 39 / 255, value * 4]);
      } else if (value < 0.5) {
        // Blue to cyan
        const t = (value - 0.25) * 4;
        map.push([0, (100 + t * 112) / 255, (200 + t * 55) / 255, 1]);
      } else if (value < 0.75) {
        // Cyan to white
        const t = (value - 0.5) * 4;
        map.push([t, (212 + t * 43) / 255, 1, 1]);
      } else {
        // White (loud)
        map.push([1, 1, 1, 1]);
      }
    }
    return map;
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    if (!audioUrl) {
      setError('Aucun fichier audio');
      return;
    }

    setIsReady(false);
    setError(null);
    let isDestroyed = false;

    // In WaveSurfer v7, SpectrogramPlugin renders inside the same container as WaveSurfer.
    // We use height: 0 to hide the waveform and only show the spectrogram plugin.
    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'transparent',
      progressColor: 'transparent',
      height: 0,
      interact: false,
      plugins: [
        SpectrogramPlugin.create({
          labels: true,
          height,
          fftSamples: fftSize,
          colorMap,
        }),
      ],
    });

    wavesurferRef.current = wavesurfer;

    wavesurfer.on('ready', () => {
      if (isDestroyed) return;
      setIsReady(true);
    });

    wavesurfer.on('error', (err: Error) => {
      if (isDestroyed) return;
      if (err.name === 'AbortError') return;
      console.error('Spectrogram error:', err);
      setError(err.message || 'Erreur de chargement');
    });

    wavesurfer.load(audioUrl).catch((err: Error) => {
      if (err?.name !== 'AbortError') {
        console.error('Spectrogram load error:', err);
      }
    });

    return () => {
      isDestroyed = true;
      try {
        wavesurfer.destroy();
      } catch (err) {
        const name = err instanceof Error ? err.name : (err as DOMException)?.name ?? '';
        if (name !== 'AbortError' && name !== 'InvalidAccessError') {
          console.error('Error during spectrogram cleanup:', err);
        }
      }
    };
  }, [audioUrl, height, fftSize, colorMap]);

  const containerCls = isBrainCity
    ? 'rounded-xl overflow-hidden border border-sky-200 bg-[#0a0e27]'
    : 'rounded-lg overflow-hidden border border-forensics-cyan bg-forensics-bg-light';

  const overlayBase = isBrainCity
    ? 'absolute inset-0 flex items-center justify-center bg-[#0a0e27] border border-sky-200 rounded-xl'
    : 'absolute inset-0 flex items-center justify-center bg-forensics-bg-light border border-forensics-cyan rounded-lg';

  const loadingTextCls = isBrainCity
    ? 'text-sky-300 font-semibold text-sm animate-pulse'
    : 'text-forensics-cyan font-mono text-sm animate-pulse';

  return (
    <div className="spectrogram-container relative" style={{ minHeight: `${height}px` }}>
      <div
        ref={containerRef}
        className={containerCls}
        style={{ minHeight: `${height}px` }}
      />
      {!isReady && !error && (
        <div className={overlayBase}>
          <span className={loadingTextCls}>
            {isBrainCity ? '🔍 Analyse des sons en cours…' : 'Génération spectrogram...'}
          </span>
        </div>
      )}
      {error && (
        <div className={overlayBase}>
          <span className="text-red-500 font-mono text-sm">
            ❌ {error}
          </span>
        </div>
      )}
      {!isBrainCity && isReady && (
        <div className="mt-2 text-center">
          <span className="text-gray-500 text-xs font-mono">
            FFT: {fftSize} | Analyse fréquentielle temps réel
          </span>
        </div>
      )}
    </div>
  );
});

Spectrogram.displayName = 'Spectrogram';

export default Spectrogram;
