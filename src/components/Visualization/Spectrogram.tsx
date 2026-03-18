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
}

const Spectrogram = memo(({
  audioUrl,
  height = 256,
  fftSize = 2048,
}: SpectrogramProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const spectrogramRef = useRef<HTMLDivElement>(null);
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
  }, []); // Only calculate once

  useEffect(() => {
    if (!containerRef.current || !spectrogramRef.current) return;
    if (!audioUrl) {
      setError('Aucun fichier audio');
      return;
    }

    let isDestroyed = false;
    console.log('Spectrogram: Initialisation avec URL:', audioUrl);

    // Initialize Wavesurfer with spectrogram plugin
    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'transparent',
      progressColor: 'transparent',
      height: 0, // Hide waveform, only show spectrogram
      interact: false,
      plugins: [
        SpectrogramPlugin.create({
          container: spectrogramRef.current,
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
      console.log('Spectrogram: Prêt !');
      setIsReady(true);
    });

    wavesurfer.on('error', (err: Error) => {
      if (isDestroyed) return;
      // Ignore AbortError en mode dev (React StrictMode)
      if (err.name === 'AbortError') {
        console.log('Spectrogram: Chargement annulé (normal en mode dev)');
        return;
      }
      console.error('Spectrogram error:', err);
      setError(err.message || 'Erreur de chargement');
    });

    // Load audio
    console.log('Spectrogram: Chargement de l\'audio...');
    wavesurfer.load(audioUrl).catch((err: Error) => {
      if (err?.name !== 'AbortError') {
        console.error('Spectrogram load error:', err);
      }
    });

    // Cleanup
    return () => {
      isDestroyed = true;
      console.log('Spectrogram: Nettoyage');
      // Destroy silencieusement sans propager les erreurs d'abort
      try {
        wavesurfer.destroy();
      } catch (err) {
        // Ignore expected WebAudio errors during cleanup (AbortError, InvalidAccessError)
        const name = err instanceof Error ? err.name : (err as DOMException)?.name ?? '';
        if (name !== 'AbortError' && name !== 'InvalidAccessError') {
          console.error('Error during spectrogram cleanup:', err);
        }
      }
    };
  }, [audioUrl, height, fftSize, colorMap]);

  return (
    <div className="spectrogram-container relative">
      <div
        ref={containerRef}
        style={{ position: 'absolute', width: '100%', height: 0, overflow: 'hidden', visibility: 'hidden' }}
      />
      <div
        ref={spectrogramRef}
        className="spectrogram-canvas border border-forensics-cyan rounded-lg overflow-hidden bg-forensics-bg-light"
        style={{ minHeight: `${height}px` }}
      />
      {!isReady && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-forensics-bg-light border border-forensics-cyan rounded-lg">
          <span className="text-forensics-cyan font-mono text-sm animate-pulse">
            Génération spectrogram...
          </span>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-forensics-bg-light border border-forensics-cyan rounded-lg">
          <span className="text-red-500 font-mono text-sm">
            ❌ {error}
          </span>
        </div>
      )}
      <div className="mt-2 text-center">
        <span className="text-gray-500 text-xs font-mono">
          FFT: {fftSize} | Analyse fréquentielle temps réel
        </span>
      </div>
    </div>
  );
});

Spectrogram.displayName = 'Spectrogram';

export default Spectrogram;
