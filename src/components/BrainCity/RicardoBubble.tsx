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

// KidTech flat border colors per emotion
const EMOTION_BORDER: Record<RicardoEmotion, string> = {
  neutral: '#073B4C',
  excited: '#FFD166', // mustard
  thinking: '#9D4EDD', // violet
  panicking: '#EF476F', // coral
  triumphant: '#06D6A0', // teal
  scared: '#EF476F', // coral
};

const EMOTION_GLOW: Record<RicardoEmotion, string> = {
  neutral: '0 4px 0 0 #073B4C',
  excited: '0 4px 0 0 #073B4C',
  thinking: '0 4px 0 0 #073B4C',
  panicking: '0 4px 0 0 #073B4C',
  triumphant: '0 4px 0 0 #073B4C',
  scared: '0 4px 0 0 #073B4C',
};

const playSound = (key: RicardoSound) => {
  const audio = new Audio(SOUNDS[key]);
  audio.volume = 0.2;
  audio.play().catch(() => {});
};

const RicardoBubble = ({ message, emotion = 'neutral', soundOnMessage = 'bouche' }: RicardoBubbleProps) => {
  const prevMessage = useRef<string>('');
  const [imgSrc, setImgSrc] = useState(IMAGE_MAP[emotion]);

  useEffect(() => {
    setImgSrc(IMAGE_MAP[emotion]);
  }, [emotion]);

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
  const borderColor = EMOTION_BORDER[emotion];
  const glowStyle = EMOTION_GLOW[emotion];

  return (
    <div
      className="flex items-center gap-4 bg-white rounded-2xl p-3"
      style={{ border: `4px solid ${borderColor}`, boxShadow: glowStyle }}
    >
      {/* Ricardo image */}
      <div className="relative flex-shrink-0">
        <motion.img
          src={imgSrc}
          alt="Ricardo Pouleto"
          className="w-24 h-24 cursor-pointer object-contain drop-shadow-lg"
          onError={() => setImgSrc(FALLBACK_IMAGE)}
          onClick={() => playSound('bouche')}
          whileHover={{ scale: 1.1, rotate: 4 }}
          whileTap={{ scale: 0.92 }}
          animate={isPanicking ? { x: [-3, 3, -3, 3, 0] } : { y: [0, -5, 0] }}
          transition={
            isPanicking
              ? { duration: 0.25, repeat: Infinity }
              : { duration: 2.5, repeat: Infinity, repeatDelay: 2 }
          }
        />
        {badge && (
          <span className="absolute -top-1 -right-1 text-xl leading-none">{badge}</span>
        )}
      </div>

      {/* Speech bubble with CSS triangle tail */}
      <div className="relative flex-1">
        {/* Triangle pointing left toward Ricardo */}
        <div
          style={{
            position: 'absolute',
            left: '-14px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: 0,
            height: 0,
            borderTop: '12px solid transparent',
            borderBottom: '12px solid transparent',
            borderRight: `14px solid ${borderColor}`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '-8px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: 0,
            height: 0,
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderRight: `10px solid #FFF9EC`,
            zIndex: 10,
          }}
        />
        <div
          className="rounded-xl px-4 py-3 text-sm font-semibold leading-snug font-fredoka relative z-1"
          style={{ background: '#FFF9EC', color: '#073B4C', border: `3px solid ${borderColor}` }}
        >
          {message}
        </div>
      </div>
    </div>
  );
};

export default RicardoBubble;
