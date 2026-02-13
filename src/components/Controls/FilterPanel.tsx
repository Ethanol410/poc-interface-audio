/**
 * FilterPanel Component - Controls for audio filters (low-pass, high-pass)
 */

import { motion } from 'framer-motion';
import { useFilterControls } from '@/hooks/useFilterControls';

const FilterPanel = () => {
  const {
    lowPassFilter,
    highPassFilter,
    updateLowPassFilter,
    updateHighPassFilter,
    applyPreset,
  } = useFilterControls();

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
      {/* Preset Buttons */}
      <div>
        <h4 className="text-sm font-bold text-forensics-cyan font-mono mb-3">
          🎛️ PRESETS
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
        </div>
        <p className="text-xs text-gray-500 font-mono">
          Filtre les fréquences en-dessous de la valeur définie
        </p>
      </div>

      {/* Info box */}
      <div className="bg-forensics-cyan/10 border border-forensics-cyan rounded p-3">
        <p className="text-xs text-forensics-cyan font-mono">
          💡 Astuce: Utilisez les filtres pour éliminer le bruit et clarifier la voix
        </p>
      </div>
    </div>
  );
};

export default FilterPanel;