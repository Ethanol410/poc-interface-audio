import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Suspect } from '@/types/suspects';
import { useAudioStore } from '@/stores/audioStore';
import { audioEngine } from '@/services/audioEngine';
import { getScenario } from '@/data/scenarios';
import { useScenarioTheme } from '@/hooks/useScenarioTheme';
import RicardoBubble from '@/components/BrainCity/RicardoBubble';

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
      setTimeout(() => {
        navigate('/debrief', { state: { suspect: identifiedSuspect } });
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen p-6">
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
                  <h1 className="text-3xl font-black text-braincity-primary">Qui a fait ça ? 🤔</h1>
                  <p className="text-gray-400 font-semibold text-sm">{scenario.title}</p>
                </div>
              </div>
              <RicardoBubble message="🎧 Clique sur ▶ pour écouter chaque voix — compare avec l'enregistrement !" />
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
            const matchScore = scenario.matchScores[suspect.id];
            return (
              <motion.div
                key={suspect.id}
                className={`rounded-2xl overflow-hidden transition-all ${
                  isBrainCity
                    ? `bg-white shadow-md border-2 ${suspect.isIdentified ? 'border-braincity-success' : 'border-gray-100'} hover:shadow-lg`
                    : `bg-forensics-bg-light border-2 rounded-lg ${
                        suspect.isIdentified ? 'border-forensics-green' : 'border-forensics-cyan-dark'
                      } hover:border-forensics-cyan`
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Photo */}
                <div className={`relative bg-gray-800 ${isBrainCity ? 'h-40' : 'aspect-square'}`}>
                  <img
                    src={suspect.photoUrl}
                    alt={suspect.name}
                    className={`w-full h-full ${isBrainCity ? 'object-contain p-2' : 'object-cover opacity-80'}`}
                  />
                  {suspect.isIdentified && (
                    <div className={`absolute inset-0 flex items-center justify-center ${isBrainCity ? 'bg-braincity-success/20 rounded-t-2xl' : 'bg-forensics-green/20'}`}>
                      <span className="text-6xl">{isBrainCity ? '✅' : '✓'}</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className={`text-lg font-bold mb-0.5 ${isBrainCity ? 'text-gray-800' : 'text-forensics-cyan font-mono'}`}>
                    {suspect.name}
                  </h3>
                  <p className={`text-sm mb-3 ${isBrainCity ? 'text-gray-500 font-medium' : 'text-gray-400 font-mono'}`}>
                    {suspect.role}
                  </p>

                  {/* Match score */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className={isBrainCity ? 'text-gray-400 font-semibold' : 'text-gray-500 font-mono'}>
                        {isBrainCity ? 'Ressemblance vocale' : 'CONCORDANCE VOCALE'}
                      </span>
                      <span className={`font-bold ${matchScore >= 80 ? 'text-red-500' : isBrainCity ? 'text-gray-400' : 'text-gray-500 font-mono'}`}>
                        {matchScore}%
                      </span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${isBrainCity ? 'bg-gray-100' : 'bg-forensics-bg'}`}>
                      {isBrainCity ? (
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${matchScore}%`,
                            background: matchScore >= 80
                              ? 'linear-gradient(90deg, #f97316, #ef4444)'
                              : 'linear-gradient(90deg, #22d3ee, #84cc16)',
                          }}
                        />
                      ) : (
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            matchScore >= 80
                              ? 'bg-forensics-red'
                              : matchScore >= 40
                              ? 'bg-forensics-orange'
                              : 'bg-forensics-cyan-dark'
                          }`}
                          style={{ width: `${matchScore}%` }}
                        />
                      )}
                    </div>
                  </div>

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
                      className={`w-full px-3 py-2 font-bold text-sm rounded-xl transition-all border-2 ${
                        isBrainCity
                          ? playingId === suspect.id
                            ? 'bg-braincity-primary text-white border-braincity-primary'
                            : 'bg-sky-50 border-sky-200 text-braincity-primary hover:border-braincity-primary'
                          : playingId === suspect.id
                          ? 'bg-forensics-cyan text-forensics-bg border-forensics-cyan font-mono'
                          : 'bg-forensics-bg border-forensics-cyan-dark text-forensics-cyan font-mono hover:border-forensics-cyan'
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
                      className={`w-full px-3 py-2 font-bold text-sm rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        isBrainCity
                          ? 'text-white'
                          : 'bg-forensics-green text-forensics-bg font-mono hover:bg-white'
                      }`}
                      style={isBrainCity ? { background: 'linear-gradient(90deg, #f97316, #ef4444)' } : {}}
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
            className={`px-6 py-3 rounded-2xl font-bold transition-all ${
              isBrainCity
                ? 'bg-white border-2 border-sky-200 text-braincity-primary hover:bg-sky-50'
                : 'bg-forensics-bg-light border border-forensics-cyan text-forensics-cyan font-mono hover:bg-forensics-cyan hover:text-forensics-bg'
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

        {showConfirmDialog && identifiedSuspect && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`p-6 max-w-md w-full rounded-2xl ${
                isBrainCity
                  ? 'bg-white shadow-2xl'
                  : 'bg-forensics-bg-light border-2 border-red-500'
              }`}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              {isBrainCity ? (
                <>
                  <div className="text-center mb-4">
                    <div className="text-5xl mb-2">🤔</div>
                    <h3 className="text-xl font-black text-gray-800">
                      Tu es sûr(e) que c'est {identifiedSuspect.name} ?
                    </h3>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={confirmIdentification}
                      className="flex-1 text-white font-black py-3 rounded-2xl"
                      style={{ background: 'linear-gradient(90deg, #f97316, #ef4444)' }}
                    >
                      🎯 OUI, j'accuse !
                    </button>
                    <button
                      onClick={() => setShowConfirmDialog(false)}
                      className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-2xl hover:bg-gray-200 transition-colors"
                    >
                      Non, je cherche encore
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
