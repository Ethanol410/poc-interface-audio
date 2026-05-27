import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AccusationOverlayProps {
  isBrainCity: boolean;
  isCorrect: boolean;
  suspectName: string;
  suspectPhotoUrl: string;
  /** Brain City — callback après échec (retour auto aux suspects) */
  onRetry?: () => void;
  /** Brain City — callback quand le joueur quitte la partie depuis la page de félicitations */
  onQuit?: () => void;
}

type Phase = 'analyzing' | 'verdict' | 'celebration';

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

    if (isCorrect) {
      // Succès → afficher la page de félicitations après le verdict
      const t2 = setTimeout(
        () => setPhase('celebration'),
        ANALYSIS_DURATION_MS + VERDICT_DURATION_MS,
      );
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }

    // Échec → retour automatique aux suspects après le verdict
    const t2 = setTimeout(
      () => onRetry?.(),
      ANALYSIS_DURATION_MS + VERDICT_DURATION_MS,
    );
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isCorrect, onRetry]);

  const ricardoVerdictSrc = isCorrect
    ? '/images/inspecteur/Ricardo_Pouleto_triumphant.png'
    : '/images/inspecteur/Ricardo_Pouleto_scared.png';

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Backdrop : sombre pendant analyse/verdict, crème pour la célébration */}
      <motion.div
        className="absolute inset-0"
        animate={{
          backgroundColor: phase === 'celebration' ? '#FFF9EC' : 'rgba(0,0,0,0.85)',
        }}
        transition={{ duration: 0.4 }}
        style={
          phase === 'celebration'
            ? {
                backgroundImage:
                  'radial-gradient(circle, #E0D4C3 2px, transparent 2px)',
                backgroundSize: '24px 24px',
              }
            : undefined
        }
      />

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

        {/* ── PHASE 2 : VERDICT ── */}
        {phase === 'verdict' && (
          <motion.div
            key="verdict"
            className="absolute inset-0 z-10 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            {isCorrect ? (
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

                {/* Barreaux */}
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

                {/* Ricardo + BIEN JOUÉ */}
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
                <motion.p
                  className="mt-3 font-fredoka font-semibold text-lg text-white/80"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  On retente !
                </motion.p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── PHASE 3 : PAGE DE FÉLICITATIONS (succès uniquement) ── */}
        {phase === 'celebration' && isCorrect && (
          <motion.div
            key="celebration"
            className="relative z-10 flex flex-col items-center w-[min(600px,92vw)] px-6 py-8 rounded-[32px] bg-white border-4 border-[#073B4C]"
            style={{ boxShadow: '0 8px 0 0 #073B4C' }}
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 160, damping: 18 }}
          >
            {/* Confettis */}
            <div className="text-4xl mb-2 tracking-widest">🎉 🎊 🎈 🎊 🎉</div>

            <h1
              className="font-bangers text-6xl tracking-widest text-center"
              style={{ color: '#06D6A0', textShadow: '4px 4px 0px #073B4C' }}
            >
              FÉLICITATIONS !
            </h1>
            <p
              className="font-fredoka font-bold text-xl mt-2 text-center"
              style={{ color: '#073B4C' }}
            >
              Tu as résolu l'enquête de Brain&nbsp;City !
            </p>

            {/* Photo du suspect + Ricardo */}
            <div className="flex items-center justify-center gap-4 mt-6">
              {!suspectFailed && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center"
                >
                  <img
                    src={suspectPhotoUrl}
                    alt={suspectName}
                    onError={() => setSuspectFailed(true)}
                    className="w-28 h-28 object-contain"
                  />
                  <span
                    className="mt-1 font-bangers text-base tracking-wider"
                    style={{ color: '#EF476F' }}
                  >
                    {suspectName.toUpperCase()}
                  </span>
                  <span
                    className="font-fredoka font-semibold text-xs"
                    style={{ color: '#073B4C' }}
                  >
                    🚨 Coupable !
                  </span>
                </motion.div>
              )}

              {!ricardoFailed && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col items-center"
                >
                  <img
                    src="/images/inspecteur/Ricardo_Pouleto_triumphant.png"
                    alt="Ricardo triomphant"
                    onError={() => setRicardoFailed(true)}
                    className="w-28 h-28 object-contain"
                  />
                  <span
                    className="mt-1 font-bangers text-base tracking-wider"
                    style={{ color: '#118AB2' }}
                  >
                    RICARDO
                  </span>
                  <span
                    className="font-fredoka font-semibold text-xs"
                    style={{ color: '#073B4C' }}
                  >
                    🐔 Cot-cot-COT !
                  </span>
                </motion.div>
              )}
            </div>

            {/* Message de Ricardo */}
            <motion.div
              className="mt-6 w-full px-5 py-3 rounded-2xl border-4 border-[#073B4C] bg-[#FFF9EC]"
              style={{ boxShadow: '0 4px 0 0 #073B4C' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <p
                className="font-fredoka font-bold text-center text-base"
                style={{ color: '#073B4C' }}
              >
                Bravo détective ! Grâce à toi, Ballerina Cappuccina est sauvée
                et Brain&nbsp;City peut respirer&nbsp;! 🦸
              </p>
            </motion.div>

            {/* Bouton Quitter */}
            {onQuit && (
              <motion.button
                onClick={onQuit}
                className="mt-6 w-full py-4 font-bangers text-2xl tracking-widest rounded-2xl border-4 border-[#073B4C]"
                style={{
                  background: '#06D6A0',
                  color: '#073B4C',
                  boxShadow: '0 4px 0 0 #073B4C',
                }}
                whileHover={{
                  scale: 1.02,
                  translateY: -2,
                  boxShadow: '0 6px 0 0 #073B4C',
                }}
                whileTap={{
                  scale: 0.98,
                  translateY: 4,
                  boxShadow: '0 0 0 0 #073B4C',
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                🏠 QUITTER LA PARTIE
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AccusationOverlay;
