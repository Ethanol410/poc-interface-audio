/**
 * IntroScreen — Page d'introduction cinématique
 * Phase 0: Titre + waveform animée
 * Phase 1: 3 concepts clés de l'enquête sonore → redirige vers /setup
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Fixed waveform pattern — 50 bars, heights in 0–100 range
const BARS = [15,52,78,42,88,28,65,48,82,38,62,72,32,78,52,68,22,88,42,58,75,32,72,48,82,38,62,28,88,52,68,42,78,32,62,72,48,82,38,58,24,70,45,85,35,75,55,88,42,65];
const DURATIONS = [1.4,1.8,1.2,2.0,1.6,1.9,1.3,1.7,1.5,2.1,1.4,1.8,1.2,1.6,2.0,1.3,1.7,1.5,1.9,1.4,1.8,1.2,2.0,1.6,1.9,1.3,1.7,1.5,2.1,1.4,1.8,1.2,1.6,2.0,1.3,1.7,1.5,1.9,1.4,1.8,1.6,2.1,1.3,1.9,1.5,1.7,2.0,1.4,1.8,1.2];

const CONCEPTS = [
  {
    glyph: '≋',
    number: '01',
    title: 'Le son laisse des traces',
    desc: 'Chaque enregistrement cache des indices que l\'oreille seule ne peut pas entendre. Un bruit de fond, un écho, une distorsion — tout est une empreinte.',
  },
  {
    glyph: '⌬',
    number: '02',
    title: 'Filtrez pour révéler',
    desc: 'Manipulez les fréquences, le pitch et la vitesse de lecture. En isolant les bons paramètres, la vérité émerge du bruit comme une voix dans l\'obscurité.',
  },
  {
    glyph: '◎',
    number: '03',
    title: 'Identifiez le coupable',
    desc: 'Comparez les voix des suspects à l\'enregistrement. Analysez, déduisez, accusez. L\'enquête n\'attend pas — chaque indice compte.',
  },
];

// ─── Waveform visual ──────────────────────────────────────────────────────────

const Waveform = () => (
  <div className="flex items-end gap-[2px]" style={{ height: '56px' }}>
    {BARS.map((h, i) => (
      <motion.div
        key={i}
        style={{
          background: 'rgba(0,212,255,0.42)',
          flex: '1',
          minWidth: '2px',
          borderRadius: '2px 2px 0 0',
          height: '100%',
          transformOrigin: 'bottom',
        }}
        animate={{ scaleY: [h * 0.12 / 100, h / 100, h * 0.12 / 100] }}
        transition={{ duration: DURATIONS[i], repeat: Infinity, ease: 'easeInOut', delay: i * 0.03 }}
      />
    ))}
  </div>
);

// ─── Phase 0 : Titre cinématique ──────────────────────────────────────────────

const TitlePhase = ({ onContinue }: { onContinue: () => void }) => (
  <motion.div
    className="flex-1 flex flex-col items-center justify-center px-6 relative z-10"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0, y: -16 }}
    transition={{ duration: 0.55 }}
  >
    {/* Badge */}
    <motion.div
      className="flex items-center gap-2.5 mb-14"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-forensics-cyan animate-pulse" />
      <span className="text-[10px] font-mono tracking-[0.55em] uppercase text-forensics-cyan/45">
        Expérience interactive
      </span>
    </motion.div>

    {/* Waveform */}
    <motion.div
      className="w-full max-w-sm mb-12"
      initial={{ opacity: 0, scaleX: 0.2 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ delay: 0.5, duration: 0.75, ease: 'easeOut' }}
    >
      <Waveform />
    </motion.div>

    {/* Title */}
    <motion.div
      className="text-center mb-5"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.75, duration: 0.65 }}
    >
      <h1
        className="font-mono font-black tracking-tight leading-none mb-5 text-white"
        style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)' }}
      >
        LE SON EST{' '}
        <span className="text-forensics-cyan">LA CLÉ</span>
      </h1>
      <p className="text-gray-500 font-mono text-sm max-w-md mx-auto leading-relaxed">
        Dans chaque enregistrement se dissimule une vérité.<br />
        Vos outils vont la révéler.
      </p>
    </motion.div>

    {/* CTA */}
    <motion.button
      onClick={onContinue}
      className="mt-10 px-10 py-3 border border-forensics-cyan/35 text-forensics-cyan font-mono text-sm tracking-[0.3em] uppercase hover:bg-forensics-cyan/10 hover:border-forensics-cyan/70 transition-all"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
    >
      Découvrir →
    </motion.button>
  </motion.div>
);

// ─── Phase 1 : Concepts ───────────────────────────────────────────────────────

const ConceptsPhase = ({ onContinue }: { onContinue: () => void }) => (
  <motion.div
    className="flex-1 flex flex-col items-center justify-center px-8 py-12 relative z-10"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0, y: -16 }}
    transition={{ duration: 0.5 }}
  >
    <motion.p
      className="text-[16px] font-mono tracking-[0.55em] uppercase text-forensics-cyan/38 mb-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15 }}
    >
      Comment ça marche
    </motion.p>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mb-14">
      {CONCEPTS.map((c, i) => (
        <motion.div
          key={c.title}
          className="relative border border-forensics-cyan/15 p-10 bg-forensics-cyan/[0.03] flex flex-col"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 + i * 0.15, duration: 0.52 }}
        >
          {/* Step number — corner */}
          <span className="absolute top-5 right-6 text-[14px] font-mono text-forensics-cyan/20 tracking-widest">
            {c.number}
          </span>

          {/* Glyph */}
          <div
            className="font-mono text-forensics-cyan/50 mb-7 select-none leading-none"
            style={{ fontSize: '3rem' }}
          >
            {c.glyph}
          </div>

          {/* Title */}
          <h3 className="text-white font-mono font-bold text-base mb-4 leading-snug">
            {c.title}
          </h3>

          {/* Description */}
          <p className="text-gray-500 font-mono text-sm leading-relaxed flex-1">
            {c.desc}
          </p>

          {/* Bottom accent line */}
          <motion.div
            className="mt-8 h-px bg-forensics-cyan/20"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.55 + i * 0.15, duration: 0.5, ease: 'easeOut' }}
            style={{ transformOrigin: 'left' }}
          />
        </motion.div>
      ))}
    </div>

    <motion.button
      onClick={onContinue}
      className="px-12 py-4 bg-forensics-cyan text-forensics-bg font-mono font-bold text-sm tracking-[0.3em] uppercase hover:bg-white transition-colors"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.9 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      Choisir mon enquête →
    </motion.button>
  </motion.div>
);

// ─── Main component ───────────────────────────────────────────────────────────

const IntroScreen = () => {
  const [phase, setPhase] = useState<0 | 1>(0);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#060810] flex flex-col overflow-hidden relative">
      {/* Blueprint grid */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,212,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.022) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
      {/* Edge vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse at center, transparent 38%, rgba(0,0,0,0.65) 100%)' }}
      />

      <AnimatePresence mode="wait">
        {phase === 0 && (
          <TitlePhase key="title" onContinue={() => setPhase(1)} />
        )}
        {phase === 1 && (
          <ConceptsPhase key="concepts" onContinue={() => navigate('/setup')} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default IntroScreen;
