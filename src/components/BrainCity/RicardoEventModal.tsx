import { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { RicardoEmotion } from '@/hooks/useRicardo';

interface RicardoEventModalProps {
  emotion: RicardoEmotion;
  title: string;
  message: string;
  clueProgress?: { found: number; total: number };
  onDismiss: () => void;
}

const IMAGE_MAP: Partial<Record<RicardoEmotion, string>> = {
  triumphant: '/images/inspecteur/Ricardo_Pouleto_triumphant.png',
  panicking: '/images/inspecteur/Ricardo_Pouleto_panicking.png',
  scared: '/images/inspecteur/Ricardo_Pouleto_scared.png',
  excited: '/images/inspecteur/Ricardo_Pouleto_excited.png',
};

const FALLBACK = '/images/inspecteur/Ricardo_Pouleto_sticker.png';

const EMOTION_BORDER: Partial<Record<RicardoEmotion, string>> = {
  triumphant: '#06D6A0',
  excited: '#FFD166',
  panicking: '#EF476F',
  scared: '#9D4EDD',
};

const EMOTION_TITLE_COLOR: Partial<Record<RicardoEmotion, string>> = {
  triumphant: '#06D6A0',
  excited: '#FFD166',
  panicking: '#EF476F',
  scared: '#9D4EDD',
};

const RicardoEventModal = ({
  emotion,
  title,
  message,
  clueProgress,
  onDismiss,
}: RicardoEventModalProps) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const borderColor = EMOTION_BORDER[emotion] ?? '#073B4C';
  const titleColor = EMOTION_TITLE_COLOR[emotion] ?? '#073B4C';
  const imgSrc = IMAGE_MAP[emotion] ?? FALLBACK;
  const isPanicking = emotion === 'panicking';

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.button
        type="button"
        className="bg-white rounded-[32px] p-5 flex items-start gap-4 pointer-events-auto cursor-pointer"
        style={{
          border: `4px solid ${borderColor}`,
          boxShadow: `0 8px 0 0 #073B4C`,
          maxWidth: '380px',
          width: '90vw',
        }}
        initial={{ scale: 0.6, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.6, y: 40 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onClick={onDismiss}
      >
        {/* Ricardo image */}
        <motion.img
          src={imgSrc}
          alt="Ricardo"
          className="w-20 h-20 object-contain flex-shrink-0"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK; }}
          animate={isPanicking
            ? { x: [-3, 3, -3, 3, 0] }
            : { y: [0, -8, 0] }
          }
          transition={isPanicking
            ? { duration: 0.25, repeat: Infinity }
            : { duration: 0.6, repeat: Infinity, repeatDelay: 0.5 }
          }
        />

        {/* Content */}
        <div className="flex-1 text-left min-w-0">
          <p
            className="font-bangers text-2xl tracking-wider leading-none"
            style={{ color: titleColor, textShadow: '1px 1px 0px #073B4C' }}
          >
            {title}
          </p>
          <p
            className="font-fredoka font-semibold text-sm mt-1.5 leading-snug"
            style={{ color: '#073B4C' }}
          >
            {message}
          </p>

          {/* Stars progress */}
          {clueProgress && (
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {Array.from({ length: clueProgress.total }, (_, i) => (
                <motion.span
                  key={i}
                  className="text-lg leading-none"
                  style={{
                    filter: i < clueProgress.found
                      ? 'drop-shadow(1px 1px 0px #073B4C)'
                      : 'grayscale(1) opacity(0.3)',
                  }}
                  animate={i < clueProgress.found ? { scale: [1, 1.4, 1] } : {}}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                >
                  ⭐
                </motion.span>
              ))}
            </div>
          )}

          <p className="font-fredoka text-[11px] mt-2" style={{ color: '#9CA3AF' }}>
            Appuie pour continuer
          </p>
        </div>
      </motion.button>
    </motion.div>
  );
};

export default RicardoEventModal;
