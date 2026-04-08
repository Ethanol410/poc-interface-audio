/**
 * AudioMeter Component - Real-time audio level meter (RMS + Peak)
 */

import { useEffect, useRef, useState, useCallback, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { audioEngine } from '@/services/audioEngine';

interface AudioMeterProps {
  isPlaying: boolean;
  height?: number;
  isBrainCity?: boolean;
}

const AudioMeter = memo(({ isPlaying, height = 200, isBrainCity = false }: AudioMeterProps) => {
  const [rmsLevel, setRmsLevel] = useState(0);
  const [peakLevel, setPeakLevel] = useState(0);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      // Decay to zero
      setRmsLevel((prev) => prev * 0.9);
      setPeakLevel((prev) => prev * 0.9);
      return;
    }

    const updateLevels = () => {
      const analysisData = audioEngine.getAnalysisData();
      if (analysisData) {
        setRmsLevel(analysisData.rms);
        setPeakLevel(analysisData.peakLevel);
      }
      animationFrameId.current = requestAnimationFrame(updateLevels);
    };

    updateLevels();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPlaying]);

  const rmsPercent = useMemo(() => Math.min(rmsLevel * 100, 100), [rmsLevel]);
  const peakPercent = useMemo(() => Math.min(peakLevel * 100, 100), [peakLevel]);

  const getMeterColor = useCallback((level: number) => {
    if (isBrainCity) {
      if (level > 90) return '#EF476F'; // coral
      if (level > 70) return '#FFD166'; // mustard
      return '#06D6A0'; // teal
    }
    if (level > 90) return '#ff3366'; // Red - clipping
    if (level > 70) return '#ff9933'; // Orange - hot
    if (level > 40) return '#00ff88'; // Green - optimal
    return '#00d4ff'; // Cyan - low
  }, [isBrainCity]);

  return (
    <div className="audio-meter flex gap-4">
      {/* RMS Meter */}
      <div className="flex-1">
        <div className="mb-2">
          <span className={isBrainCity ? "text-braincity-text text-sm font-fredoka font-bold uppercase" : "text-gray-400 text-xs font-mono uppercase"}>
            RMS Level
          </span>
        </div>
        <div
          className={isBrainCity ? "relative bg-[#FFF9EC] border-4 border-braincity-border rounded-[24px] overflow-hidden" : "relative bg-forensics-bg-light border border-forensics-cyan rounded-lg overflow-hidden"}
          style={{ height }}
        >
          <motion.div
            className="absolute bottom-0 w-full"
            style={{
              height: `${rmsPercent}%`,
              backgroundColor: getMeterColor(rmsPercent),
              boxShadow: `0 0 20px ${getMeterColor(rmsPercent)}80`,
            }}
            initial={{ height: 0 }}
            animate={{ height: `${rmsPercent}%` }}
            transition={{ duration: 0.1 }}
          />
          {/* Scale marks */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[100, 75, 50, 25, 0].map((mark) => (
              <div
                key={mark}
                className={`h-px relative ${isBrainCity ? 'bg-braincity-border/20' : 'bg-gray-700'}`}
              >
                <span className={isBrainCity ? "absolute left-2 -top-2 text-[10px] text-braincity-dim font-fredoka font-bold" : "absolute left-2 -top-2 text-xs text-gray-500 font-mono"}>
                  {mark}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2 text-center">
          <span className={isBrainCity ? "text-braincity-text font-fredoka text-sm font-bold" : "text-forensics-cyan font-mono text-sm font-bold"}>
            {rmsPercent.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Peak Meter */}
      <div className="flex-1">
        <div className="mb-2">
          <span className={isBrainCity ? "text-braincity-text text-sm font-fredoka font-bold uppercase" : "text-gray-400 text-xs font-mono uppercase"}>
            Peak Level
          </span>
        </div>
        <div
          className={isBrainCity ? "relative bg-[#FFF9EC] border-4 border-braincity-border rounded-[24px] overflow-hidden" : "relative bg-forensics-bg-light border border-forensics-cyan rounded-lg overflow-hidden"}
          style={{ height }}
        >
          <motion.div
            className="absolute bottom-0 w-full"
            style={{
              height: `${peakPercent}%`,
              backgroundColor: getMeterColor(peakPercent),
              boxShadow: `0 0 20px ${getMeterColor(peakPercent)}80`,
            }}
            initial={{ height: 0 }}
            animate={{ height: `${peakPercent}%` }}
            transition={{ duration: 0.05 }}
          />
          {/* Peak hold indicator */}
          {peakPercent > 5 && (
            <motion.div
              className="absolute w-full h-1"
              style={{
                bottom: `${peakPercent}%`,
                backgroundColor: '#ffffff',
                boxShadow: '0 0 10px #ffffff',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          )}
          {/* Scale marks */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[100, 75, 50, 25, 0].map((mark) => (
              <div key={mark} className={`h-px ${isBrainCity ? 'bg-braincity-border/20' : 'bg-gray-700'}`} />
            ))}
          </div>
        </div>
        <div className="mt-2 text-center">
          <span className={isBrainCity ? "text-braincity-text font-fredoka text-sm font-bold" : "text-forensics-cyan font-mono text-sm font-bold"}>
            {peakPercent.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Warning indicator */}
      {(rmsPercent > 90 || peakPercent > 95) && (
        <motion.div
          className="absolute top-0 right-0 px-3 py-1 bg-red-500 text-white font-mono text-xs rounded-bl-lg"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          ⚠ CLIPPING
        </motion.div>
      )}
    </div>
  );
});

AudioMeter.displayName = 'AudioMeter';

export default AudioMeter;
