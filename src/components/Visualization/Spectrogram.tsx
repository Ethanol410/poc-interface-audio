/**
 * Spectrogram Component - Frequency spectrum visualization over time
 */

import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import SpectrogramPlugin from 'wavesurfer.js/dist/plugins/spectrogram';

interface SpectrogramProps {
  audioUrl?: string;
  height?: number;
  fftSize?: number;
}

const Spectrogram = ({
  audioUrl,
  height = 256,
  fftSize = 2048,
}: SpectrogramProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const spectrogramRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !spectrogramRef.current) return;

    // Create color map for spectrogram
    const colorMap: [number, number, number, number][] = [];
    for (let i = 0; i < 256; i++) {
      const value = i / 255;
      if (value < 0.25) {
        // Dark blue to blue
        colorMap.push([10, 14, 39, value * 4]);
      } else if (value < 0.5) {
        // Blue to cyan
        const t = (value - 0.25) * 4;
        colorMap.push([0, 100 + t * 112, 200 + t * 55, 1]);
      } else if (value < 0.75) {
        // Cyan to white
        const t = (value - 0.5) * 4;
        colorMap.push([
          t * 255,
          212 + t * 43,
          255,
          1,
        ]);
      } else {
        // White
        colorMap.push([255, 255, 255, 1]);
      }
    }

    // Initialize Wavesurfer with spectrogram plugin
    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'transparent',
      progressColor: 'transparent',
      height: 0, // Hide waveform, only show spectrogram
      backend: 'WebAudio',
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
      setIsReady(true);
    });

    wavesurfer.on('error', (error: Error) => {
      console.error('Spectrogram error:', error);
    });

    // Load audio if URL provided
    if (audioUrl) {
      wavesurfer.load(audioUrl);
    }

    // Cleanup
    return () => {
      wavesurfer.destroy();
    };
  }, [audioUrl, height, fftSize]);

  return (
    <div className="spectrogram-container relative">
      <div
        ref={containerRef}
        className="hidden" // Hide waveform container
      />
      <div
        ref={spectrogramRef}
        className="spectrogram-canvas border border-forensics-cyan rounded-lg overflow-hidden bg-forensics-bg-light"
      />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-forensics-bg-light border border-forensics-cyan rounded-lg">
          <span className="text-forensics-cyan font-mono text-sm animate-pulse">
            Génération spectrogram...
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
};

export default Spectrogram;
