/**
 * FrequencyBars Component - Real-time frequency visualization (equalizer style)
 */

import { useEffect, useRef, useState, memo } from 'react';
import { audioEngine } from '@/services/audioEngine';

interface FrequencyBarsProps {
  height?: number;
  barCount?: number;
  isPlaying: boolean;
}

const FrequencyBars = memo(({
  height = 200,
  barCount = 64,
  isPlaying,
}: FrequencyBarsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSupported, setIsSupported] = useState(true);
  const animationFrameId = useRef<number | null>(null);
  const isPlayingRef = useRef(isPlaying);

  // Keep ref in sync so draw loop always sees latest value without restart
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Resize canvas to match container width
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const updateSize = () => {
      canvas.width = container.offsetWidth;
      canvas.height = height;
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(container);
    return () => ro.disconnect();
  }, [height]);

  // Draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsSupported(false);
      return;
    }

    const decayValues = new Float32Array(barCount);

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;

      if (!isPlayingRef.current) {
        ctx.fillStyle = 'rgba(10, 14, 39, 0.3)';
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < barCount; i++) {
          decayValues[i] *= 0.95;
          if (decayValues[i] < 0.01) decayValues[i] = 0;
        }
      } else {
        ctx.fillStyle = '#0a0e27';
        ctx.fillRect(0, 0, w, h);

        const analysisData = audioEngine.getAnalysisData();
        if (analysisData) {
          const { frequencyData } = analysisData;
          const barWidth = w / barCount;
          const step = Math.floor(frequencyData.length / barCount);

          for (let i = 0; i < barCount; i++) {
            const value = frequencyData[i * step] / 255;
            decayValues[i] = Math.max(value, decayValues[i] * 0.85);

            const barHeight = decayValues[i] * h;
            const x = i * barWidth;
            const y = h - barHeight;

            const gradient = ctx.createLinearGradient(x, y, x, h);
            if (decayValues[i] > 0.8) {
              gradient.addColorStop(0, '#ffffff');
              gradient.addColorStop(0.5, '#00d4ff');
              gradient.addColorStop(1, '#0099cc');
            } else if (decayValues[i] > 0.5) {
              gradient.addColorStop(0, '#00d4ff');
              gradient.addColorStop(1, '#0099cc');
            } else {
              gradient.addColorStop(0, '#0099cc');
              gradient.addColorStop(1, '#006688');
            }

            ctx.shadowBlur = decayValues[i] > 0.7 ? 10 : 0;
            ctx.shadowColor = '#00d4ff';
            ctx.fillStyle = gradient;
            ctx.fillRect(x + 1, y, barWidth - 2, barHeight);
          }
          ctx.shadowBlur = 0;
        }
      }

      // Grid lines
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const y = (h / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
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
  }, [barCount]);

  if (!isSupported) {
    return (
      <div
        className="flex items-center justify-center border border-forensics-cyan rounded-lg bg-forensics-bg-light"
        style={{ height }}
      >
        <span className="text-gray-500 font-mono text-sm">Canvas non supporté</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="frequency-bars-container w-full">
      <canvas
        ref={canvasRef}
        className="block w-full border border-forensics-cyan rounded-lg bg-forensics-bg-light"
        style={{ height }}
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
