/**
 * PitchControl Component - Pitch shifting controls
 */

import { motion } from 'framer-motion';
import { useAudioStore } from '@/stores/audioStore';
import { audioEngine } from '@/services/audioEngine';

const QUICK_ADJUST = [-5, -3, -1, 0, +1, +3, +5];

const PitchControl = () => {
  const { pitchShift, setPitchShift } = useAudioStore();

  const handlePitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const semitones = parseFloat(e.target.value);
    setPitchShift({ semitones, enabled: semitones !== 0 });
    audioEngine.applyPitchShift(semitones);
  };

  const resetPitch = () => {
    setPitchShift({ semitones: 0, enabled: false });
    audioEngine.applyPitchShift(0);
  };

  const applyAbsolute = (semitones: number) => {
    if (semitones === 0) {
      resetPitch();
      return;
    }
    setPitchShift({ semitones, enabled: true });
    audioEngine.applyPitchShift(semitones);
  };

  const applyRelative = (delta: number) => {
    const next = Math.max(-12, Math.min(12, pitchShift.semitones + delta));
    setPitchShift({ semitones: next, enabled: next !== 0 });
    audioEngine.applyPitchShift(next);
  };

  // Convert semitones to Hz (approximate, assuming A4 = 440 Hz)
  const pitchHz = Math.round(440 * Math.pow(2, pitchShift.semitones / 12));
  const isShifted = pitchShift.semitones !== 0;

  return (
    <div className="pitch-control space-y-6">
      {/* Header with status */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-forensics-cyan font-mono">
          🎵 PITCH SHIFT / DÉMODULATION
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

      {/* Current value display */}
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
            {pitchHz} Hz
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

      {/* Quick set buttons */}
      <div>
        <p className="text-xs font-mono text-gray-500 mb-2">VALEUR ABSOLUE</p>
        <div className="grid grid-cols-7 gap-1">
          {QUICK_ADJUST.map((value) => (
            <motion.button
              key={value}
              onClick={() => applyAbsolute(value)}
              className={`px-1 py-1.5 font-mono text-xs rounded transition-all border ${
                pitchShift.semitones === value
                  ? 'bg-forensics-cyan/20 border-forensics-cyan text-forensics-cyan font-bold'
                  : 'bg-forensics-bg-light border-forensics-cyan-dark text-forensics-cyan hover:border-forensics-cyan'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {value > 0 ? `+${value}` : value}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Relative adjust buttons */}
      <div>
        <p className="text-xs font-mono text-gray-500 mb-2">AJUSTEMENT RELATIF</p>
        <div className="grid grid-cols-4 gap-1">
          {[-3, -1, +1, +3].map((delta) => (
            <motion.button
              key={delta}
              onClick={() => applyRelative(delta)}
              className="px-1 py-1.5 bg-forensics-bg-light border border-forensics-cyan-dark text-gray-400 font-mono text-xs rounded hover:border-forensics-cyan hover:text-forensics-cyan transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {delta > 0 ? `+${delta}` : delta}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="bg-orange-500/10 border border-orange-500 rounded p-3">
        <p className="text-xs text-orange-400 font-mono">
          ⚠️ La voix a probablement été modifiée. Ajustez le pitch pour la restaurer. Indice : essayez entre -8 et -2 ST.
        </p>
      </div>
    </div>
  );
};

export default PitchControl;
