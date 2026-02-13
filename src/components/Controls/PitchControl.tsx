/**
 * PitchControl Component - Pitch shifting controls and demodulation
 */

import { motion } from 'framer-motion';
import { useAudioStore } from '@/stores/audioStore';
import { audioEngine } from '@/services/audioEngine';
import { useState } from 'react';

const PitchControl = () => {
  const { pitchShift, setPitchShift } = useAudioStore();
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);

  const handlePitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const semitones = parseFloat(e.target.value);
    setPitchShift({ semitones, enabled: semitones !== 0 });
    audioEngine.applyPitchShift(semitones);
  };

  const resetPitch = () => {
    setPitchShift({ semitones: 0, enabled: false });
    audioEngine.applyPitchShift(0);
  };

  const handleAutoDetect = async () => {
    setIsAutoDetecting(true);
    // Simulate auto-detection (would use ML in real implementation)
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Suggest a pitch correction (example: -5 semitones)
    const suggested = -5;
    setPitchShift({ semitones: suggested, enabled: true });
    audioEngine.applyPitchShift(suggested);
    
    setIsAutoDetecting(false);
  };

  // Convert semitones to Hz (approximate, assuming base A4 = 440Hz)
  const semitonesToHz = (semitones: number) => {
    const ratio = Math.pow(2, semitones / 12);
    return Math.round(440 * ratio);
  };

  const pitchHz = semitonesToHz(pitchShift.semitones);
  const isShifted = pitchShift.semitones !== 0;

  return (
    <div className="pitch-control space-y-6">
      {/* Header with status */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-forensics-cyan font-mono">
          🎵 PITCH SHIFT / DEMODULATION
        </h4>
        {isShifted && (
          <motion.span
            className="px-2 py-1 bg-forensics-green/20 border border-forensics-green text-forensics-green font-mono text-xs rounded"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            ACTIF
          </motion.span>
        )}
      </div>

      {/* Auto-detect button */}
      <motion.button
        onClick={handleAutoDetect}
        disabled={isAutoDetecting}
        className="w-full px-4 py-3 bg-forensics-cyan/10 border-2 border-forensics-cyan text-forensics-cyan font-mono font-bold rounded hover:bg-forensics-cyan hover:text-forensics-bg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isAutoDetecting ? (
          <span className="flex items-center justify-center gap-2">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              ⚙
            </motion.span>
            ANALYSE EN COURS...
          </span>
        ) : (
          '🤖 AUTO-DETECT PITCH'
        )}
      </motion.button>

      {/* Manual pitch control */}
      <div className="space-y-3">
        <div className="text-center">
          <motion.div
            className="inline-block"
            key={pitchShift.semitones}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-4xl font-bold font-mono text-forensics-cyan">
              {pitchShift.semitones > 0 ? '+' : ''}
              {pitchShift.semitones}
            </span>
            <span className="text-lg text-gray-500 ml-2">ST</span>
          </motion.div>
          <div className="text-sm text-gray-500 font-mono mt-1">
            {pitchHz} Hz {pitchShift.cents > 0 ? `+${pitchShift.cents}` : pitchShift.cents} cents
          </div>
        </div>

        <input
          type="range"
          min="-12"
          max="12"
          step="1"
          value={pitchShift.semitones}
          onChange={handlePitchChange}
          className="w-full accent-forensics-cyan"
        />

        <div className="flex justify-between text-xs font-mono text-gray-500">
          <span>-12 ST</span>
          <span>0</span>
          <span>+12 ST</span>
        </div>
      </div>

      {/* Quick adjust buttons */}
      <div className="grid grid-cols-5 gap-2">
        {[-5, -3, -1].map((value) => (
          <motion.button
            key={value}
            onClick={() => {
              const newPitch = pitchShift.semitones + value;
              if (newPitch >= -12 && newPitch <= 12) {
                setPitchShift({ semitones: newPitch, enabled: newPitch !== 0 });
                audioEngine.applyPitchShift(newPitch);
              }
            }}
            className="px-2 py-1 bg-forensics-bg-light border border-forensics-cyan-dark text-forensics-cyan font-mono text-xs rounded hover:border-forensics-cyan transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {value}
          </motion.button>
        ))}
        <motion.button
          onClick={resetPitch}
          className="px-2 py-1 bg-forensics-bg-light border border-forensics-cyan-dark text-forensics-cyan font-mono text-xs rounded hover:border-forensics-cyan transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          0
        </motion.button>
        {[+1].map((value) => (
          <motion.button
            key={value}
            onClick={() => {
              const newPitch = pitchShift.semitones + value;
              if (newPitch >= -12 && newPitch <= 12) {
                setPitchShift({ semitones: newPitch, enabled: newPitch !== 0 });
                audioEngine.applyPitchShift(newPitch);
              }
            }}
            className="px-2 py-1 bg-forensics-bg-light border border-forensics-cyan-dark text-forensics-cyan font-mono text-xs rounded hover:border-forensics-cyan transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            +{value}
          </motion.button>
        ))}
      </div>

      {/* Info */}
      <div className="bg-orange-500/10 border border-orange-500 rounded p-3">
        <p className="text-xs text-orange-400 font-mono">
          ⚠️ Le Corbeau a probablement modifié sa voix. Ajustez le pitch pour la restaurer.
        </p>
      </div>
    </div>
  );
};

export default PitchControl;