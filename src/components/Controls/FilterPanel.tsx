/**
 * FilterPanel Component - Controls for audio filters (low-pass, high-pass)
 */

import { motion } from 'framer-motion';
import { useFilterControls } from '@/hooks/useFilterControls';
import { useAudioStore } from '@/stores/audioStore';
import { audioEngine } from '@/services/audioEngine';

const FilterPanel = () => {
  const {
    lowPassFilter,
    highPassFilter,
    updateLowPassFilter,
    updateHighPassFilter,
    applyPreset,
  } = useFilterControls();

  const {
    isReversed, toggleReverse,
    bandPassFilter, setBandPassFilter,
    notchFilter, setNotchFilter,
    compressor, setCompressor,
    playbackSpeed, setPlaybackSpeed,
    volume, setVolume,
  } = useAudioStore();

  const handleToggleReverse = () => {
    toggleReverse();
    audioEngine.setReverse(!isReversed);
  };

  const handleBandPassToggle = () => {
    const next = { ...bandPassFilter, enabled: !bandPassFilter.enabled };
    setBandPassFilter({ enabled: next.enabled });
    audioEngine.applyBandPassFilter(next);
  };

  const handleBandPassFreqChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const frequency = parseFloat(e.target.value);
    const next = { ...bandPassFilter, frequency, enabled: true };
    setBandPassFilter({ frequency, enabled: true });
    audioEngine.applyBandPassFilter(next);
  };

  const handleNotchToggle = () => {
    const next = { ...notchFilter, enabled: !notchFilter.enabled };
    setNotchFilter({ enabled: next.enabled });
    audioEngine.applyNotchFilter(next);
  };

  const handleNotchFreqChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const frequency = parseFloat(e.target.value);
    const next = { ...notchFilter, frequency, enabled: true };
    setNotchFilter({ frequency, enabled: true });
    audioEngine.applyNotchFilter(next);
  };

  const handleCompressorToggle = () => {
    const next = { ...compressor, enabled: !compressor.enabled };
    setCompressor({ enabled: next.enabled });
    audioEngine.applyCompressor(next);
  };

  const handleCompressorThreshold = (e: React.ChangeEvent<HTMLInputElement>) => {
    const threshold = parseFloat(e.target.value);
    const next = { ...compressor, threshold, enabled: true };
    setCompressor({ threshold, enabled: true });
    audioEngine.applyCompressor(next);
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const speed = parseFloat(e.target.value);
    setPlaybackSpeed(speed);
    audioEngine.setPlaybackSpeed(speed);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    audioEngine.setVolume(vol);
  };

  const handleLowPassQChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = parseFloat(e.target.value);
    updateLowPassFilter({ q });
  };

  const handleHighPassQChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = parseFloat(e.target.value);
    updateHighPassFilter({ q });
  };

  const handleBandPassQChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = parseFloat(e.target.value);
    const next = { ...bandPassFilter, q };
    setBandPassFilter({ q });
    audioEngine.applyBandPassFilter(next);
  };

  const handleNotchQChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = parseFloat(e.target.value);
    const next = { ...notchFilter, q };
    setNotchFilter({ q });
    audioEngine.applyNotchFilter(next);
  };

  const handleLowPassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const frequency = parseFloat(e.target.value);
    updateLowPassFilter({ frequency, enabled: true });
  };

  const handleHighPassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const frequency = parseFloat(e.target.value);
    updateHighPassFilter({ frequency, enabled: true });
  };

  const toggleLowPass = () => {
    updateLowPassFilter({ enabled: !lowPassFilter.enabled });
  };

  const toggleHighPass = () => {
    updateHighPassFilter({ enabled: !highPassFilter.enabled });
  };

  return (
    <div className="filter-panel space-y-6">
      {/* Volume */}
      <div className="space-y-2">
        <h4 className="text-sm font-bold text-forensics-cyan font-mono">VOLUME MASTER</h4>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="w-full accent-forensics-cyan"
        />
        <div className="flex justify-between text-xs font-mono text-gray-500">
          <span>0%</span>
          <span className="text-forensics-cyan font-bold">{Math.round(volume * 100)}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Reverse Button */}
      <div>
        <h4 className="text-sm font-bold text-forensics-cyan font-mono mb-3">
          LECTURE INVERSÉE
        </h4>
        <motion.button
          onClick={handleToggleReverse}
          className={`w-full px-3 py-2 rounded font-mono text-xs font-bold transition-all border ${
            isReversed
              ? 'bg-forensics-orange/20 border-forensics-orange text-forensics-orange'
              : 'bg-forensics-bg-light border-forensics-cyan-dark text-forensics-cyan hover:border-forensics-cyan'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          {isReversed ? '◀◀ REVERSE ON — message caché actif' : '▶▶ REVERSE OFF'}
        </motion.button>
        <p className="text-xs text-gray-500 font-mono mt-2">
          Inverse la lecture pour révéler les messages cachés
        </p>
      </div>

      {/* Preset Buttons */}
      <div>
        <h4 className="text-sm font-bold text-forensics-cyan font-mono mb-3">
          PRESETS
        </h4>
        <div className="grid grid-cols-3 gap-2">
          <motion.button
            onClick={() => applyPreset('clear')}
            className="px-3 py-2 bg-forensics-bg-light border border-forensics-cyan-dark text-forensics-cyan font-mono text-xs rounded hover:border-forensics-cyan hover:glow-cyan transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            RESET
          </motion.button>
          <motion.button
            onClick={() => applyPreset('remove-mask')}
            className="px-3 py-2 bg-forensics-bg-light border border-forensics-cyan-dark text-forensics-cyan font-mono text-xs rounded hover:border-forensics-cyan hover:glow-cyan transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            CLARIFY
          </motion.button>
          <motion.button
            onClick={() => applyPreset('deep-analysis')}
            className="px-3 py-2 bg-forensics-bg-light border border-forensics-cyan-dark text-forensics-cyan font-mono text-xs rounded hover:border-forensics-cyan hover:glow-cyan transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            DEEP
          </motion.button>
        </div>
      </div>

      {/* Low-Pass Filter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-forensics-cyan font-mono">
            LOW-PASS FILTER
          </h4>
          <button
            onClick={toggleLowPass}
            className={`
              px-3 py-1 rounded font-mono text-xs font-bold transition-all
              ${
                lowPassFilter.enabled
                  ? 'bg-forensics-green text-forensics-bg'
                  : 'bg-gray-700 text-gray-400'
              }
            `}
          >
            {lowPassFilter.enabled ? '● ON' : '○ OFF'}
          </button>
        </div>
        <div className="space-y-2">
          <input
            type="range"
            min="200"
            max="20000"
            step="100"
            value={lowPassFilter.frequency}
            onChange={handleLowPassChange}
            className="w-full accent-forensics-cyan"
            disabled={!lowPassFilter.enabled}
          />
          <div className="flex justify-between text-xs font-mono text-gray-500">
            <span>200 Hz</span>
            <span className="text-forensics-cyan font-bold">
              {Math.round(lowPassFilter.frequency)} Hz
            </span>
            <span>20 kHz</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-mono text-gray-600 w-4">Q</span>
            <input
              type="range"
              min="0.1"
              max="20"
              step="0.1"
              value={lowPassFilter.q}
              onChange={handleLowPassQChange}
              className="flex-1 accent-forensics-cyan"
              disabled={!lowPassFilter.enabled}
            />
            <span className="text-xs font-mono text-gray-500 w-8 text-right">{lowPassFilter.q.toFixed(1)}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 font-mono">
          Filtre les fréquences au-dessus de la valeur définie
        </p>
      </div>

      {/* High-Pass Filter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-forensics-cyan font-mono">
            HIGH-PASS FILTER
          </h4>
          <button
            onClick={toggleHighPass}
            className={`
              px-3 py-1 rounded font-mono text-xs font-bold transition-all
              ${
                highPassFilter.enabled
                  ? 'bg-forensics-green text-forensics-bg'
                  : 'bg-gray-700 text-gray-400'
              }
            `}
          >
            {highPassFilter.enabled ? '● ON' : '○ OFF'}
          </button>
        </div>
        <div className="space-y-2">
          <input
            type="range"
            min="20"
            max="2000"
            step="10"
            value={highPassFilter.frequency}
            onChange={handleHighPassChange}
            className="w-full accent-forensics-cyan"
            disabled={!highPassFilter.enabled}
          />
          <div className="flex justify-between text-xs font-mono text-gray-500">
            <span>20 Hz</span>
            <span className="text-forensics-cyan font-bold">
              {Math.round(highPassFilter.frequency)} Hz
            </span>
            <span>2 kHz</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-mono text-gray-600 w-4">Q</span>
            <input
              type="range"
              min="0.1"
              max="20"
              step="0.1"
              value={highPassFilter.q}
              onChange={handleHighPassQChange}
              className="flex-1 accent-forensics-cyan"
              disabled={!highPassFilter.enabled}
            />
            <span className="text-xs font-mono text-gray-500 w-8 text-right">{highPassFilter.q.toFixed(1)}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 font-mono">
          Filtre les fréquences en-dessous de la valeur définie
        </p>
      </div>

      {/* Band-Pass Filter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-forensics-cyan font-mono">
            BAND-PASS (VOIX)
          </h4>
          <button
            onClick={handleBandPassToggle}
            className={`px-3 py-1 rounded font-mono text-xs font-bold transition-all ${
              bandPassFilter.enabled ? 'bg-forensics-green text-forensics-bg' : 'bg-gray-700 text-gray-400'
            }`}
          >
            {bandPassFilter.enabled ? '● ON' : '○ OFF'}
          </button>
        </div>
        <div className="space-y-2">
          <input
            type="range"
            min="200"
            max="4000"
            step="50"
            value={bandPassFilter.frequency}
            onChange={handleBandPassFreqChange}
            className="w-full accent-forensics-cyan"
            disabled={!bandPassFilter.enabled}
          />
          <div className="flex justify-between text-xs font-mono text-gray-500">
            <span>200 Hz</span>
            <span className="text-forensics-cyan font-bold">{Math.round(bandPassFilter.frequency)} Hz</span>
            <span>4 kHz</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-mono text-gray-600 w-4">Q</span>
            <input
              type="range"
              min="0.1"
              max="30"
              step="0.1"
              value={bandPassFilter.q}
              onChange={handleBandPassQChange}
              className="flex-1 accent-forensics-cyan"
              disabled={!bandPassFilter.enabled}
            />
            <span className="text-xs font-mono text-gray-500 w-8 text-right">{bandPassFilter.q.toFixed(1)}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 font-mono">
          Isole la plage vocale — révèle le locuteur
        </p>
      </div>

      {/* Notch Filter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-forensics-cyan font-mono">
            COUPE-BANDE (BUZZ)
          </h4>
          <button
            onClick={handleNotchToggle}
            className={`px-3 py-1 rounded font-mono text-xs font-bold transition-all ${
              notchFilter.enabled ? 'bg-forensics-green text-forensics-bg' : 'bg-gray-700 text-gray-400'
            }`}
          >
            {notchFilter.enabled ? '● ON' : '○ OFF'}
          </button>
        </div>
        <div className="space-y-2">
          <input
            type="range"
            min="20"
            max="300"
            step="5"
            value={notchFilter.frequency}
            onChange={handleNotchFreqChange}
            className="w-full accent-forensics-cyan"
            disabled={!notchFilter.enabled}
          />
          <div className="flex justify-between text-xs font-mono text-gray-500">
            <span>20 Hz</span>
            <span className="text-forensics-cyan font-bold">{Math.round(notchFilter.frequency)} Hz</span>
            <span>300 Hz</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-mono text-gray-600 w-4">Q</span>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={notchFilter.q}
              onChange={handleNotchQChange}
              className="flex-1 accent-forensics-cyan"
              disabled={!notchFilter.enabled}
            />
            <span className="text-xs font-mono text-gray-500 w-8 text-right">{notchFilter.q.toFixed(0)}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 font-mono">
          Supprime les interférences électriques (50/60 Hz)
        </p>
      </div>

      {/* Compressor */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-forensics-cyan font-mono">
            COMPRESSEUR
          </h4>
          <button
            onClick={handleCompressorToggle}
            className={`px-3 py-1 rounded font-mono text-xs font-bold transition-all ${
              compressor.enabled ? 'bg-forensics-green text-forensics-bg' : 'bg-gray-700 text-gray-400'
            }`}
          >
            {compressor.enabled ? '● ON' : '○ OFF'}
          </button>
        </div>
        <div className="space-y-2">
          <input
            type="range"
            min="-60"
            max="0"
            step="1"
            value={compressor.threshold}
            onChange={handleCompressorThreshold}
            className="w-full accent-forensics-cyan"
            disabled={!compressor.enabled}
          />
          <div className="flex justify-between text-xs font-mono text-gray-500">
            <span>-60 dB</span>
            <span className="text-forensics-cyan font-bold">{compressor.threshold} dB</span>
            <span>0 dB</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 font-mono">
          Amplifie les sons faibles — révèle les chuchotements
        </p>
      </div>

      {/* Speed Control */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-forensics-cyan font-mono">
          VITESSE DE LECTURE
        </h4>
        <div className="space-y-2">
          <input
            type="range"
            min="0.25"
            max="2"
            step="0.05"
            value={playbackSpeed}
            onChange={handleSpeedChange}
            className="w-full accent-forensics-cyan"
          />
          <div className="flex justify-between text-xs font-mono text-gray-500">
            <span>0.25×</span>
            <span className="text-forensics-cyan font-bold">{playbackSpeed.toFixed(2)}×</span>
            <span>2×</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {[0.5, 1, 1.5].map((s) => (
            <button
              key={s}
              onClick={() => { setPlaybackSpeed(s); audioEngine.setPlaybackSpeed(s); }}
              className={`py-1 rounded font-mono text-xs transition-all border ${
                playbackSpeed === s
                  ? 'bg-forensics-cyan/20 border-forensics-cyan text-forensics-cyan'
                  : 'bg-forensics-bg-light border-forensics-cyan-dark text-gray-400 hover:border-forensics-cyan'
              }`}
            >
              {s}×
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 font-mono">
          Ralentir pour détecter l'accent ou le contexte
        </p>
      </div>

      {/* Info box */}
      <div className="bg-forensics-cyan/10 border border-forensics-cyan rounded p-3">
        <p className="text-xs text-forensics-cyan font-mono">
          💡 Astuce: Combinez les filtres pour révéler tous les indices cachés
        </p>
      </div>
    </div>
  );
};

export default FilterPanel;