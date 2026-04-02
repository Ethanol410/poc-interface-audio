import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { RicardoEmotion, RicardoSound } from '@/hooks/useRicardo';

interface RicardoBubbleProps {
  message: string;
  emotion?: RicardoEmotion;
  soundOnMessage?: RicardoSound;
}

const SOUNDS: Record<RicardoSound, string> = {
  bouche: '/audio/pouleBouche.wav',
  agace: '/audio/pouleAgace.wav',
  apeure: '/audio/pouleApeure.wav',
  chant: '/audio/chantPoule.wav',
};

const IMAGE_MAP: Record<RicardoEmotion, string> = {
  neutral: '/images/inspecteur/Ricardo_Pouleto_neutral.png',
  excited: '/images/inspecteur/Ricardo_Pouleto_excited.png',
  thinking: '/images/inspecteur/Ricardo_Pouleto_thinking.png',
  panicking: '/images/inspecteur/Ricardo_Pouleto_panicking.png',
  triumphant: '/images/inspecteur/Ricardo_Pouleto_triumphant.png',
  scared: '/images/inspecteur/Ricardo_Pouleto_scared.png',
};

const FALLBACK_IMAGE = '/images/inspecteur/Ricardo_Pouleto_sticker.png';

const EMOTION_BADGE: Partial<Record<RicardoEmotion, string>> = {
  thinking: '💭',
  excited: '🔥',
  panicking: '⚠️',
  triumphant: '⭐',
  scared: '😨',
};

const EMOTION_BORDER: Record<RicardoEmotion, string> = {
  neutral: 'border-gray-100',
  excited: 'border-yellow-300',
  thinking: 'border-purple-200',
  panicking: 'border-red-300',
  triumphant: 'border-green-300',
  scared: 'border-red-200',
};

const playSound = (key: RicardoSound) => {
  const audio = new Audio(SOUNDS[key]);
  audio.volume = 0.6;
  audio.play().catch(() => {});
};

const RicardoBubble = ({ message, emotion = 'neutral', soundOnMessage = 'bouche' }: RicardoBubbleProps) => {
  const prevMessage = useRef<string>('');
  const [imgSrc, setImgSrc] = useState(IMAGE_MAP[emotion]);

  // Update image when emotion changes
  useEffect(() => {
    setImgSrc(IMAGE_MAP[emotion]);
  }, [emotion]);

  // Auto-play only for non-bouche sounds
  useEffect(() => {
    if (message !== prevMessage.current) {
      prevMessage.current = message;
      if (soundOnMessage !== 'bouche') {
        playSound(soundOnMessage);
      }
    }
  }, [message, soundOnMessage]);

  const badge = EMOTION_BADGE[emotion];
  const isPanicking = emotion === 'panicking';

  return (
    <div className={`flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm border-2 ${EMOTION_BORDER[emotion]}`}>
      <div className="relative flex-shrink-0">
        <motion.img
          src={imgSrc}
          alt="Ricardo Pouleto"
          className="w-14 h-14 cursor-pointer object-contain"
          onError={() => setImgSrc(FALLBACK_IMAGE)}
          onClick={() => playSound('bouche')}
          whileHover={{ scale: 1.15, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          animate={isPanicking ? { x: [-2, 2, -2, 2, 0] } : { y: [0, -3, 0] }}
          transition={
            isPanicking
              ? { duration: 0.3, repeat: Infinity }
              : { duration: 2.5, repeat: Infinity, repeatDelay: 2 }
          }
        />
        {badge && (
          <span className="absolute -top-1 -right-1 text-sm leading-none">{badge}</span>
        )}
      </div>
      <div className="bg-braincity-bubble rounded-xl px-3 py-2 text-sm font-semibold text-gray-800 leading-snug">
        {message}
      </div>
    </div>
  );
};

export default RicardoBubble;
