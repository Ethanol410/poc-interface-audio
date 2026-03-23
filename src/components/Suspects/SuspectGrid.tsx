import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Suspect } from '@/types/suspects';
import { useAudioStore } from '@/stores/audioStore';
import { audioEngine } from '@/services/audioEngine';
import { getScenario } from '@/data/scenarios';

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

  const [suspects, setSuspects] = useState<Suspect[]>(
    scenario.suspects.map((s) => ({ ...s, isIdentified: false }))
  );
  const [selectedSuspect, setSelectedSuspect] = useState<Suspect | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [identifiedSuspect, setIdentifiedSuspect] = useState<Suspect | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Persist HTMLAudioElement per suspect so we can connect each to the filter chain once
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  // Map suspect slot → audio URL
  const suspectAudioUrls: Record<string, string | undefined> = {};
  scenario.suspects.forEach((s, i) => {
    const key = `suspect${i + 1}` as keyof typeof audioUrls;
    suspectAudioUrls[s.id] = audioUrls?.[key] as string | undefined;
  });

  // Reset suspects list if scenario changes
  useEffect(() => {
    setSuspects(scenario.suspects.map((s) => ({ ...s, isIdentified: false })));
    // Clean up audio elements from previous scenario
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

    // Pause any currently playing suspect
    if (playingId) {
      audioElementsRef.current.get(playingId)?.pause();
    }

    const el = getOrCreateAudioElement(suspect.id, url);
    el.playbackRate = suspectVoicePitch;
    // Route through the filter chain
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
          <h1 className="text-4xl font-bold text-forensics-cyan font-mono mb-1">
            IDENTIFICATION SUSPECT
          </h1>
          <p className="text-gray-400 font-mono text-sm">{scenario.title}</p>
        </motion.header>

        {/* Instructions */}
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

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {suspects.map((suspect, index) => {
            const storedNote = suspectNotes[suspect.id] ?? suspect.notes;
            return (
              <motion.div
                key={suspect.id}
                className={`bg-forensics-bg-light border-2 rounded-lg overflow-hidden ${
                  suspect.isIdentified ? 'border-forensics-green' : 'border-forensics-cyan-dark'
                } hover:border-forensics-cyan transition-all`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Photo */}
                <div className="relative aspect-square bg-gray-800">
                  <img
                    src={suspect.photoUrl}
                    alt={suspect.name}
                    className="w-full h-full object-cover opacity-80"
                  />
                  {suspect.isIdentified && (
                    <div className="absolute inset-0 bg-forensics-green/20 flex items-center justify-center">
                      <span className="text-6xl">✓</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-forensics-cyan font-mono">{suspect.name}</h3>
                  <p className="text-sm text-gray-400 font-mono mb-3">{suspect.role}</p>

                  {/* Match score */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-gray-500">CONCORDANCE VOCALE</span>
                      <span className={scenario.matchScores[suspect.id] >= 80 ? 'text-forensics-red font-bold' : 'text-gray-500'}>
                        {scenario.matchScores[suspect.id]}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-forensics-bg rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          scenario.matchScores[suspect.id] >= 80
                            ? 'bg-forensics-red'
                            : scenario.matchScores[suspect.id] >= 40
                            ? 'bg-forensics-orange'
                            : 'bg-forensics-cyan-dark'
                        }`}
                        style={{ width: `${scenario.matchScores[suspect.id]}%` }}
                      />
                    </div>
                  </div>

                  {/* Notes indicator */}
                  {storedNote && (
                    <div className="mb-3 p-2 bg-forensics-cyan/10 border border-forensics-cyan-dark rounded">
                      <p className="text-xs text-gray-400 font-mono truncate">📝 {storedNote}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handlePlayVoice(suspect)}
                      disabled={!suspectAudioUrls[suspect.id]}
                      className={`w-full px-3 py-2 font-mono text-sm rounded transition-all border ${
                        playingId === suspect.id
                          ? 'bg-forensics-cyan text-forensics-bg border-forensics-cyan font-bold'
                          : 'bg-forensics-bg border-forensics-cyan-dark text-forensics-cyan hover:border-forensics-cyan'
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      {playingId === suspect.id ? '⏹ STOP VOIX' : '▶ ÉCOUTER (FILTRES ON)'}
                    </button>
                    <button
                      onClick={() => { setSelectedSuspect(suspect); setShowNotesModal(true); }}
                      className="w-full px-3 py-2 bg-forensics-bg border border-forensics-cyan-dark text-forensics-cyan font-mono text-sm rounded hover:border-forensics-cyan transition-all"
                    >
                      NOTES
                    </button>
                    <button
                      onClick={() => { setIdentifiedSuspect(suspect); setShowConfirmDialog(true); }}
                      disabled={suspect.isIdentified}
                      className="w-full px-3 py-2 bg-forensics-green text-forensics-bg font-mono font-bold text-sm rounded hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {suspect.isIdentified ? '✓ IDENTIFIÉ' : '🎯 IDENTIFIER'}
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
            className="px-6 py-3 bg-forensics-bg-light border border-forensics-cyan text-forensics-cyan font-mono rounded hover:bg-forensics-cyan hover:text-forensics-bg transition-all"
          >
            ← RETOUR À L'ANALYSE
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
              className="bg-forensics-bg-light border-2 border-red-500 rounded-lg p-6 max-w-md w-full"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SuspectGrid;
