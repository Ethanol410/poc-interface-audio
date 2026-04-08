import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioStore } from '@/stores/audioStore';
import { audioEngine } from '@/services/audioEngine';
import { useFilterControls } from '@/hooks/useFilterControls';

interface ToolButtonProps {
  emoji: string;
  label: string;
  description: string;
  active: boolean;
  activeColor: string; // Tailwind bg color class
  onClick: () => void;
}

const ToolButton = ({ emoji, label, description, active, activeColor, onClick }: ToolButtonProps) => (
  <motion.button
    onClick={onClick}
    className={`rounded-[24px] p-3 text-center w-full transition-all border-4 border-braincity-border flex flex-col items-center justify-center relative overflow-hidden`}
    style={
      active
        ? {
            boxShadow: `0 4px 0 0 #073B4C`,
            transform: 'translateY(2px)',
          }
        : {
            boxShadow: `0 8px 0 0 #073B4C`,
            backgroundColor: '#ffffff',
          }
    }
    whileHover={!active ? { translateY: -2, boxShadow: `0 10px 0 0 #073B4C` } : {}}
    whileTap={{ translateY: 6, boxShadow: `0 2px 0 0 #073B4C` }}
  >
    {/* Active Background Fill Layer */}
    <AnimatePresence>
      {active && (
        <motion.div
          layoutId={`fill-${label}`}
          className={`absolute inset-0 ${activeColor} opacity-20`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          exit={{ opacity: 0 }}
        />
      )}
    </AnimatePresence>

    <div className={`text-3xl mb-1.5 transition-transform ${active ? 'scale-110' : ''}`}>{emoji}</div>
    <div
      className="font-bangers text-lg tracking-wide leading-none z-10"
      style={{ color: '#073B4C' }}
    >
      {label}
    </div>
    <div
      className="text-[11px] mt-1 font-fredoka font-semibold z-10"
      style={{ color: '#4b5563' }}
    >
      {description}
    </div>
  </motion.button>
);

const KidsToolPanel = () => {
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
    <div className="space-y-6">
      {/* Action Buttons Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-6">
        <ToolButton
          emoji="🐘"
          label="L'ÉLÉPHANT"
          description="Filtre les bruits forts"
          active={lowPassFilter.enabled}
          activeColor="bg-braincity-blue"
          onClick={handleLowPass}
        />
        <ToolButton
          emoji="🐝"
          label="L'ABEILLE"
          description="Nettoie les sifflements"
          active={highPassFilter.enabled}
          activeColor="bg-braincity-mustard"
          onClick={handleHighPass}
        />
        <ToolButton
          emoji="🧹"
          label="BALAI MAGIQUE"
          description="Enlève le bourdonnement"
          active={notchFilter.enabled}
          activeColor="bg-braincity-teal"
          onClick={handleNotch}
        />
        <ToolButton
          emoji="🔎"
          label="GROSSE LOUPE"
          description="Amplifie les bruits"
          active={compressor.enabled}
          activeColor="bg-braincity-coral"
          onClick={handleCompressor}
        />
        <ToolButton
          emoji="🤖"
          label="FILTRE ROBOT"
          description="Change la voix"
          active={bandPassFilter.enabled}
          activeColor="bg-braincity-violet"
          onClick={handleBandPass}
        />
        <ToolButton
          emoji="🔄"
          label="TOURNE-DISQUE"
          description="Joue à l'envers"
          active={isReversed}
          activeColor="bg-braincity-pink"
          onClick={handleReverse}
        />
      </div>

      {/* Sliders Container */}
      <div className="bg-white border-4 border-braincity-border rounded-[24px] p-4 space-y-5" style={{ boxShadow: '0 6px 0 0 #073B4C' }}>
        
        {/* Pitch Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="font-bangers tracking-wide text-lg text-braincity-text flex items-center gap-2">
              🎈 BALLON HÉLIUM
            </div>
            <div className="text-sm font-fredoka font-bold text-braincity-dim bg-gray-100 px-2 rounded-full border-2 border-gray-200">
              {pitchShift.semitones > 0 ? `+${pitchShift.semitones}` : pitchShift.semitones} crans
            </div>
          </div>
          <input
            type="range"
            min="-12"
            max="12"
            step="1"
            value={pitchShift.semitones}
            onChange={handlePitch}
            className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer"
            style={{ accentColor: '#FFD166' }} // mustard
          />
        </div>

        {/* Speed Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="font-bangers tracking-wide text-lg text-braincity-text flex items-center gap-2">
              🐢 MODE TORTUE
            </div>
            <div className="text-sm font-fredoka font-bold text-braincity-dim bg-gray-100 px-2 rounded-full border-2 border-gray-200">
              {playbackSpeed}×
            </div>
          </div>
          <input
            type="range"
            min="0.25"
            max="2"
            step="0.25"
            value={playbackSpeed}
            onChange={handleSpeed}
            className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer"
            style={{ accentColor: '#06D6A0' }} // teal
          />
        </div>

      </div>
    </div>
  );
};

export default KidsToolPanel;
