import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AccusationOverlayProps {
  isBrainCity: boolean;
  isCorrect: boolean;
  suspectName: string;
  suspectPhotoUrl: string;
  /** Brain City uniquement — callback quand le joueur veut retenter (cas échec) */
  onRetry?: () => void;
  /** Brain City uniquement — callback quand le joueur quitte la partie */
  onQuit?: () => void;
}

type Phase = 'analyzing' | 'verdict' | 'actions';

const BAR_COUNT = 7;
const ANALYSIS_DURATION_MS = 1200;
const VERDICT_DURATION_MS = 1800;

const AccusationOverlay = ({
  isBrainCity,
  isCorrect,
  suspectName,
  suspectPhotoUrl,
  onRetry,
  onQuit,
}: AccusationOverlayProps) => {
  const [phase, setPhase] = useState<Phase>('analyzing');
  const [ricardoFailed, setRicardoFailed] = useState(false);
  const [suspectFailed, setSuspectFailed] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('verdict'), ANALYSIS_DURATION_MS);
    const t2 = setTimeout(
      () => setPhase('actions'),
      ANALYSIS_DURATION_MS + VERDICT_DURATION_MS,
    );
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const ricardoVerdictSrc = isCorrect
    ? '/images/inspecteur/Ricardo_Pouleto_triumphant.png'
    : '/images/inspecteur/Ricardo_Pouleto_scared.png';

  const showActions = phase === 'actions' && (onRetry || onQuit);

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/85" />

      <AnimatePresence mode="wait">
        {/* ── PHASE 1 : ANALYSE ── */}
        {phase === 'analyzing' && (
          <motion.div
            key="analyzing"
            className="relative z-10 flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25 }}
          >
            {!ricardoFailed && (
              <motion.img
                src="/images/inspecteur/Ricardo_Pouleto_thinking.png"
                alt="Ricardo réfléchit"
                onError={() => setRicardoFailed(true)}
                className="w-64 h-64 object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: [0, -5, 5, 0] }}
                transition={{
                  scale: { type: 'spring', stiffness: 180, damping: 14 },
                  rotate: { duration: 1, repeat: Infinity },
                }}
              />
            )}
            <motion.h1
              className={`mt-6 ${isBrainCity ? 'font-bangers text-6xl tracking-widest' : 'font-mono font-bold text-4xl tracking-wider'}`}
              style={{
                color: '#FFD166',
                textShadow: isBrainCity ? '4px 4px 0px #073B4C' : '0 0 20px rgba(0,0,0,0.8)',
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {isBrainCity ? 'ANALYSE…' : 'VÉRIFICATION…'}
            </motion.h1>
          </motion.div>
        )}

        {/* ── PHASE 2 & 3 : VERDICT + ACTIONS ── */}
        {(phase === 'verdict' || phase === 'actions') && (
          <motion.div
            key="verdict"
            className="absolute inset-0 z-10 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {isCorrect ? (
              // ─── CORRECT : suspect derrière barreaux + Ricardo triomphant ───
              <>
                {!suspectFailed && (
                  <motion.div
                    className="relative z-10 flex flex-col items-center"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 160, damping: 16 }}
                  >
                    <img
                      src={suspectPhotoUrl}
                      alt={suspectName}
                      onError={() => setSuspectFailed(true)}
                      className="w-72 h-72 object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
                    />
                    <p
                      className="mt-2 font-bangers text-3xl tracking-widest"
                      style={{ color: '#FFD166', textShadow: '3px 3px 0px #073B4C' }}
                    >
                      {suspectName.toUpperCase()}
                    </p>
                  </motion.div>
                )}

                {/* Barreaux de prison */}
                <div className="absolute inset-0 z-30 pointer-events-none flex justify-around px-2">
                  {Array.from({ length: BAR_COUNT }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-3 sm:w-4 rounded-b-sm"
                      style={{
                        background:
                          'linear-gradient(to right, #1a1a1a 0%, #4a4a4a 30%, #6a6a6a 50%, #4a4a4a 70%, #1a1a1a 100%)',
                        boxShadow:
                          '2px 0 4px rgba(0,0,0,0.6), inset -1px 0 2px rgba(255,255,255,0.15)',
                        height: '100%',
                      }}
                      initial={{ y: '-100%' }}
                      animate={{ y: '0%' }}
                      transition={{
                        delay: i * 0.07,
                        type: 'spring',
                        stiffness: 90,
                        damping: 14,
                      }}
                    />
                  ))}
                </div>

                {/* Ricardo triomphant + BIEN JOUÉ */}
                <motion.div
                  className="absolute bottom-6 z-40 flex items-end gap-4"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, type: 'spring', stiffness: 160 }}
                >
                  {!ricardoFailed && (
                    <img
                      src={ricardoVerdictSrc}
                      alt="Ricardo triomphant"
                      onError={() => setRicardoFailed(true)}
                      className="w-32 h-32 object-contain drop-shadow-[0_6px_18px_rgba(0,0,0,0.7)]"
                    />
                  )}
                  <h1
                    className={`${isBrainCity ? 'font-bangers text-6xl tracking-widest' : 'font-mono font-bold text-4xl tracking-wider'} pb-4`}
                    style={{
                      color: '#06D6A0',
                      textShadow: isBrainCity ? '4px 4px 0px #073B4C' : '0 0 20px rgba(0,0,0,0.8)',
                    }}
                  >
                    {isBrainCity ? 'BIEN JOUÉ !' : 'IDENTIFICATION POSITIVE'}
                  </h1>
                </motion.div>
              </>
            ) : (
              // ─── INCORRECT : Ricardo déçu seul ───
              <motion.div
                className="relative z-10 flex flex-col items-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 160, damping: 16 }}
              >
                {!ricardoFailed && (
                  <motion.img
                    src={ricardoVerdictSrc}
                    alt="Ricardo inquiet"
                    onError={() => setRicardoFailed(true)}
                    className="w-64 h-64 object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
                    animate={{ rotate: [0, -4, 4, -4, 0] }}
                    transition={{ duration: 0.6, repeat: 1 }}
                  />
                )}
                <motion.h1
                  className={`mt-6 ${isBrainCity ? 'font-bangers text-6xl tracking-widest' : 'font-mono font-bold text-4xl tracking-wider'}`}
                  style={{
                    color: '#EF476F',
                    textShadow: isBrainCity ? '4px 4px 0px #073B4C' : '0 0 20px rgba(0,0,0,0.8)',
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {isBrainCity ? 'PAS LUI…' : 'CE N’EST PAS LUI'}
                </motion.h1>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PHASE 3 : ACTIONS (Brain City uniquement) ── */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-3 w-[min(420px,90vw)]"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {!isCorrect && onRetry && (
              <button
                onClick={onRetry}
                className="w-full py-4 text-[#073B4C] font-bangers text-2xl rounded-2xl border-4 border-[#073B4C] shadow-[0_4px_0_0_#073B4C] hover:-translate-y-[2px] hover:shadow-[0_6px_0_0_#073B4C] active:translate-y-[4px] active:shadow-[0_0_0_0_#073B4C] transition-all tracking-wider"
                style={{ background: '#FFD166' }}
              >
                🔄 RÉESSAYER
              </button>
            )}
            {onQuit && (
              <button
                onClick={onQuit}
                className="w-full py-4 font-bangers text-2xl rounded-2xl border-4 border-[#073B4C] shadow-[0_4px_0_0_#073B4C] hover:-translate-y-[2px] hover:shadow-[0_6px_0_0_#073B4C] active:translate-y-[4px] active:shadow-[0_0_0_0_#073B4C] transition-all tracking-wider"
                style={{
                  background: isCorrect ? '#06D6A0' : 'white',
                  color: '#073B4C',
                }}
              >
                {isCorrect ? '🏠 QUITTER LA PARTIE' : '🚪 QUITTER LA PARTIE'}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AccusationOverlay;
