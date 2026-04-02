import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface RicardoBubbleProps {
  message: string;
  soundOnMessage?: 'bouche' | 'agace' | 'apeure' | 'chant';
}

const SOUNDS = {
  bouche: '/audio/pouleBouche.wav',
  agace: '/audio/pouleAgace.wav',
  apeure: '/audio/pouleApeure.wav',
  chant: '/audio/chantPoule.wav',
};

const playSound = (key: keyof typeof SOUNDS) => {
  const audio = new Audio(SOUNDS[key]);
  audio.volume = 0.6;
  audio.play().catch(() => {});
};

const RicardoBubble = ({ message, soundOnMessage = 'bouche' }: RicardoBubbleProps) => {
  const prevMessage = useRef<string>('');

  useEffect(() => {
    if (message !== prevMessage.current) {
      prevMessage.current = message;
      playSound(soundOnMessage);
    }
  }, [message, soundOnMessage]);

  return (
    <div className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm">
      <motion.img
        src="/images/inspecteur/Ricardo_Pouleto_sticker.png"
        alt="Ricardo Pouleto"
        className="w-14 h-14 flex-shrink-0 cursor-pointer object-contain"
        onClick={() => playSound('agace')}
        whileHover={{ scale: 1.15, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
      />
      <div className="bg-braincity-bubble rounded-xl px-3 py-2 text-sm font-semibold text-gray-800 leading-snug">
        {message}
      </div>
    </div>
  );
};

export default RicardoBubble;
