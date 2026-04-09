/**
 * FilterPanel – redesigned as an investigation toolbox.
 * Each filter is a card: click to toggle, expands a single slider when active.
 * No Q parameters exposed (too technical for the target audience).
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useFilterControls } from '@/hooks/useFilterControls';
import { useAudioStore } from '@/stores/audioStore';
import { audioEngine } from '@/services/audioEngine';

// ─── Filter Card ──────────────────────────────────────────────────────────────

interface FilterCardProps {
  icon: string;
  label: string;
  hint: string;          // shown when inactive
  activeHint: string;    // shown when active (e.g. current value)
  active: boolean;
  accentHex: string;
  onToggle: () => void;
  children?: React.ReactNode;
}

const FilterCard = ({
  icon, label, hint, activeHint, active, accentHex, onToggle, children,
}: FilterCardProps) => (
  <motion.div
    layout
    className="rounded-lg border overflow-hidden"
    style={{
      borderColor: active ? accentHex : '#1e3040',
      backgroundColor: active ? `${accentHex}0f` : '#0a1822',
      boxShadow: active ? `inset 0 0 0 1px ${accentHex}30` : 'none',
    }}
    transition={{ layout: { duration: 0.18 } }}
  >
    {/* ── Row: always visible ── */}
    <button
      className="w-full flex items-center gap-3 px-3 py-2.5 text-left"
      onClick={onToggle}
      type="button"
    >
      {/* Icon */}
      <span className="text-xl w-7 flex-shrink-0 text-center select-none">{icon}</span>

      {/* Label + hint */}
      <div className="flex-1 min-w-0">
        <div
          className="text-[11px] font-mono font-bold tracking-wider uppercase leading-none"
          style={{ color: active ? accentHex : '#5a7a8a' }}
        >
          {label}
        </div>
        <div
          className="text-[10px] mt-0.5 leading-snug"
          style={{ color: active ? '#a0bfcc' : '#374f5e' }}
        >
          {active ? activeHint : hint}
        </div>
      </div>

      {/* Toggle pill */}
      <div
        className="flex-shrink-0 relative w-9 h-5 rounded-full transition-colors duration-200"
        style={{ backgroundColor: active ? accentHex : '#1a2f3e' }}
        aria-label={active ? 'actif' : 'inactif'}
      >
        <motion.span
          className="absolute top-[3px] w-3.5 h-3.5 rounded-full bg-white shadow"
          animate={{ left: active ? '18px' : '3px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
    </button>

    {/* ── Expandable slider ── */}
    <AnimatePresence initial={false}>
      {active && children && (
        <motion.div
          key="slider"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="overflow-hidden"
        >
          <div className="px-4 pb-3 pt-0.5">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

// ─── Slim range input ─────────────────────────────────────────────────────────

interface SlimRangeProps {
  min: number;
  max: number;
  step: number;
  value: number;
  accentHex: string;
  leftLabel: string;
  rightLabel: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SlimRange = ({ min, max, step, value, accentHex, leftLabel, rightLabel, onChange }: SlimRangeProps) => (
  <>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
      style={{ accentColor: accentHex }}
    />
    <div className="flex justify-between text-[9px] font-mono mt-0.5" style={{ color: '#3d5a6a' }}>
      <span>{leftLabel}</span>
      <span>{rightLabel}</span>
    </div>
  </>
);

// ─── Main component ───────────────────────────────────────────────────────────

const FilterPanel = () => {
  const { lowPassFilter, highPassFilter, updateLowPassFilter, updateHighPassFilter, applyPreset } =
    useFilterControls();

  const {
    isReversed, toggleReverse,
    bandPassFilter, setBandPassFilter,
    notchFilter, setNotchFilter,
    compressor, setCompressor,
    pitchShift, setPitchShift,
    volume, setVolume,
  } = useAudioStore();

  // ── handlers ──────────────────────────────────────────────────────────────

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    audioEngine.setVolume(vol);
  };

  const handleLowPassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateLowPassFilter({ frequency: parseFloat(e.target.value), enabled: true });
  };

  const handleHighPassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateHighPassFilter({ frequency: parseFloat(e.target.value), enabled: true });
  };

  const handleBandPassToggle = () => {
    const next = { ...bandPassFilter, enabled: !bandPassFilter.enabled };
    setBandPassFilter({ enabled: next.enabled });
    audioEngine.applyBandPassFilter(next);
  };

  const handleBandPassFreqChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const frequency = parseFloat(e.target.value);
    setBandPassFilter({ frequency, enabled: true });
    audioEngine.applyBandPassFilter({ ...bandPassFilter, frequency, enabled: true });
  };

  const handleNotchToggle = () => {
    const next = { ...notchFilter, enabled: !notchFilter.enabled };
    setNotchFilter({ enabled: next.enabled });
    audioEngine.applyNotchFilter(next);
  };

  const handleNotchFreqChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const frequency = parseFloat(e.target.value);
    setNotchFilter({ frequency, enabled: true });
    audioEngine.applyNotchFilter({ ...notchFilter, frequency, enabled: true });
  };

  const handleCompressorToggle = () => {
    const next = { ...compressor, enabled: !compressor.enabled };
    setCompressor({ enabled: next.enabled });
    audioEngine.applyCompressor(next);
  };

  const handleCompressorThreshold = (e: React.ChangeEvent<HTMLInputElement>) => {
    const threshold = parseFloat(e.target.value);
    setCompressor({ threshold, enabled: true });
    audioEngine.applyCompressor({ ...compressor, threshold, enabled: true });
  };

  const handleToggleReverse = () => {
    toggleReverse();
    audioEngine.setReverse(!isReversed);
  };

  const handlePitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const semitones = parseFloat(e.target.value);
    setPitchShift({ semitones, enabled: semitones !== 0 });
    audioEngine.applyPitchShift(semitones);
  };

  const handlePitchToggle = () => {
    if (pitchShift.enabled) {
      setPitchShift({ semitones: 0, enabled: false });
      audioEngine.applyPitchShift(0);
    } else {
      // Re-activate at default investigative value
      setPitchShift({ semitones: pitchShift.semitones !== 0 ? pitchShift.semitones : -4, enabled: true });
      audioEngine.applyPitchShift(pitchShift.semitones !== 0 ? pitchShift.semitones : -4);
    }
  };

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div className="filter-panel space-y-5">

      {/* ── Volume ── */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase" style={{ color: '#3d6a7a' }}>
            Volume
          </span>
          <span className="text-[11px] font-mono font-bold text-forensics-cyan">
            {Math.round(volume * 100)}%
          </span>
        </div>
        <input
          type="range" min="0" max="1" step="0.01" value={volume}
          onChange={handleVolumeChange}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{ accentColor: '#00bcd4' }}
        />
      </div>

      {/* ── Presets ── */}
      <div>
        <span className="text-[10px] font-mono font-bold tracking-widest uppercase block mb-2" style={{ color: '#3d6a7a' }}>
          Démarrage rapide
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {(
            [
              { key: 'clear',        label: 'Réinitialiser', symbol: '↺' },
              { key: 'remove-mask',  label: 'Voix claire',   symbol: '◎' },
              { key: 'deep-analysis',label: 'Analyse',       symbol: '⬡' },
            ] as const
          ).map(({ key, label, symbol }) => (
            <motion.button
              key={key}
              type="button"
              onClick={() => applyPreset(key)}
              className="py-2 flex flex-col items-center gap-0.5 rounded border font-mono text-[10px] tracking-wider transition-colors"
              style={{ backgroundColor: '#0a1822', borderColor: '#1e3040', color: '#4a7a8a' }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <span className="text-base leading-none">{symbol}</span>
              <span className="leading-tight text-center">{label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Filter cards ── */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-mono font-bold tracking-widest uppercase block" style={{ color: '#3d6a7a' }}>
          Outils d'analyse
        </span>

        {/* Low-Pass — coupe les aigus */}
        <FilterCard
          icon="🔉"
          label="Filtre graves"
          hint="Coupe les sons trop aigus"
          activeHint={`Coupure à ${Math.round(lowPassFilter.frequency)} Hz`}
          active={lowPassFilter.enabled}
          accentHex="#22d3ee"
          onToggle={() => updateLowPassFilter({ enabled: !lowPassFilter.enabled })}
        >
          <SlimRange
            min={200} max={20000} step={100}
            value={lowPassFilter.frequency}
            accentHex="#22d3ee"
            leftLabel="200 Hz" rightLabel="20 kHz"
            onChange={handleLowPassChange}
          />
        </FilterCard>

        {/* High-Pass — coupe les graves */}
        <FilterCard
          icon="🔈"
          label="Filtre aigus"
          hint="Coupe les sons trop graves"
          activeHint={`Coupure à ${Math.round(highPassFilter.frequency)} Hz`}
          active={highPassFilter.enabled}
          accentHex="#4ade80"
          onToggle={() => updateHighPassFilter({ enabled: !highPassFilter.enabled })}
        >
          <SlimRange
            min={20} max={2000} step={10}
            value={highPassFilter.frequency}
            accentHex="#4ade80"
            leftLabel="20 Hz" rightLabel="2 kHz"
            onChange={handleHighPassChange}
          />
        </FilterCard>

        {/* Band-Pass — isolate voice */}
        <FilterCard
          icon="🎤"
          label="Isoler la voix"
          hint="Met en avant la plage vocale"
          activeHint={`Centré sur ${Math.round(bandPassFilter.frequency)} Hz`}
          active={bandPassFilter.enabled}
          accentHex="#fbbf24"
          onToggle={handleBandPassToggle}
        >
          <SlimRange
            min={200} max={4000} step={50}
            value={bandPassFilter.frequency}
            accentHex="#fbbf24"
            leftLabel="200 Hz" rightLabel="4 kHz"
            onChange={handleBandPassFreqChange}
          />
        </FilterCard>

        {/* Notch — remove buzz */}
        <FilterCard
          icon="⚡"
          label="Supprimer le buzz"
          hint="Élimine les interférences électriques"
          activeHint={`Supprime ${Math.round(notchFilter.frequency)} Hz`}
          active={notchFilter.enabled}
          accentHex="#f87171"
          onToggle={handleNotchToggle}
        >
          <SlimRange
            min={20} max={300} step={5}
            value={notchFilter.frequency}
            accentHex="#f87171"
            leftLabel="20 Hz" rightLabel="300 Hz"
            onChange={handleNotchFreqChange}
          />
        </FilterCard>

        {/* Compressor — reveal whispers */}
        <FilterCard
          icon="📢"
          label="Amplifier les murmures"
          hint="Révèle les sons discrets et chuchotements"
          activeHint={`Seuil à ${compressor.threshold} dB`}
          active={compressor.enabled}
          accentHex="#c084fc"
          onToggle={handleCompressorToggle}
        >
          <SlimRange
            min={-60} max={0} step={1}
            value={compressor.threshold}
            accentHex="#c084fc"
            leftLabel="-60 dB" rightLabel="0 dB"
            onChange={handleCompressorThreshold}
          />
        </FilterCard>

        {/* Pitch — voice tone restoration */}
        <FilterCard
          icon="🎵"
          label="Tonalité de la voix"
          hint="Restaure ou modifie la hauteur de la voix"
          activeHint={`${pitchShift.semitones > 0 ? '+' : ''}${pitchShift.semitones} demi-tons`}
          active={pitchShift.enabled}
          accentHex="#818cf8"
          onToggle={handlePitchToggle}
        >
          <SlimRange
            min={-12} max={12} step={1}
            value={pitchShift.semitones}
            accentHex="#818cf8"
            leftLabel="-12 st" rightLabel="+12 st"
            onChange={handlePitchChange}
          />
        </FilterCard>

        {/* Reverse */}
        <FilterCard
          icon="◀◀"
          label="Lecture inversée"
          hint="Révèle les messages cachés à l'envers"
          activeHint="Audio lu en sens inverse — actif"
          active={isReversed}
          accentHex="#fb923c"
          onToggle={handleToggleReverse}
        />
      </div>

    </div>
  );
};

export default FilterPanel;
