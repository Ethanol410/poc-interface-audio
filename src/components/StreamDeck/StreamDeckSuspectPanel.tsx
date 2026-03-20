/**
 * StreamDeckSuspectPanel — panneau de connexion du 2ème Stream Deck (suspects).
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStreamDeckSuspect } from '@/hooks/useStreamDeckSuspect';

const StreamDeckSuspectPanel = () => {
  const { isConnected, isSupported, error, connect, disconnect } = useStreamDeckSuspect();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-forensics-bg-light border border-forensics-cyan-dark rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-forensics-orange font-mono tracking-wider">
            STREAM DECK+ SUSPECTS
          </span>
          {isConnected && (
            <span className="w-2 h-2 rounded-full bg-forensics-green animate-pulse" />
          )}
        </div>
        <span className="text-gray-500 text-xs font-mono">{isOpen ? '▲' : '▼'}</span>
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
            <div className="px-4 pb-4 pt-1 space-y-3">
              {!isSupported ? (
                <p className="text-xs font-mono text-gray-500">
                  WebHID non disponible.
                  <br />
                  Utilisez Chrome ou Edge.
                </p>
              ) : isConnected ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-forensics-green" />
                    <span className="text-xs font-mono text-forensics-green">
                      2ème Stream Deck connecté
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-gray-500 space-y-0.5">
                    <div>● Boutons 0–3 : écouter la voix d'un suspect</div>
                    <div>● Bouton 4 : arrêter la lecture</div>
                    <div>● LCD : infos du suspect en cours d'écoute</div>
                  </div>
                  <button
                    onClick={disconnect}
                    className="w-full py-1.5 text-xs font-mono font-bold border border-red-500/50 text-red-400 rounded hover:bg-red-500/10 transition-colors"
                  >
                    Déconnecter
                  </button>
                </>
              ) : (
                <>
                  <p className="text-[11px] font-mono text-gray-400">
                    Connectez votre 2ème Stream Deck+ pour écouter les suspects via les boutons physiques.
                  </p>
                  {error && (
                    <p className="text-[11px] font-mono text-red-400">{error}</p>
                  )}
                  <button
                    onClick={connect}
                    className="w-full py-2 text-xs font-mono font-bold bg-forensics-orange/10 border border-forensics-orange text-forensics-orange rounded hover:bg-forensics-orange/20 transition-colors"
                  >
                    Connecter Stream Deck Suspects
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
