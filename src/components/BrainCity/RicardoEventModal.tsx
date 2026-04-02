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

const GRADIENT: Partial<Record<RicardoEmotion, string>> = {
  triumphant: 'from-emerald-400 to-blue-500',
  panicking: 'from-red-500 to-red-700',
  scared: 'from-gray-500 to-red-400',
};

const IMAGE_MAP: Partial<Record<RicardoEmotion, string>> = {
  triumphant: '/images/inspecteur/Ricardo_Pouleto_triumphant.png',
  panicking: '/images/inspecteur/Ricardo_Pouleto_panicking.png',
  scared: '/images/inspecteur/Ricardo_Pouleto_scared.png',
};

const FALLBACK = '/images/inspecteur/Ricardo_Pouleto_sticker.png';

const RicardoEventModal = ({
  emotion,
  title,
  message,
  clueProgress,
  onDismiss,
}: RicardoEventModalProps) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 2500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const gradient = GRADIENT[emotion] ?? 'from-blue-400 to-purple-500';
  const imgSrc = IMAGE_MAP[emotion] ?? FALLBACK;

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.button
        type="button"
        className={`bg-gradient-to-br ${gradient} rounded-3xl px-8 py-6 flex flex-col items-center gap-3 shadow-2xl pointer-events-auto cursor-pointer border-4 border-white/30`}
        initial={{ scale: 0.6, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.6, y: 40 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onClick={onDismiss}
      >
        <motion.img
          src={imgSrc}
          alt="Ricardo"
          className="w-20 h-20 object-contain"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK; }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        />
        <div className="text-center">
          <p className="text-white font-black text-xl tracking-wide drop-shadow">{title}</p>
          <p className="text-white/90 font-semibold text-sm mt-1">{message}</p>
        </div>
        {clueProgress && (
          <div className="flex gap-1">
            {Array.from({ length: clueProgress.total }, (_, i) => (
              <span key={i} className="text-lg leading-none">
                {i < clueProgress.found ? '⭐' : '☆'}
              </span>
            ))}
          </div>
        )}
      </motion.button>
    </motion.div>
  );
};

export default RicardoEventModal;
