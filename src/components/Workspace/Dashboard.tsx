import { useEffect, useMemo, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAudioStore } from '@/stores/audioStore';
import { useAudioControls } from '@/hooks/useAudioControls';
import {
  Waveform,
  Spectrogram,
  FrequencyBars,
  AudioMeter,
  ParameterDisplay,
} from '@/components/Visualization';
import FilterPanel from '@/components/Controls/FilterPanel';
import PitchControl from '@/components/Controls/PitchControl';

// Clues definition: which store condition triggers which clue
const CLUE_TRIGGERS = [
  {
    id: 'clocher',
    label: 'Son de clocher identifié',
    hint: 'Filtre passe-bas activé — bruits aigus supprimés',
    check: (s: ReturnType<typeof useAudioStore.getState>) => s.lowPassFilter.enabled,
  },
  {
    id: 'voix',
    label: 'Voix clarifiée',
    hint: 'Filtre passe-haut activé — bruits sourds supprimés',
    check: (s: ReturnType<typeof useAudioStore.getState>) => s.highPassFilter.enabled,
  },
  {
    id: 'pitch',
    label: 'Tonalité vocale restaurée',
    hint: 'Correction de hauteur appliquée',
    check: (s: ReturnType<typeof useAudioStore.getState>) => s.pitchShift.semitones !== 0,
  },
  {
    id: 'message-cache',
    label: 'Message caché : "Prenez le train de 14h15"',
    hint: 'Lecture inversée activée',
    check: (s: ReturnType<typeof useAudioStore.getState>) => s.isReversed,
  },
  {
    id: 'plage-vocale',
    label: 'Plage vocale isolée — accent reconnu',
    hint: 'Filtre passe-bande appliqué sur la voix',
    check: (s: ReturnType<typeof useAudioStore.getState>) => s.bandPassFilter.enabled,
  },
  {
    id: 'interference',
    label: 'Interférence électrique supprimée',
    hint: 'Filtre coupe-bande activé (50/60 Hz)',
    check: (s: ReturnType<typeof useAudioStore.getState>) => s.notchFilter.enabled,
  },
  {
    id: 'chuchotement',
    label: 'Chuchotement amplifié — lieu identifié',
    hint: 'Compresseur activé — sons faibles révélés',
    check: (s: ReturnType<typeof useAudioStore.getState>) => s.compressor.enabled,
  },
  {
    id: 'ralenti',
    label: 'Accent étranger détecté au ralenti',
    hint: 'Vitesse de lecture réduite',
    check: (s: ReturnType<typeof useAudioStore.getState>) => s.playbackSpeed < 0.9,
  },
] as const;

const Dashboard = memo(() => {
  const navigate = useNavigate();
  const store = useAudioStore();
  const { isPlaying, currentTime, duration, audioUrls, discoveredClues, addClue } = store;
  // Initialize audio engine (sets up filter chain, volume sync)
  useAudioControls();

  // Detect and unlock clues based on audio tool interactions
  useEffect(() => {
    CLUE_TRIGGERS.forEach(({ id, check }) => {
      if (check(store) && !discoveredClues.includes(id)) {
        addClue(id);
      }
    });
  }, [store, discoveredClues, addClue]);

  // Format time (seconds to MM:SS) - memoized
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Memoized formatted times
  const formattedCurrentTime = useMemo(() => formatTime(currentTime), [currentTime, formatTime]);
  const formattedDuration = useMemo(() => formatTime(duration), [duration, formatTime]);

  const handleContinueToSuspects = useCallback(() => {
    navigate('/suspects');
  }, [navigate]);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <motion.header
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-forensics-cyan font-mono mb-2">
                DOSSIER 84-V
              </h1>
              <p className="text-gray-400 font-mono text-sm">
                Division Criminalistique Audio  //  Analyse Forensique
              </p>
            </div>
            <div className="text-right">
              <div className="text-forensics-cyan font-mono text-2xl font-bold">
                {formattedCurrentTime} / {formattedDuration}
              </div>
              <div className="text-gray-500 font-mono text-xs mt-1">
                TEMPS ÉCOULÉ
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main content grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left column - Visualizations */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Case File */}
            <motion.div
              className="bg-forensics-bg-light border-2 border-forensics-cyan rounded-lg p-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-bold text-forensics-cyan font-mono mb-4">
                📁 DOSSIER: Le Corbeau
              </h2>
              <div className="space-y-3 text-sm font-mono">
                <p className="text-gray-300">
                  <span className="text-forensics-green">▸</span> Crime: Menaces anonymes répétées
                </p>
                <p className="text-gray-300">
                  <span className="text-forensics-green">▸</span> Preuve: Enregistrement vocal modifié
                </p>
                <p className="text-gray-300">
                  <span className="text-forensics-green">▸</span> Mission: Restaurer la voix et identifier le suspect
                </p>
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500 rounded">
                  <p className="text-red-400 text-xs">
                    🚨 URGENT: Le Corbeau a menacé de frapper à nouveau. Utilisez les outils forensiques pour démasquer le coupable.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Waveform */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-forensics-cyan font-mono">
                  🌊 FORME D'ONDE
                </h3>
                <span className="text-gray-500 font-mono text-xs">
                  Cliquez sur la forme d'onde pour lire / mettre en pause
                </span>
              </div>
              <Waveform audioUrl={audioUrls?.evidenceDistorted} />
            </motion.div>

            {/* Spectrogram */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-lg font-bold text-forensics-cyan font-mono mb-3">
                📊 SPECTROGRAMME
              </h3>
              <Spectrogram audioUrl={audioUrls?.evidenceDistorted} />
            </motion.div>

            {/* Frequency Bars */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-lg font-bold text-forensics-cyan font-mono mb-3">
                📈 ANALYSE FRÉQUENTIELLE
              </h3>
              <FrequencyBars isPlaying={isPlaying} width={800} height={150} />
            </motion.div>
          </div>

          {/* Right column - Controls and Meters */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Audio Meters */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-lg font-bold text-forensics-cyan font-mono mb-3">
                🎚️ NIVEAUX AUDIO
              </h3>
              <AudioMeter isPlaying={isPlaying} height={200} />
            </motion.div>

            {/* Filter Controls */}
            <motion.div
              className="bg-forensics-bg-light border border-forensics-cyan-dark rounded-lg p-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-lg font-bold text-forensics-cyan font-mono mb-4">
                🔧 FILTRES AUDIO
              </h3>
              <FilterPanel />
            </motion.div>

            {/* Pitch Control */}
            <motion.div
              className="bg-forensics-bg-light border border-forensics-cyan-dark rounded-lg p-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <PitchControl />
            </motion.div>

            {/* Parameter Display */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="text-lg font-bold text-forensics-cyan font-mono mb-3">
                ⚙️ PARAMÈTRES
              </h3>
              <ParameterDisplay />
            </motion.div>

            {/* Continue Button */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <button
                onClick={handleContinueToSuspects}
                className="w-full bg-forensics-green text-forensics-bg font-mono font-bold py-4 rounded-lg uppercase tracking-wider hover:bg-white transition-colors glow-cyan-hover"
              >
                ➤ Identifier le Suspect
              </button>
              <p className="text-gray-500 text-xs font-mono text-center mt-2">
                Passez à la phase de comparaison vocale
              </p>
            </motion.div>

            {/* Clue Tracker HUD */}
            <motion.div
              className="bg-forensics-bg-light border border-forensics-cyan-dark rounded-lg p-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.65 }}
            >
              <h4 className="text-sm font-bold text-forensics-cyan font-mono mb-3">
                INDICES DÉCOUVERTS ({discoveredClues.length}/{CLUE_TRIGGERS.length})
              </h4>
              <ul className="space-y-2">
                {CLUE_TRIGGERS.map(({ id, label, hint }) => {
                  const found = discoveredClues.includes(id);
                  return (
                    <li key={id} className={`text-xs font-mono flex gap-2 ${found ? 'text-forensics-green' : 'text-gray-600'}`}>
                      <span>{found ? '✓' : '○'}</span>
                      <span>
                        {found ? label : '???'}
                        {found && <span className="block text-gray-500 text-[10px]">{hint}</span>}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </motion.div>

            {/* Instructions */}
            <motion.div
              className="bg-forensics-bg-light border border-forensics-cyan-dark rounded-lg p-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h4 className="text-sm font-bold text-forensics-cyan font-mono mb-3">
                INSTRUCTIONS
              </h4>
              <ul className="space-y-2 text-xs font-mono text-gray-400">
                <li>• Analysez le spectrogramme</li>
                <li>• Ajustez les filtres audio</li>
                <li>• Modifiez le pitch si nécessaire</li>
                <li>• Activez le REVERSE pour les messages cachés</li>
                <li>• Comparez avec les suspects</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;
