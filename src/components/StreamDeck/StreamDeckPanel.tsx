/**
 * StreamDeckPanel — connexion et guide visuel du Stream Deck+ audio.
 * Deux pages : Page A (filtres) et Page B (contrôles avancés).
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStreamDeck } from '@/hooks/useStreamDeck';
import { useAudioStore } from '@/stores/audioStore';
import Spinner from '@/components/Layout/Spinner';

const PAGE_A_BUTTONS = [
  { label: '▶  Lecture',  color: '#4ade80' },
  { label: '◀◀ Inverse',  color: '#fb923c' },
  { label: '🔉 Graves',   color: '#22d3ee' },
  { label: '🔈 Aigus',    color: '#4ade80' },
  { label: '🎤 Voix',     color: '#fbbf24' },
  { label: '⚡ Buzz',     color: '#f87171' },
  { label: '📢 Murmure',  color: '#c084fc' },
  { label: '▼  Avancé',   color: '#4a7090' },
];

const PAGE_B_BUTTONS = [
  { label: '▶  Lecture',  color: '#4ade80' },
  { label: '⚖  Compar',   color: '#22d3ee' },
  { label: '♻  Reset',    color: '#f87171' },
  { label: '○  Brut',     color: '#94a3b8' },
  { label: '🔍 Masque',   color: '#818cf8' },
  { label: '🔬 Analyse',  color: '#34d399' },
  { label: '◀◀ Inverse',  color: '#fb923c' },
  { label: '▲  Filtres',  color: '#4a7090' },
];

const PAGE_A_DIALS = [
  { label: 'Volume',    sub: 'Push → muet',          color: '#22d3ee' },
  { label: 'Graves',    sub: 'Push → activer/off',   color: '#22d3ee' },
  { label: 'Aigus',     sub: 'Push → activer/off',   color: '#4ade80' },
  { label: 'Tonalité',  sub: 'Push → réinitialiser', color: '#818cf8' },
];

const PAGE_B_DIALS = [
  { label: 'Volume',    sub: 'Push → muet',          color: '#22d3ee' },
  { label: 'Voix Hz',   sub: 'Push → activer/off',   color: '#fbbf24' },
  { label: 'Buzz Hz',   sub: 'Push → activer/off',   color: '#f87171' },
  { label: 'Vitesse',   sub: 'Push → réinitialiser', color: '#34d399' },
];

const StreamDeckPanel = () => {
  const { isConnected, isConnecting, isSupported, error, connect, disconnect } = useStreamDeck();
  const scenario = useAudioStore((s) => s.scenario);
  const isBrainCity = scenario === 'braincity';
  const [isOpen, setIsOpen] = useState(false);
  const [viewPage, setViewPage] = useState<'A' | 'B'>('A');

  const activePage = isBrainCity ? 'A' : viewPage;
  const buttons = activePage === 'A' ? PAGE_A_BUTTONS : PAGE_B_BUTTONS;
  const dials   = activePage === 'A' ? PAGE_A_DIALS   : PAGE_B_DIALS;

  return (
    <div
      className="rounded-lg overflow-hidden border"
      style={{ borderColor: '#1e3040', backgroundColor: '#0a1822' }}
    >
      {/* Header */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors"
        style={{ backgroundColor: isOpen ? '#0f2030' : 'transparent' }}
        type="button"
      >
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] font-mono font-bold tracking-wider"
            style={{ color: isConnected ? '#4ade80' : '#3d6a7a' }}
          >
            STREAM DECK+
          </span>
          {isConnected && (
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          )}
        </div>
        <span className="text-[10px] font-mono" style={{ color: '#2d4a5a' }}>
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-4 pt-1 space-y-3">

              {!isSupported ? (
                <p className="text-[11px] font-mono" style={{ color: '#4a6070' }}>
                  WebHID non disponible — utilisez Chrome ou Edge.
                </p>
              ) : isConnected ? (
                <>
                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <span className="text-[11px] font-mono" style={{ color: '#4ade80' }}>
                      Connecté
                    </span>
                    <button
                      onClick={disconnect}
                      className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded border transition-colors"
                      style={{ borderColor: '#3d1a1a', color: '#f87171' }}
                      type="button"
                    >
                      Déconnecter
                    </button>
                  </div>

                  {/* Page tabs — hidden for Brain City (single page only) */}
                  {!isBrainCity && (
                    <div className="flex gap-1">
                      {(['A', 'B'] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => setViewPage(p)}
                          type="button"
                          className="flex-1 py-1 text-[9px] font-mono font-bold rounded border transition-colors"
                          style={{
                            borderColor: viewPage === p ? '#22d3ee50' : '#1e3040',
                            color: viewPage === p ? '#22d3ee' : '#334455',
                            backgroundColor: viewPage === p ? '#22d3ee0a' : 'transparent',
                          }}
                        >
                          {p === 'A' ? '▼ FILTRES' : '▼ AVANCÉ'}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Buttons grid */}
                  <div>
                    <p className="text-[9px] font-mono tracking-widest uppercase mb-1.5" style={{ color: '#2d4a5a' }}>
                      Boutons (haut)
                    </p>
                    <div className="grid grid-cols-4 gap-1">
                      {buttons.map(({ label, color }, i) => (
                        <div
                          key={i}
                          className="rounded p-1.5 text-center border"
                          style={{ borderColor: `${color}40`, backgroundColor: `${color}0a` }}
                        >
                          <div className="text-[9px] font-mono leading-snug" style={{ color }}>
                            {label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dials row */}
                  <div>
                    <p className="text-[9px] font-mono tracking-widest uppercase mb-1.5" style={{ color: '#2d4a5a' }}>
                      Molettes (bas)
                    </p>
                    <div className="grid grid-cols-4 gap-1">
                      {dials.map(({ label, sub, color }, i) => (
                        <div
                          key={i}
                          className="rounded p-1.5 text-center border"
                          style={{ borderColor: `${color}40`, backgroundColor: `${color}0a` }}
                        >
                          <div className="text-[10px] mb-0.5 font-bold leading-none" style={{ color }}>⟳</div>
                          <div className="text-[9px] font-mono leading-tight" style={{ color }}>
                            {label}
                          </div>
                          <div className="text-[8px] font-mono mt-0.5 leading-tight" style={{ color: '#2d4a5a' }}>
                            {sub}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Page hint — only for scenarios with multiple pages */}
                  {!isBrainCity && (
                    <p className="text-[9px] font-mono" style={{ color: '#2d4a5a' }}>
                      Btn 8 → changer de page sur le hardware
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-[11px] font-mono" style={{ color: '#4a6070' }}>
                    Fermez le logiciel Elgato avant de connecter.
                  </p>
                  {error && (
                    <p className="text-[11px] font-mono" style={{ color: '#f87171' }}>{error}</p>
                  )}
                  <button
                    onClick={connect}
                    disabled={isConnecting}
                    type="button"
                    className="w-full py-2 text-[11px] font-mono font-bold rounded border transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ borderColor: '#22d3ee50', color: '#22d3ee', backgroundColor: '#22d3ee0a' }}
                  >
                    {isConnecting ? (
                      <Spinner size="sm" color="border-forensics-cyan" label="Connexion..." />
                    ) : (
                      'Connecter Stream Deck+'
                    )}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StreamDeckPanel;
