import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Suspect } from '@/types/suspects';
import { useAudioStore } from '@/stores/audioStore';
import { audioEngine } from '@/services/audioEngine';
import { getScenario } from '@/data/scenarios';
import { useScenarioTheme } from '@/hooks/useScenarioTheme';
import RicardoBubble from '@/components/BrainCity/RicardoBubble';
import AccusationOverlay from '@/components/Suspects/AccusationOverlay';


const BC_CARD = 'bg-white border-4 border-[#073B4C] rounded-[32px] overflow-hidden shadow-[0_6px_0_0_#073B4C]';

interface NotesModalProps {
  suspect: Suspect;
  initialNote: string;
  onClose: () => void;
  onSave: (notes: string) => void;
}

const NotesModal = ({ suspect, initialNote, onClose, onSave }: NotesModalProps) => {
  const [notes, setNotes] = useState(initialNote);

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-forensics-bg-light border-2 border-forensics-cyan rounded-lg p-6 max-w-md w-full"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-forensics-cyan font-mono mb-4">
          NOTES — {suspect.name}
        </h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full h-32 bg-forensics-bg border border-forensics-cyan-dark text-white p-3 rounded font-mono text-sm focus:outline-none focus:border-forensics-cyan resize-none"
          placeholder="Entrez vos observations..."
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => { onSave(notes); onClose(); }}
            className="flex-1 bg-forensics-green text-forensics-bg font-mono font-bold py-2 rounded hover:bg-white transition-colors"
          >
            ENREGISTRER
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 text-white font-mono font-bold py-2 rounded hover:bg-gray-600 transition-colors"
          >
            ANNULER
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const SuspectGrid = () => {
  const navigate = useNavigate();
  const { audioUrls, scenario: scenarioId, suspectNotes, setSuspectNote, suspectVoicePitch } = useAudioStore();
  const scenario = getScenario(scenarioId);
  const { isBrainCity } = useScenarioTheme();


  const [suspects, setSuspects] = useState<Suspect[]>(
    scenario.suspects.map((s) => ({ ...s, isIdentified: false }))
  );
  const [selectedSuspect, setSelectedSuspect] = useState<Suspect | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [identifiedSuspect, setIdentifiedSuspect] = useState<Suspect | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [hoveredSuspectId, setHoveredSuspectId] = useState<string | null>(null);
  const [showAccusation, setShowAccusation] = useState(false);

  const ricardoSuspectMessage = (() => {
    if (!hoveredSuspectId) return "🎧 Survole un suspect pour avoir mon avis — compare avec l'enregistrement !";
    return scenario.ricardoLines?.suspectComments[hoveredSuspectId]
      ?? "🎧 Écoute sa voix et compare avec l'enregistrement !";
  })();

  const ricardoSuspectEmotion = hoveredSuspectId === scenario.guiltyId ? 'excited' : 'thinking';

  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  const suspectAudioUrls: Record<string, string | undefined> = {};
  scenario.suspects.forEach((s, i) => {
    const key = `suspect${i + 1}` as keyof typeof audioUrls;
    suspectAudioUrls[s.id] = audioUrls?.[key] as string | undefined;
  });

  useEffect(() => {
    setSuspects(scenario.suspects.map((s) => ({ ...s, isIdentified: false })));
    audioElementsRef.current.forEach((el) => { el.pause(); });
    audioElementsRef.current.clear();
    setPlayingId(null);
  }, [scenarioId, scenario.suspects]);

  const getOrCreateAudioElement = (suspectId: string, url: string): HTMLAudioElement => {
    if (!audioElementsRef.current.has(suspectId)) {
      const el = new Audio(url);
      el.onended = () => setPlayingId(null);
      audioElementsRef.current.set(suspectId, el);
    }
    return audioElementsRef.current.get(suspectId)!;
  };

  const handlePlayVoice = (suspect: Suspect) => {
    const url = suspectAudioUrls[suspect.id];
    if (!url) return;

    if (playingId === suspect.id) {
      audioElementsRef.current.get(suspect.id)?.pause();
      setPlayingId(null);
      return;
    }

    if (playingId) {
      audioElementsRef.current.get(playingId)?.pause();
    }

    const el = getOrCreateAudioElement(suspect.id, url);
    el.playbackRate = suspectVoicePitch;
    audioEngine.connectSuspectElement(el);
    el.play();
    setPlayingId(suspect.id);
  };

  useEffect(() => {
    const elements = audioElementsRef.current;
    return () => {
      elements.forEach((el) => { el.pause(); });
    };
  }, []);

  const handleSaveNotes = (suspectId: string, notes: string) => {
    setSuspectNote(suspectId, notes);
  };

  const confirmIdentification = () => {
    if (identifiedSuspect) {
      setSuspects(suspects.map((s) => s.id === identifiedSuspect.id ? { ...s, isIdentified: true } : s));
      setShowConfirmDialog(false);
      setShowAccusation(true);
      setTimeout(() => {
        navigate('/debrief', { state: { suspect: identifiedSuspect } });
      }, 2000);
    }
  };

  return (
    <div className={`min-h-screen p-6 ${isBrainCity ? 'bg-[#FFF9EC]' : ''}`} style={isBrainCity ? { backgroundImage: 'radial-gradient(circle, #E0D4C3 2px, transparent 2px)', backgroundSize: '24px 24px' } : {}}>
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <motion.header
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {isBrainCity ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img src="/images/inspecteur/Ricardo_Pouleto_sticker.png" alt="Ricardo" className="w-10 h-10 object-contain" />
                <div>
                  <h1 className="text-4xl font-bangers tracking-wider text-[#EF476F]">QUI A FAIT ÇA ? 🤔</h1>
                  <p className="text-[#6b7280] font-fredoka font-semibold text-sm mt-1">{scenario.title}</p>
                </div>
              </div>
              <RicardoBubble
                message={ricardoSuspectMessage}
                emotion={hoveredSuspectId ? ricardoSuspectEmotion : 'neutral'}
              />
            </div>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-forensics-cyan font-mono mb-1">
                IDENTIFICATION SUSPECT
              </h1>
              <p className="text-gray-400 font-mono text-sm">{scenario.title}</p>
            </>
          )}
        </motion.header>

        {/* Instructions — adult only */}
        {!isBrainCity && (
          <motion.div
            className="bg-forensics-cyan/10 border border-forensics-cyan rounded-lg p-4 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-forensics-cyan font-mono text-sm">
              Écoutez attentivement chaque voix — les filtres actifs s'appliquent. Prenez des notes. Lorsque vous êtes certain, cliquez sur "IDENTIFIER".
            </p>
          </motion.div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {suspects.map((suspect, index) => {
            const storedNote = suspectNotes[suspect.id] ?? suspect.notes;
            return (
              <motion.div
                key={suspect.id}
                className={`transition-all ${
                  isBrainCity
                    ? `bg-white rounded-[32px] border-4 ${suspect.isIdentified ? 'border-[#06D6A0]' : 'border-[#073B4C]'} overflow-hidden shadow-[0_6px_0_0_#073B4C]`
                    : `bg-forensics-bg-light border-2 rounded-lg ${
                        suspect.isIdentified ? 'border-forensics-green' : 'border-forensics-cyan-dark'
                      } hover:border-forensics-cyan overflow-hidden`
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onMouseEnter={() => setHoveredSuspectId(suspect.id)}
                onMouseLeave={() => setHoveredSuspectId(null)}
              >
                {/* Photo */}
                <div className={`relative bg-gray-800 ${isBrainCity ? 'h-40' : 'aspect-square'}`}>
                  <img
                    src={suspect.photoUrl}
                    alt={suspect.name}
                    className={`w-full h-full ${isBrainCity ? 'object-contain p-2' : 'object-cover opacity-80'}`}
                  />
                  {suspect.isIdentified && (
                    <div className={`absolute inset-0 flex items-center justify-center ${isBrainCity ? 'bg-[#06D6A0]/20 rounded-t-2xl' : 'bg-forensics-green/20'}`}>
                      <span className="text-6xl">{isBrainCity ? '✅' : '✓'}</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className={`text-xl font-bangers tracking-wide mb-0.5 ${isBrainCity ? 'text-[#073B4C]' : 'text-forensics-cyan font-mono'}`}>
                    {suspect.name.toUpperCase()}
                  </h3>
                  <p className={`text-sm mb-3 ${isBrainCity ? 'text-[#6b7280] font-fredoka font-semibold' : 'text-gray-400 font-mono'}`}>
                    {suspect.role}
                  </p>

                  {/* Notes indicator — adult only */}
                  {!isBrainCity && storedNote && (
                    <div className="mb-3 p-2 bg-forensics-cyan/10 border border-forensics-cyan-dark rounded">
                      <p className="text-xs text-gray-400 font-mono truncate">📝 {storedNote}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handlePlayVoice(suspect)}
                      disabled={!suspectAudioUrls[suspect.id]}
                      className={`w-full px-3 py-2 font-bold text-sm transition-all border-2 ${
                        isBrainCity
                          ? playingId === suspect.id
                            ? 'bg-[#FFF9EC] text-[#118AB2] border-[#073B4C] rounded-xl font-fredoka shadow-[0_2px_0_0_#073B4C] translate-y-[2px]'
                            : 'bg-white border-[#073B4C] text-[#073B4C] rounded-xl font-fredoka hover:shadow-[0_4px_0_0_#073B4C] hover:-translate-y-[2px] shadow-[0_2px_0_0_#073B4C]'
                          : playingId === suspect.id
                          ? 'bg-forensics-cyan text-forensics-bg border-forensics-cyan font-mono rounded-xl'
                          : 'bg-forensics-bg border-forensics-cyan-dark text-forensics-cyan font-mono hover:border-forensics-cyan rounded-xl'
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      {playingId === suspect.id
                        ? (isBrainCity ? '⏹ Stop' : '⏹ STOP VOIX')
                        : (isBrainCity ? '▶ Écouter sa voix' : '▶ ÉCOUTER (FILTRES ON)')}
                    </button>

                    {!isBrainCity && (
                      <button
                        onClick={() => { setSelectedSuspect(suspect); setShowNotesModal(true); }}
                        className="w-full px-3 py-2 bg-forensics-bg border border-forensics-cyan-dark text-forensics-cyan font-mono text-sm rounded hover:border-forensics-cyan transition-all"
                      >
                        NOTES
                      </button>
                    )}

                    <button
                      onClick={() => { setIdentifiedSuspect(suspect); setShowConfirmDialog(true); }}
                      disabled={suspect.isIdentified}
                      className={`w-full px-3 py-3 font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        isBrainCity
                          ? suspect.isIdentified
                            ? 'bg-white text-[#06D6A0] border-4 border-[#073B4C] rounded-xl font-bangers tracking-wider text-xl shadow-[0_0_0_0_#073B4C] translate-y-[4px]'
                            : 'bg-[#EF476F] text-white border-4 border-[#073B4C] rounded-xl font-bangers tracking-wider text-xl hover:shadow-[0_6px_0_0_#073B4C] hover:-translate-y-[2px] shadow-[0_4px_0_0_#073B4C]'
                          : 'bg-forensics-green text-forensics-bg font-mono hover:bg-white rounded-xl'
                      }`}
                    >
                      {suspect.isIdentified
                        ? (isBrainCity ? '✅ Accusé !' : '✓ IDENTIFIÉ')
                        : (isBrainCity
                          ? `🎯 C'est ${suspect.name.split(' ')[0]} !`
                          : '🎯 IDENTIFIER')}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Back */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={() => navigate('/workspace')}
            className={`px-6 py-3 transition-all ${
              isBrainCity
                ? 'bg-white border-4 border-[#073B4C] text-[#073B4C] font-bangers text-xl tracking-wider rounded-[16px] hover:shadow-[0_6px_0_0_#073B4C] hover:-translate-y-[2px] shadow-[0_4px_0_0_#073B4C]'
                : 'bg-forensics-bg-light border border-forensics-cyan text-forensics-cyan font-mono hover:bg-forensics-cyan hover:text-forensics-bg rounded-2xl font-bold'
            }`}
          >
            {isBrainCity ? '← Retour à l\'analyse' : '← RETOUR À L\'ANALYSE'}
          </button>
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showNotesModal && selectedSuspect && (
          <NotesModal
            suspect={selectedSuspect}
            initialNote={suspectNotes[selectedSuspect.id] ?? selectedSuspect.notes}
            onClose={() => setShowNotesModal(false)}
            onSave={(notes) => handleSaveNotes(selectedSuspect.id, notes)}
          />
        )}

        {showAccusation && identifiedSuspect && (
          <AccusationOverlay
            isCorrect={identifiedSuspect.id === scenario.guiltyId}
            isBrainCity={isBrainCity}
          />
        )}

        {showConfirmDialog && identifiedSuspect && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`p-8 max-w-md w-full ${
                isBrainCity
                  ? BC_CARD + ' bg-braincity-bg'
                  : 'bg-forensics-bg-light border-2 border-red-500 rounded-2xl'
              }`}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              {isBrainCity ? (
                <>
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-4">🤔</div>
                    <h3 className="text-3xl font-bangers tracking-wider text-[#073B4C]">
                      Tu es sûr(e) que c'est {identifiedSuspect.name} ?
                    </h3>
                  </div>
                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={confirmIdentification}
                      className="flex-1 text-white font-bangers text-xl bg-[#EF476F] border-4 border-[#073B4C] py-4 rounded-2xl shadow-[0_4px_0_0_#073B4C] hover:-translate-y-[2px] hover:shadow-[0_6px_0_0_#073B4C] active:translate-y-[4px] active:shadow-[0_0_0_0_#073B4C] transition-all"
                    >
                      🎯 OUI !
                    </button>
                    <button
                      onClick={() => setShowConfirmDialog(false)}
                      className="flex-1 bg-white text-[#073B4C] border-4 border-[#073B4C] font-bangers text-xl py-4 rounded-2xl shadow-[0_4px_0_0_#073B4C] hover:-translate-y-[2px] hover:shadow-[0_6px_0_0_#073B4C] active:translate-y-[4px] active:shadow-[0_0_0_0_#073B4C] transition-all"
                    >
                      NON, RETOUR
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-red-500 font-mono mb-4">⚠️ CONFIRMATION</h3>
                  <p className="text-white font-mono mb-6">
                    Êtes-vous certain d'identifier{' '}
                    <strong className="text-forensics-cyan">{identifiedSuspect.name}</strong> ?
                  </p>
                  <p className="text-gray-400 font-mono text-sm mb-6">
                    Cette action est irréversible et déterminera le résultat de l'enquête.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={confirmIdentification}
                      className="flex-1 bg-red-500 text-white font-mono font-bold py-3 rounded hover:bg-red-600 transition-colors"
                    >
                      CONFIRMER
                    </button>
                    <button
                      onClick={() => setShowConfirmDialog(false)}
                      className="flex-1 bg-gray-700 text-white font-mono font-bold py-3 rounded hover:bg-gray-600 transition-colors"
                    >
                      ANNULER
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SuspectGrid;
