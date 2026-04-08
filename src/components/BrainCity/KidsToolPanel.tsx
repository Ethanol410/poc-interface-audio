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
  neonColor: string;
  onClick: () => void;
}

const ToolButton = ({ emoji, label, description, active, neonColor, onClick }: ToolButtonProps) => (
  <motion.button
    onClick={onClick}
    className="rounded-xl p-3 text-center w-full transition-colors"
    style={active ? {
      background: `${neonColor}18`,
      border: `2px solid #1a1a48`,
      boxShadow: `inset 0 0 8px ${neonColor}12`,
    } : {
      background: '#0a0a22',
      border: '2px dashed #1a1a48',
    }}
    whileHover={{ scale: 1.04 }}
    whileTap={{ scale: 0.94 }}
  >
    <div className="text-2xl mb-1.5">{emoji}</div>
    <div
      className="font-bangers text-sm tracking-wide"
      style={{ color: active ? neonColor : '#44447a' }}
    >
      {label}
    </div>
    <div
      className="text-[10px] mt-0.5 leading-tight"
      style={{ color: active ? '#c8c8ff' : '#2a2a5a' }}
    >
      {description}
    </div>
  </motion.button>
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

  const handleLowPass = () => updateLowPassFilter({ enabled: !lowPassFilter.enabled });
  const handleHighPass = () => updateHighPassFilter({ enabled: !highPassFilter.enabled });

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
      <div className="grid grid-cols-2 gap-2.5">
        <ToolButton
          emoji="🔊"
          label="GRAVES"
          description="Filtre les bruits forts"
          active={lowPassFilter.enabled}
          neonColor="#00e5ff"
          onClick={handleLowPass}
        />
        <ToolButton
          emoji="🎵"
          label="AIGUS"
          description="Nettoie les sifflements"
          active={highPassFilter.enabled}
          neonColor="#3dff85"
          onClick={handleHighPass}
        />
        <ToolButton
          emoji="⚡"
          label="NETTOYER"
          description="Enlève le buzz électrique"
          active={notchFilter.enabled}
          neonColor="#f0e500"
          onClick={handleNotch}
        />
        <ToolButton
          emoji="🔎"
          label="AMPLIFIER"
          description="Rends la voix plus forte"
          active={compressor.enabled}
          neonColor="#a855f7"
          onClick={handleCompressor}
        />
      </div>

      {/* Advanced toggle */}
      <motion.button
        onClick={() => setShowAdvanced((v) => !v)}
        className="w-full text-xs py-1.5 rounded-lg transition-colors font-nunito font-bold"
        style={{ color: '#44447a', border: '1px dashed #1a1a48' }}
        whileHover={{ color: '#7070b0' }}
      >
        ⚙️ Options avancées {showAdvanced ? '▲' : '▼'}
      </motion.button>

      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
          >
            {/* Band-pass */}
            <motion.button
              onClick={handleBandPass}
              className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold font-nunito transition-all"
              style={bandPassFilter.enabled ? {
                background: 'rgba(255,63,164,0.12)',
                border: '1px solid #1a1a48',
                color: '#ff3fa4',
              } : {
                background: '#0a0a22',
                border: '1px dashed #1a1a48',
                color: '#44447a',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              🎤 Changer la voix {bandPassFilter.enabled && <span className="ml-1">(activé)</span>}
            </motion.button>

            {/* Pitch */}
            <div>
              <div className="text-xs mb-2 font-nunito font-bold" style={{ color: '#7070aa' }}>
                🎭 Tonalité
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="1"
                value={pitchShift.semitones}
                onChange={handlePitch}
                className="w-full"
                style={{ accentColor: '#00e5ff' }}
              />
              <div className="text-center text-xs mt-1 font-mono" style={{ color: '#5a5a9a' }}>
                {pitchShift.semitones > 0 ? `+${pitchShift.semitones}` : pitchShift.semitones} demi-tons
              </div>
            </div>

            {/* Speed */}
            <div>
              <div className="text-xs mb-2 font-nunito font-bold" style={{ color: '#7070aa' }}>
                ⏩ Vitesse
              </div>
              <input
                type="range"
                min="0.25"
                max="2"
                step="0.25"
                value={playbackSpeed}
                onChange={handleSpeed}
                className="w-full"
                style={{ accentColor: '#3dff85' }}
              />
              <div className="text-center text-xs mt-1 font-mono" style={{ color: '#5a5a9a' }}>
                {playbackSpeed}×
              </div>
            </div>

            {/* Reverse */}
            <motion.button
              onClick={handleReverse}
              className="w-full px-3 py-2.5 rounded-lg text-xs font-bold font-nunito transition-all"
              style={isReversed ? {
                background: 'rgba(255,119,48,0.12)',
                border: '1px solid #1a1a48',
                color: '#ff7730',
              } : {
                background: '#0a0a22',
                border: '1px dashed #1a1a48',
                color: '#44447a',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              🔄 Inverser le son {isReversed && <span className="ml-1">(activé)</span>}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KidsToolPanel;
