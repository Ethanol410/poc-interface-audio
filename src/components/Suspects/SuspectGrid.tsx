import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Suspect } from '@/types/suspects';
import { useAudioStore } from '@/stores/audioStore';

// Narrative match scores — fictif, cohérent avec le scénario
const MATCH_SCORES: Record<string, number> = {
  'suspect-1': 12,
  'suspect-2': 94,
  'suspect-3': 8,
  'suspect-4': 21,
};

// Mock suspect data — Dossier 84-V "Le Corbeau de Quissioux"
const mockSuspects: Suspect[] = [
  {
    id: 'suspect-1',
    name: 'Bernard Mallet',
    role: 'Gardien d\'immeuble',
    photoUrl: 'https://i.pravatar.cc/300?img=12',
    notes: 'Alibi : "J\'étais à la cave toute la matinée"',
    isIdentified: false,
  },
  {
    id: 'suspect-2',
    name: 'Isabelle Renard',
    role: 'Voisine de palier',
    photoUrl: 'https://i.pravatar.cc/300?img=47',
    notes: 'Alibi : "J\'étais chez ma sœur à Quissioux"',
    isIdentified: false,
  },
  {
    id: 'suspect-3',
    name: 'Karim Daoudi',
    role: 'Livreur',
    photoUrl: 'https://i.pravatar.cc/300?img=33',
    notes: 'Alibi : "En tournée de livraison toute la journée"',
    isIdentified: false,
  },
  {
    id: 'suspect-4',
    name: 'Sylvie Marchand',
    role: 'Institutrice retraitée',
    photoUrl: 'https://i.pravatar.cc/300?img=26',
    notes: 'Alibi : "Cours de jardinage au centre communal"',
    isIdentified: false,
  },
];

interface NotesModalProps {
  suspect: Suspect;
  onClose: () => void;
  onSave: (notes: string) => void;
}

const NotesModal = ({ suspect, onClose, onSave }: NotesModalProps) => {
  const [notes, setNotes] = useState(suspect.notes);

  const handleSave = () => {
    onSave(notes);
    onClose();
  };

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
          NOTES - {suspect.name}
        </h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full h-32 bg-forensics-bg border border-forensics-cyan-dark text-white p-3 rounded font-mono text-sm focus:outline-none focus:border-forensics-cyan resize-none"
          placeholder="Entrez vos observations..."
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleSave}
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
  const { audioUrls } = useAudioStore();
  const [suspects, setSuspects] = useState(mockSuspects);
  const [selectedSuspect, setSelectedSuspect] = useState<Suspect | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [identifiedSuspect, setIdentifiedSuspect] = useState<Suspect | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const voiceUrls: Record<string, string | undefined> = {
    'suspect-1': audioUrls?.suspect1,
    'suspect-2': audioUrls?.suspect2,
    'suspect-3': audioUrls?.suspect3,
    'suspect-4': audioUrls?.suspect4,
  };

  const handlePlayVoice = (suspect: Suspect) => {
    const url = voiceUrls[suspect.id];
    if (!url) return;

    if (playingId === suspect.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play();
    setPlayingId(suspect.id);
    audio.onended = () => setPlayingId(null);
  };

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const handleNotesClick = (suspect: Suspect) => {
    setSelectedSuspect(suspect);
    setShowNotesModal(true);
  };

  const handleSaveNotes = (notes: string) => {
    if (selectedSuspect) {
      setSuspects(
        suspects.map((s) =>
          s.id === selectedSuspect.id ? { ...s, notes } : s
        )
      );
    }
  };

  const handleIdentify = (suspect: Suspect) => {
    setIdentifiedSuspect(suspect);
    setShowConfirmDialog(true);
  };

  const confirmIdentification = () => {
    if (identifiedSuspect) {
      setSuspects(
        suspects.map((s) =>
          s.id === identifiedSuspect.id ? { ...s, isIdentified: true } : s
        )
      );
      setShowConfirmDialog(false);
      
      // Navigate to debrief after delay
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
          <h1 className="text-4xl font-bold text-forensics-cyan font-mono mb-2">
            IDENTIFICATION SUSPECT
          </h1>
          <p className="text-gray-400 font-mono text-sm">
            Comparez la voix restaurée avec les suspects
          </p>
        </motion.header>

        {/* Instructions */}
        <motion.div
          className="bg-forensics-cyan/10 border border-forensics-cyan rounded-lg p-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-forensics-cyan font-mono text-sm">
            💡 Écoutez attentivement chaque voix et prenez des notes. Lorsque vous êtes certain, cliquez sur "IDENTIFIER".
          </p>
        </motion.div>

        {/* Suspects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {suspects.map((suspect, index) => (
            <motion.div
              key={suspect.id}
              className={`
                bg-forensics-bg-light border-2 rounded-lg overflow-hidden
                ${suspect.isIdentified ? 'border-forensics-green' : 'border-forensics-cyan-dark'}
                hover:border-forensics-cyan transition-all
              `}
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
                <h3 className="text-lg font-bold text-forensics-cyan font-mono">
                  {suspect.name}
                </h3>
                <p className="text-sm text-gray-400 font-mono mb-3">
                  {suspect.role}
                </p>

                {/* Match Score */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-gray-500">CONCORDANCE VOCALE</span>
                    <span className={MATCH_SCORES[suspect.id] >= 80 ? 'text-forensics-red font-bold' : 'text-gray-500'}>
                      {MATCH_SCORES[suspect.id]}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-forensics-bg rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        MATCH_SCORES[suspect.id] >= 80
                          ? 'bg-forensics-red'
                          : MATCH_SCORES[suspect.id] >= 40
                          ? 'bg-forensics-orange'
                          : 'bg-forensics-cyan-dark'
                      }`}
                      style={{ width: `${MATCH_SCORES[suspect.id]}%` }}
                    />
                  </div>
                </div>

                {/* Notes indicator */}
                {suspect.notes && (
                  <div className="mb-3 p-2 bg-forensics-cyan/10 border border-forensics-cyan-dark rounded">
                    <p className="text-xs text-gray-400 font-mono truncate">
                      📝 {suspect.notes}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => handlePlayVoice(suspect)}
                    disabled={!voiceUrls[suspect.id]}
                    className={`w-full px-3 py-2 font-mono text-sm rounded transition-all border ${
                      playingId === suspect.id
                        ? 'bg-forensics-cyan text-forensics-bg border-forensics-cyan font-bold'
                        : 'bg-forensics-bg border-forensics-cyan-dark text-forensics-cyan hover:border-forensics-cyan'
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {playingId === suspect.id ? '⏹ STOP VOIX' : '▶ ECOUTER VOIX'}
                  </button>
                  <button
                    onClick={() => handleNotesClick(suspect)}
                    className="w-full px-3 py-2 bg-forensics-bg border border-forensics-cyan-dark text-forensics-cyan font-mono text-sm rounded hover:border-forensics-cyan transition-all"
                  >
                    NOTES
                  </button>
                  <button
                    onClick={() => handleIdentify(suspect)}
                    disabled={suspect.isIdentified}
                    className="w-full px-3 py-2 bg-forensics-green text-forensics-bg font-mono font-bold text-sm rounded hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {suspect.isIdentified ? '✓ IDENTIFIÉ' : '🎯 IDENTIFIER'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Back button */}
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
            onClose={() => setShowNotesModal(false)}
            onSave={handleSaveNotes}
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
              <h3 className="text-2xl font-bold text-red-500 font-mono mb-4">
                ⚠️ CONFIRMATION
              </h3>
              <p className="text-white font-mono mb-6">
                Êtes-vous certain d'identifier <strong className="text-forensics-cyan">{identifiedSuspect.name}</strong> comme étant Le Corbeau de Quissioux ?
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
