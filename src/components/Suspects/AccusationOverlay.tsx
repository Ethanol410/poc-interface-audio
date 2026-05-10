import { useState } from 'react';
import { motion } from 'framer-motion';

interface AccusationOverlayProps {
  isCorrect: boolean;
  isBrainCity: boolean;
}

const BAR_COUNT = 7;

const AccusationOverlay = ({ isCorrect, isBrainCity }: AccusationOverlayProps) => {
  const [imageFailed, setImageFailed] = useState(false);

  const ricardoSrc = isCorrect
    ? '/images/inspecteur/Ricardo_Pouleto_triumphant.png'
    : '/images/inspecteur/Ricardo_Pouleto_scared.png';

  const headline = isCorrect ? 'EN PRISON !' : 'ATTENTION...';
  const headlineColor = isBrainCity
    ? isCorrect ? '#06D6A0' : '#EF476F'
    : isCorrect ? '#22d3ee' : '#f87171';

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

      {/* Ricardo behind bars */}
      {!imageFailed && (
        <motion.img
          src={ricardoSrc}
          alt={isCorrect ? 'Ricardo triomphant' : 'Ricardo inquiet'}
          onError={() => setImageFailed(true)}
          className="absolute z-10 w-64 h-64 object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 180, damping: 14 }}
        />
      )}

      {/* Headline */}
      <motion.div
        className="absolute bottom-24 z-20 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.3 }}
      >
        <h1
          className={`${isBrainCity ? 'font-bangers text-7xl tracking-widest' : 'font-mono font-bold text-5xl tracking-wider'}`}
          style={{
            color: headlineColor,
            textShadow: isBrainCity ? '4px 4px 0px #073B4C' : '0 0 20px rgba(0,0,0,0.8)',
          }}
        >
          {headline}
        </h1>
      </motion.div>

      {/* Prison bars (drop from top) */}
      <div className="absolute inset-0 z-30 pointer-events-none flex justify-around px-2">
        {Array.from({ length: BAR_COUNT }).map((_, i) => (
          <motion.div
            key={i}
            className="w-3 sm:w-4 rounded-b-sm"
            style={{
              background: 'linear-gradient(to right, #1a1a1a 0%, #4a4a4a 30%, #6a6a6a 50%, #4a4a4a 70%, #1a1a1a 100%)',
              boxShadow: '2px 0 4px rgba(0,0,0,0.6), inset -1px 0 2px rgba(255,255,255,0.15)',
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
    </motion.div>
  );
};

export default AccusationOverlay;
