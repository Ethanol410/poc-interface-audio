/**
 * FrequencyBars Component - Real-time frequency visualization (equalizer style)
 */

import { useEffect, useRef, useState, memo } from 'react';
import { audioEngine } from '@/services/audioEngine';

interface FrequencyBarsProps {
  width?: number;
  height?: number;
  barCount?: number;
  isPlaying: boolean;
}

const FrequencyBars = memo(({
  width = 800,
  height = 200,
  barCount = 64,
  isPlaying,
}: FrequencyBarsProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSupported, setIsSupported] = useState(true);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsSupported(false);
      return;
    }

    // Set canvas resolution
    canvas.width = width;
    canvas.height = height;

    // Decay values for smooth animation
    const decayValues = new Float32Array(barCount);

    const draw = () => {
      if (!isPlaying) {
        // Decay animation when paused
        ctx.fillStyle = 'rgba(10, 14, 39, 0.3)';
        ctx.fillRect(0, 0, width, height);

        for (let i = 0; i < barCount; i++) {
          decayValues[i] *= 0.95; // Decay
          if (decayValues[i] < 0.01) decayValues[i] = 0;
        }
      } else {
        // Clear canvas
        ctx.fillStyle = '#0a0e27';
        ctx.fillRect(0, 0, width, height);

        // Get analysis data
        const analysisData = audioEngine.getAnalysisData();
        if (analysisData) {
          const { frequencyData } = analysisData;
          const barWidth = width / barCount;
          const step = Math.floor(frequencyData.length / barCount);

          for (let i = 0; i < barCount; i++) {
            // Get frequency value
            const index = i * step;
            const value = frequencyData[index] / 255;

            // Apply decay for smooth animation
            decayValues[i] = Math.max(value, decayValues[i] * 0.85);

            const barHeight = decayValues[i] * height;
            const x = i * barWidth;
            const y = height - barHeight;

            // Create gradient for bar
            const gradient = ctx.createLinearGradient(x, y, x, height);
            
            if (decayValues[i] > 0.8) {
              // High intensity - cyan to white
              gradient.addColorStop(0, '#ffffff');
              gradient.addColorStop(0.5, '#00d4ff');
              gradient.addColorStop(1, '#0099cc');
            } else if (decayValues[i] > 0.5) {
              // Medium intensity - cyan
              gradient.addColorStop(0, '#00d4ff');
              gradient.addColorStop(1, '#0099cc');
            } else {
              // Low intensity - dark cyan
              gradient.addColorStop(0, '#0099cc');
              gradient.addColorStop(1, '#006688');
            }

            ctx.fillStyle = gradient;
            ctx.fillRect(
              x + 1,
              y,
              barWidth - 2,
              barHeight
            );

            // Add glow effect for high bars
            if (decayValues[i] > 0.7) {
              ctx.shadowBlur = 10;
              ctx.shadowColor = '#00d4ff';
            } else {
              ctx.shadowBlur = 0;
            }
          }
        }
      }

      // Draw grid lines (frequency markers)
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const y = (height / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      animationFrameId.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [width, height, barCount, isPlaying]);

  if (!isSupported) {
    return (
      <div
        className="flex items-center justify-center border border-forensics-cyan rounded-lg bg-forensics-bg-light"
        style={{ width, height }}
      >
        <span className="text-gray-500 font-mono text-sm">
          Canvas non supporté
        </span>
      </div>
    );
  }

  return (
    <div className="frequency-bars-container">
      <canvas
        ref={canvasRef}
        className="border border-forensics-cyan rounded-lg bg-forensics-bg-light"
        style={{ width: '100%', height: 'auto', maxWidth: width }}
      />
      <div className="mt-2 flex justify-between text-gray-500 text-xs font-mono px-2">
        <span>Basses</span>
        <span>Fréquences</span>
        <span>Aigus</span>
      </div>
    </div>
  );
});

FrequencyBars.displayName = 'FrequencyBars';

export default FrequencyBars;
