/**
 * SuspectPopupModal — popup global déclenché par le Stream Deck.
 * Affiche le dossier complet du suspect sélectionné + contrôle de la voix.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useAudioStore } from '@/stores/audioStore';
import { getScenario } from '@/data/scenarios';
import { streamDeckSuspectService } from '@/services/streamdeck/StreamDeckSuspectService';

const MIN_PITCH = 0.5;
const MAX_PITCH = 2.0;

/** Convertit un playbackRate en label lisible */
function pitchLabel(rate: number): string {
  const pct = Math.round((rate - 1) * 100);
  if (pct === 0) return 'Normal';
  return pct > 0 ? `+${pct}%` : `${pct}%`;
}

const SuspectPopupModal = () => {
  const {
    suspectPopupIndex,
    suspectPlayingIndex,
    suspectVoicePitch,
    scenario: scenarioId,
    setSuspectPopupIndex,
    setSuspectVoicePitch,
  } = useAudioStore();

  const scenario = getScenario(scenarioId);
  const suspect = suspectPopupIndex !== null ? scenario.suspects[suspectPopupIndex] : null;
  const matchScore = suspect ? scenario.matchScores[suspect.id] ?? 0 : 0;
  const isPlaying = suspectPopupIndex !== null && suspectPlayingIndex === suspectPopupIndex;

  const handleTogglePlay = () => {
    if (suspectPopupIndex === null) return;
    streamDeckSuspectService.toggleSuspect(suspectPopupIndex);
  };

  const handleClose = () => {
    setSuspectPopupIndex(null);
  };

  return (
    <AnimatePresence>
      {suspect && (
        <motion.div
          className="fixed inset-0 bg-black/85 flex items-center justify-center z-[100] p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="bg-forensics-bg-light border-2 border-forensics-orange rounded-lg overflow-hidden max-w-2xl w-full"
            initial={{ scale: 0.88, y: 24 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.88, y: 24 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-forensics-orange/40 bg-forensics-orange/10">
              <div className="flex items-center gap-2">
                <span className="text-forensics-orange font-mono text-xs tracking-widest">
                  STREAM DECK — DOSSIER SUSPECT
                </span>
                {isPlaying && (
                  <span className="inline-flex items-center gap-1 text-xs font-mono text-forensics-green">
                    <span className="w-1.5 h-1.5 rounded-full bg-forensics-green animate-pulse" />
                    EN LECTURE
                  </span>
                )}
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white font-mono text-lg leading-none"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="flex gap-6 p-6">
              {/* Photo */}
              <div className="shrink-0 w-40 h-40 rounded-lg overflow-hidden border border-forensics-orange/40">
                <img
                  src={suspect.photoUrl}
                  alt={suspect.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 space-y-3">
                <div>
                  <h2 className="text-2xl font-bold text-forensics-orange font-mono">
                    {suspect.name}
                  </h2>
                  <p className="text-sm text-gray-400 font-mono">{suspect.role}</p>
                </div>

                {/* Alibi */}
                <div className="bg-forensics-bg border border-forensics-orange/30 rounded p-3">
                  <p className="text-xs text-forensics-orange font-mono mb-1">ALIBI</p>
                  <p className="text-sm text-gray-300 font-mono">{suspect.notes}</p>
                </div>

                {/* Match score */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-gray-500">CONCORDANCE VOCALE</span>
                    <span
                      className={
                        matchScore >= 80
                          ? 'text-forensics-red font-bold'
                          : matchScore >= 40
                            ? 'text-forensics-orange'
                            : 'text-gray-400'
                      }
                    >
                      {matchScore}%
                    </span>
                  </div>
                  <div className="h-2 bg-forensics-bg rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        matchScore >= 80
                          ? 'bg-forensics-red'
                          : matchScore >= 40
                            ? 'bg-forensics-orange'
                            : 'bg-forensics-cyan-dark'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${matchScore}%` }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Voice controls */}
            <div className="px-6 pb-6 space-y-4 border-t border-forensics-orange/20 pt-4">
              <p className="text-xs text-forensics-orange font-mono tracking-widest">
                MODIFICATION VOCALE
              </p>

              {/* Pitch slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono text-gray-400">
                  <span>Grave &amp; Lent</span>
                  <span className="text-forensics-orange font-bold text-sm">
                    {pitchLabel(suspectVoicePitch)}
                  </span>
                  <span>Aigu &amp; Rapide</span>
                </div>
                <input
                  type="range"
                  min={MIN_PITCH}
                  max={MAX_PITCH}
                  step={0.01}
                  value={suspectVoicePitch}
                  onChange={(e) => setSuspectVoicePitch(parseFloat(e.target.value))}
                  className="w-full accent-forensics-orange cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-gray-600">
                  <span>×{MIN_PITCH}</span>
                  <button
                    onClick={() => setSuspectVoicePitch(1.0)}
                    className="text-gray-500 hover:text-forensics-orange transition-colors"
                  >
                    RESET
                  </button>
                  <span>×{MAX_PITCH}</span>
                </div>
              </div>

              {/* Play/Stop */}
              <button
                onClick={handleTogglePlay}
                className={`w-full py-2.5 font-mono font-bold text-sm rounded transition-all border ${
                  isPlaying
                    ? 'bg-forensics-orange text-forensics-bg border-forensics-orange'
                    : 'bg-forensics-bg border-forensics-orange text-forensics-orange hover:bg-forensics-orange/10'
                }`}
              >
                {isPlaying ? '⏹ STOPPER LA VOIX' : '▶ ÉCOUTER LA VOIX'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuspectPopupModal;
