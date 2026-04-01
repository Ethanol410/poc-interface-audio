import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioStore } from '@/stores/audioStore';
import { audioEngine } from '@/services/audioEngine';
import { useFilterControls } from '@/hooks/useFilterControls';

interface ToolButtonProps {
  emoji: string;
  label: string;
  description: string;
  active: boolean;
  color: string;
  activeBg: string;
  onClick: () => void;
}

const ToolButton = ({ emoji, label, description, active, color, activeBg, onClick }: ToolButtonProps) => (
  <button
    onClick={onClick}
    className={`rounded-xl p-3 text-center transition-all border-2 ${
      active
        ? `${activeBg} border-current shadow-md`
        : 'bg-white border-dashed border-gray-200 hover:border-gray-300'
    }`}
  >
    <div className="text-2xl mb-1">{emoji}</div>
    <div className={`text-xs font-bold ${active ? color : 'text-gray-700'}`}>{label}</div>
    <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">{description}</div>
  </button>
);

const KidsToolPanel = () => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    isReversed, toggleReverse,
    notchFilter, setNotchFilter,
    compressor, setCompressor,
    bandPassFilter, setBandPassFilter,
    playbackSpeed, setPlaybackSpeed,
    pitchShift, setPitchShift,
  } = useAudioStore();

  const { lowPassFilter, highPassFilter, updateLowPassFilter, updateHighPassFilter } = useFilterControls();

  const handleLowPass = () => {
    updateLowPassFilter({ enabled: !lowPassFilter.enabled });
  };

  const handleHighPass = () => {
    updateHighPassFilter({ enabled: !highPassFilter.enabled });
  };

  const handleNotch = () => {
    const next = { ...notchFilter, enabled: !notchFilter.enabled };
    setNotchFilter({ enabled: next.enabled });
    audioEngine.applyNotchFilter(next);
  };

  const handleCompressor = () => {
    const next = { ...compressor, enabled: !compressor.enabled };
    setCompressor({ enabled: next.enabled });
    audioEngine.applyCompressor(next);
  };

  const handleBandPass = () => {
    const next = { ...bandPassFilter, enabled: !bandPassFilter.enabled };
    setBandPassFilter({ enabled: next.enabled });
    audioEngine.applyBandPassFilter(next);
  };

  const handleSpeed = (e: React.ChangeEvent<HTMLInputElement>) => {
    const speed = parseFloat(e.target.value);
    setPlaybackSpeed(speed);
    audioEngine.setPlaybackSpeed(speed);
  };

  const handlePitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const semitones = parseFloat(e.target.value);
    setPitchShift({ semitones, enabled: semitones !== 0 });
  };

  const handleReverse = () => {
    toggleReverse();
    audioEngine.setReverse(!isReversed);
  };

  return (
    <div className="space-y-4">
      <div className="text-xs font-bold text-braincity-primary mb-2">🔧 Tes outils de détective</div>

      <div className="grid grid-cols-2 gap-3">
        <ToolButton
          emoji="🔊"
          label="Sons graves"
          description="Filtre les bruits forts"
          active={lowPassFilter.enabled}
          color="text-braincity-primary"
          activeBg="bg-sky-50"
          onClick={handleLowPass}
        />
        <ToolButton
          emoji="🎵"
          label="Sons aigus"
          description="Nettoie les sifflements"
          active={highPassFilter.enabled}
          color="text-braincity-success"
          activeBg="bg-green-50"
          onClick={handleHighPass}
        />
        <ToolButton
          emoji="⚡"
          label="Nettoyer"
          description="Enlève le buzz électrique"
          active={notchFilter.enabled}
          color="text-braincity-warning"
          activeBg="bg-yellow-50"
          onClick={handleNotch}
        />
        <ToolButton
          emoji="🔎"
          label="Amplifier"
          description="Rends la voix plus forte"
          active={compressor.enabled}
          color="text-braincity-violet"
          activeBg="bg-purple-50"
          onClick={handleCompressor}
        />
      </div>

      {/* Advanced toggle */}
      <button
        onClick={() => setShowAdvanced((v) => !v)}
        className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
      >
        <span>⚙️ Options avancées</span> {showAdvanced ? '▲' : '▼'}
      </button>

      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
          >
            {/* Band-pass */}
            <div>
              <button
                onClick={handleBandPass}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                  bandPassFilter.enabled
                    ? 'bg-pink-50 border-pink-300 text-braincity-pink'
                    : 'bg-white border-gray-200 text-gray-500'
                }`}
              >
                🎤 <span>Changer la voix</span> {bandPassFilter.enabled ? '(activé)' : ''}
              </button>
            </div>

            {/* Pitch */}
            <div>
              <div className="text-xs text-gray-500 mb-1 font-semibold">🎭 Changer la tonalité</div>
              <input
                type="range"
                min="-12"
                max="12"
                step="1"
                value={pitchShift.semitones}
                onChange={handlePitch}
                className="w-full accent-braincity-primary"
              />
              <div className="text-center text-xs text-gray-400">
                {pitchShift.semitones > 0 ? `+${pitchShift.semitones}` : pitchShift.semitones} demi-tons
              </div>
            </div>

            {/* Speed */}
            <div>
              <div className="text-xs text-gray-500 mb-1 font-semibold">⏩ Vitesse</div>
              <input
                type="range"
                min="0.25"
                max="2"
                step="0.25"
                value={playbackSpeed}
                onChange={handleSpeed}
                className="w-full accent-braincity-primary"
              />
              <div className="text-center text-xs text-gray-400">{playbackSpeed}×</div>
            </div>

            {/* Reverse */}
            <button
              onClick={handleReverse}
              className={`w-full px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                isReversed
                  ? 'bg-orange-50 border-orange-300 text-braincity-accent'
                  : 'bg-white border-gray-200 text-gray-500'
              }`}
            >
              🔄 Inverser le son {isReversed ? '(activé)' : ''}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KidsToolPanel;
