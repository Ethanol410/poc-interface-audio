/**
 * StreamDeckSuspectPanel — connexion et guide visuel du 2ème Stream Deck+ (suspects).
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStreamDeckSuspect } from '@/hooks/useStreamDeckSuspect';
import Spinner from '@/components/Layout/Spinner';

const SUSPECT_BUTTONS = [
  { label: 'Suspect 1', color: '#fbbf24' },
  { label: 'Suspect 2', color: '#f87171' },
  { label: 'Suspect 3', color: '#4ade80' },
  { label: 'Suspect 4', color: '#818cf8' },
  { label: '⏹ Stop',    color: '#3d6a7a' },
  { label: '🔁 Boucle', color: '#22d3ee' },
  { label: '🐢 Lent',   color: '#fbbf24' },
  { label: '↺  Reset',  color: '#f87171' },
];

const SUSPECT_DIALS = [
  { label: 'Volume',      sub: 'Push → muet',          color: '#22d3ee' },
  { label: 'Pitch vocal', sub: 'Push → réinitialiser', color: '#fbbf24' },
  { label: 'Pitch bar',   sub: 'LCD info',             color: '#334455' },
  { label: 'Alibi',       sub: 'LCD info',             color: '#334455' },
];

const StreamDeckSuspectPanel = () => {
  const { isConnected, isConnecting, isSupported, error, connect, disconnect } = useStreamDeckSuspect();
  const [isOpen, setIsOpen] = useState(false);

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
            style={{ color: isConnected ? '#fbbf24' : '#4a5a3a' }}
          >
            STREAM DECK+ SUSPECTS
          </span>
          {isConnected && (
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
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
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                    <span className="text-[11px] font-mono" style={{ color: '#fbbf24' }}>
                      Connecté
                    </span>
                    <button
                      onClick={disconnect}
                      type="button"
                      className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded border"
                      style={{ borderColor: '#3d1a1a', color: '#f87171' }}
                    >
                      Déconnecter
                    </button>
                  </div>

                  {/* Buttons grid */}
                  <div>
                    <p className="text-[9px] font-mono tracking-widest uppercase mb-1.5" style={{ color: '#2d4a5a' }}>
                      Boutons (haut)
                    </p>
                    <div className="grid grid-cols-4 gap-1">
                      {SUSPECT_BUTTONS.map(({ label, color }, i) => (
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

                  {/* Dials */}
                  <div>
                    <p className="text-[9px] font-mono tracking-widest uppercase mb-1.5" style={{ color: '#2d4a5a' }}>
                      Molettes (bas)
                    </p>
                    <div className="grid grid-cols-4 gap-1">
                      {SUSPECT_DIALS.map(({ label, sub, color }, i) => (
                        <div
                          key={i}
                          className="rounded p-1.5 text-center border"
                          style={{ borderColor: `${color}40`, backgroundColor: `${color}0a` }}
                        >
                          <div className="text-[10px] mb-0.5 font-bold leading-none" style={{ color }}>
                            {i < 2 ? '⟳' : '📺'}
                          </div>
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
                </>
              ) : (
                <>
                  <p className="text-[11px] font-mono" style={{ color: '#4a6070' }}>
                    Connectez votre 2ème Stream Deck+ pour écouter les suspects via les boutons physiques.
                  </p>
                  {error && (
                    <p className="text-[11px] font-mono" style={{ color: '#f87171' }}>{error}</p>
                  )}
                  <button
                    onClick={connect}
                    disabled={isConnecting}
                    type="button"
                    className="w-full py-2 text-[11px] font-mono font-bold rounded border transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ borderColor: '#fbbf2450', color: '#fbbf24', backgroundColor: '#fbbf240a' }}
                  >
                    {isConnecting ? (
                      <Spinner size="sm" color="border-forensics-orange" label="Connexion..." />
                    ) : (
                      'Connecter Stream Deck Suspects'
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

export default StreamDeckSuspectPanel;
