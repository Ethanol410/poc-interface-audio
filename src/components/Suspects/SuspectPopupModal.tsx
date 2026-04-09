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
const isPlaying = suspectPopupIndex !== null && suspectPlayingIndex === suspectPopupIndex;
  const isBrainCity = scenarioId === 'braincity';

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
            className={
              isBrainCity
                ? "bg-[#FDF8F5] border-4 border-braincity-border rounded-[24px] overflow-hidden max-w-2xl w-full"
                : "bg-forensics-bg-light border-2 border-forensics-orange rounded-lg overflow-hidden max-w-2xl w-full"
            }
            style={isBrainCity ? { boxShadow: '0 8px 0 0 #073B4C' } : {}}
            initial={{ scale: 0.88, y: 24 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.88, y: 24 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={
              isBrainCity
                ? "flex items-center justify-between px-5 py-3 border-b-4 border-braincity-border bg-[#FFD166]/30"
                : "flex items-center justify-between px-5 py-3 border-b border-forensics-orange/40 bg-forensics-orange/10"
            }>
              <div className="flex items-center gap-2">
                <span className={isBrainCity ? "font-bangers tracking-wide text-xl text-braincity-text" : "text-forensics-orange font-mono text-xs tracking-widest"}>
                  {isBrainCity ? "DOSSIER SUSPECT STREAM DECK" : "STREAM DECK — DOSSIER SUSPECT"}
                </span>
                {isPlaying && (
                  <span className={isBrainCity ? "inline-flex items-center gap-1 text-sm font-bangers tracking-wide text-[#06D6A0]" : "inline-flex items-center gap-1 text-xs font-mono text-forensics-green"}>
                    <span className={`w-2 h-2 rounded-full ${isBrainCity ? 'bg-[#06D6A0]' : 'bg-forensics-green'} animate-pulse`} />
                    {isBrainCity ? "EN ÉCOUTE..." : "EN LECTURE"}
                  </span>
                )}
              </div>
              <button
                onClick={handleClose}
                className={isBrainCity ? "text-braincity-dim hover:text-braincity-coral font-bangers text-2xl leading-none" : "text-gray-400 hover:text-white font-mono text-lg leading-none"}
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="flex gap-6 p-6">
              {/* Photo */}
              <div className={
                isBrainCity
                  ? "shrink-0 w-40 h-40 rounded-[16px] overflow-hidden border-4 border-braincity-border bg-white"
                  : "shrink-0 w-40 h-40 rounded-lg overflow-hidden border border-forensics-orange/40"
              }>
                <img
                  src={suspect.photoUrl}
                  alt={suspect.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 space-y-3">
                <div>
                  <h2 className={isBrainCity ? "text-4xl font-bangers text-braincity-blue tracking-wide" : "text-2xl font-bold text-forensics-orange font-mono"}>
                    {suspect.name}
                  </h2>
                  <p className={isBrainCity ? "text-lg text-braincity-dim font-fredoka font-medium" : "text-sm text-gray-400 font-mono"}>{suspect.role}</p>
                </div>

                {/* Alibi */}
                <div className={isBrainCity ? "bg-white border-4 border-braincity-border rounded-[16px] p-3 shadow-sm" : "bg-forensics-bg border border-forensics-orange/30 rounded p-3"}>
                  <p className={isBrainCity ? "text-lg text-braincity-coral font-bangers tracking-wide mb-1" : "text-xs text-forensics-orange font-mono mb-1"}>ALIBI</p>
                  <p className={isBrainCity ? "text-sm text-braincity-text font-fredoka font-medium" : "text-sm text-gray-300 font-mono"}>{suspect.notes}</p>
                </div>

              </div>
            </div>

            {/* Voice controls */}
            <div className={isBrainCity ? "px-6 pb-6 space-y-5" : "px-6 pb-6 space-y-4 border-t border-forensics-orange/20 pt-4"}>
              <p className={isBrainCity ? "text-xl text-braincity-text font-bangers tracking-wide" : "text-xs text-forensics-orange font-mono tracking-widest"}>
                {isBrainCity ? "JOUET VOCAL" : "MODIFICATION VOCALE"}
              </p>

              {/* Pitch slider */}
              <div className={isBrainCity ? "bg-white border-4 border-braincity-border rounded-[16px] p-4 shadow-sm space-y-2" : "space-y-2"}>
                <div className={isBrainCity ? "flex justify-between items-center text-sm font-fredoka font-semibold text-braincity-dim" : "flex justify-between items-center text-xs font-mono text-gray-400"}>
                  <span>Grave &amp; Lent</span>
                  <span className={isBrainCity ? "font-bangers tracking-wide text-lg text-braincity-text flex items-center gap-2 bg-gray-100 px-2 rounded-full border-2 border-gray-200" : "text-forensics-orange font-bold text-sm"}>
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
                  className={isBrainCity ? "w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer" : "w-full accent-forensics-orange cursor-pointer"}
                  style={isBrainCity ? { accentColor: '#118AB2' } : {}}
                />
                <div className={isBrainCity ? "flex justify-between text-xs font-fredoka font-medium text-gray-400" : "flex justify-between text-[10px] font-mono text-gray-600"}>
                  <span>×{MIN_PITCH}</span>
                  <button
                    onClick={() => setSuspectVoicePitch(1.0)}
                    className={isBrainCity ? "text-braincity-blue hover:text-braincity-coral font-bold transition-colors" : "text-gray-500 hover:text-forensics-orange transition-colors"}
                  >
                    RESET
                  </button>
                  <span>×{MAX_PITCH}</span>
                </div>
              </div>

              {/* Play/Stop */}
              <button
                onClick={handleTogglePlay}
                className={
                  isBrainCity
                    ? `w-full py-3 mt-2 font-bangers text-2xl tracking-widest rounded-[16px] border-4 border-braincity-border flex items-center justify-center transition-all active:translate-y-1 ${
                        isPlaying
                          ? 'bg-[#EF476F] text-white shadow-[0_4px_0_0_#073B4C]'
                          : 'bg-[#118AB2] text-white shadow-[0_6px_0_0_#073B4C] hover:bg-[#0E7A9D]'
                      }`
                    : `w-full py-2.5 font-mono font-bold text-sm rounded transition-all border ${
                        isPlaying
                          ? 'bg-forensics-orange text-forensics-bg border-forensics-orange'
                          : 'bg-forensics-bg border-forensics-orange text-forensics-orange hover:bg-forensics-orange/10'
                      }`
                }
                style={isBrainCity && isPlaying ? { transform: 'translateY(2px)' } : {}}
              >
                {isPlaying ? (isBrainCity ? '⏹ ARRÊTER' : '⏹ STOPPER LA VOIX') : (isBrainCity ? '▶ ÉCOUTER' : '▶ ÉCOUTER LA VOIX')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuspectPopupModal;
