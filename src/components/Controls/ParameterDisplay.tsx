/**
 * ParameterDisplay Component - Display current audio parameters
 */

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAudioStore } from '@/stores/audioStore';

interface ParameterItemProps {
  label: string;
  value: string | number;
  unit?: string;
  isActive?: boolean;
}

const ParameterItem = memo(({ label, value, unit, isActive }: ParameterItemProps) => {
  return (
    <motion.div
      className={`
        flex flex-col items-center p-4 rounded-lg border-2
        ${isActive ? 'border-forensics-green' : 'border-forensics-cyan-dark'}
        ${isActive ? 'bg-forensics-green/10' : 'bg-forensics-bg-light'}
        transition-colors duration-200
      `}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <span className="text-gray-400 text-xs font-mono uppercase mb-1">
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <motion.span
          className={`
            text-2xl font-bold font-mono
            ${isActive ? 'text-forensics-green' : 'text-forensics-cyan'}
          `}
          key={value}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {value}
        </motion.span>
        {unit && (
          <span className="text-sm text-gray-500 font-mono">{unit}</span>
        )}
      </div>
    </motion.div>
  );
});

ParameterItem.displayName = 'ParameterItem';

const ParameterDisplay = memo(() => {
  const { lowPassFilter, highPassFilter, pitchShift, volume } = useAudioStore();

  // Memoize parameters to avoid recalculation
  const parameters = useMemo(() => [
    {
      label: 'Low-Pass',
      value: Math.round(lowPassFilter.frequency),
      unit: 'Hz',
      isActive: lowPassFilter.enabled,
    },
    {
      label: 'High-Pass',
      value: Math.round(highPassFilter.frequency),
      unit: 'Hz',
      isActive: highPassFilter.enabled,
    },
    {
      label: 'Pitch Shift',
      value: pitchShift.semitones > 0 ? `+${pitchShift.semitones}` : pitchShift.semitones,
      unit: 'ST',
      isActive: pitchShift.enabled || pitchShift.semitones !== 0,
    },
    {
      label: 'Volume',
      value: Math.round(volume * 100),
      unit: '%',
      isActive: true,
    },
  ], [lowPassFilter, highPassFilter, pitchShift, volume]);

  return (
    <div className="parameter-display grid grid-cols-2 md:grid-cols-4 gap-4">
      {parameters.map((param) => (
        <ParameterItem
          key={param.label}
          label={param.label}
          value={param.value}
          unit={param.unit}
          isActive={param.isActive}
        />
      ))}
    </div>
  );
});

ParameterDisplay.displayName = 'ParameterDisplay';

export default ParameterDisplay;
