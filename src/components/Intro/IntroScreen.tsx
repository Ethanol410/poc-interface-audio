/**
 * IntroScreen — Cinematic audio forensics intro
 * Phase 0 : Acquisition du signal (waveform + titre)
 * Phase 1 : Méthodologie en 3 étapes (mini-démos interactifs)
 * → Redirige vers /setup pour la sélection de scénario
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioStore } from '@/stores/audioStore';

// ─── Waveform data (fixed, no Math.random in render) ─────────────────────────

const MAIN_BARS = [12,48,72,38,84,24,60,44,78,34,58,68,28,74,48,64,18,84,38,54,70,28,68,44,78,34,58,24,84,48,64,38,74,28,58,68,44,78,34,54,20,66,41,81,31,71,51,84,38,62,15,52,78,42,88,28,65,48,82,38];
const MAIN_DURS = [1.4,1.8,1.2,2.0,1.6,1.9,1.3,1.7,1.5,2.1,1.4,1.8,1.2,1.6,2.0,1.3,1.7,1.5,1.9,1.4,1.8,1.2,2.0,1.6,1.9,1.3,1.7,1.5,2.1,1.4,1.8,1.2,1.6,2.0,1.3,1.7,1.5,1.9,1.4,1.8,1.6,2.1,1.3,1.9,1.5,1.7,2.0,1.4,1.8,1.2,1.5,1.9,1.3,1.7,2.0,1.4,1.6,1.8,1.2,2.1];

const MINI_A     = [30,72,45,87,55,76,40,91,60,81,35,66,50,78];
const MINI_DURS  = [1.3,1.7,1.1,1.9,1.5,1.8,1.2,2.0,1.4,1.6,1.3,1.8,1.5,1.7];
const NOISY      = [72,12,88,8,80,18,92,6,76,22,66,28,84,14];
const CLEAN      = [28,42,56,68,74,72,62,52,42,36,30,26,32,38];
const VOICE_A    = [38,66,46,81,56,72,42,78,52,62,36,68,44,76];
const VOICE_B    = [36,64,44,79,54,70,40,76,50,60,34,66,42,74];

// ─── Shared layout primitives ─────────────────────────────────────────────────

/** Corner brackets — aesthetic technique des schémas électroniques */
const Brackets = ({ opacity = '0.28' }: { opacity?: string }) => (
  <>
    <div className="absolute top-0 left-0 w-5 h-5" style={{ borderLeft: `1.5px solid rgba(0,212,255,${opacity})`, borderTop: `1.5px solid rgba(0,212,255,${opacity})` }} />
    <div className="absolute top-0 right-0 w-5 h-5" style={{ borderRight: `1.5px solid rgba(0,212,255,${opacity})`, borderTop: `1.5px solid rgba(0,212,255,${opacity})` }} />
    <div className="absolute bottom-0 left-0 w-5 h-5" style={{ borderLeft: `1.5px solid rgba(0,212,255,${opacity})`, borderBottom: `1.5px solid rgba(0,212,255,${opacity})` }} />
    <div className="absolute bottom-0 right-0 w-5 h-5" style={{ borderRight: `1.5px solid rgba(0,212,255,${opacity})`, borderBottom: `1.5px solid rgba(0,212,255,${opacity})` }} />
  </>
);

const ProgressDots = ({ phase }: { phase: 0 | 1 }) => (
  <div className="flex items-center gap-2.5">
    {([0, 1] as const).map((i) => (
      <motion.div
        key={i}
        className="rounded-full"
        animate={{
          width: i === phase ? '28px' : '6px',
          backgroundColor: i === phase ? '#00d4ff' : 'rgba(0,212,255,0.18)',
        }}
        style={{ height: '5px' }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
      />
    ))}
  </div>
);

// ─── Waveform components ──────────────────────────────────────────────────────

/** Grande waveform principale avec ligne de scan radar */
const MainWaveform = () => (
  <div className="relative w-full" style={{ height: '88px' }}>
    {/* Bars */}
    <div className="flex items-end gap-[2px] h-full">
      {MAIN_BARS.map((h, i) => (
        <motion.div
          key={i}
          style={{
            background: `rgba(0,212,255,${0.22 + (h / 100) * 0.42})`,
            flex: 1,
            minWidth: '2px',
            borderRadius: '2px 2px 0 0',
            height: '100%',
            transformOrigin: 'bottom',
            boxShadow: h > 68 ? '0 0 8px rgba(0,212,255,0.28)' : 'none',
          }}
          animate={{ scaleY: [h * 0.08 / 100, h / 100, h * 0.08 / 100] }}
          transition={{ duration: MAIN_DURS[i], repeat: Infinity, ease: 'easeInOut', delay: i * 0.025 }}
        />
      ))}
    </div>
    {/* Radar scan line */}
    <motion.div
      className="absolute inset-y-0 w-px pointer-events-none"
      style={{
        background: 'linear-gradient(180deg, transparent 0%, rgba(0,212,255,0.9) 50%, transparent 100%)',
        boxShadow: '0 0 10px rgba(0,212,255,0.5)',
      }}
      animate={{ left: ['-1%', '101%'] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: 'linear', repeatDelay: 2.5 }}
    />
    {/* Bottom baseline */}
    <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'rgba(0,212,255,0.15)' }} />
  </div>
);

/** Égaliseur mini pour la carte 1 */
const EqualizerMini = () => (
  <div className="flex items-end gap-[3px]" style={{ height: '44px' }}>
    {MINI_A.map((h, i) => (
      <motion.div
        key={i}
        style={{
          background: `rgba(0,212,255,${0.3 + (h / 100) * 0.35})`,
          flex: 1,
          borderRadius: '2px 2px 0 0',
          height: '100%',
          transformOrigin: 'bottom',
        }}
        animate={{ scaleY: [h * 0.1 / 100, h / 100, h * 0.1 / 100] }}
        transition={{ duration: MINI_DURS[i], repeat: Infinity, ease: 'easeInOut', delay: i * 0.055 }}
      />
    ))}
  </div>
);

/** Comparaison avant/après filtre pour la carte 2 */
const FilterMini = () => (
  <div style={{ height: '44px' }} className="flex flex-col justify-between">
    {/* Signal bruité — statique, faible opacité */}
    <div className="flex items-end gap-[3px]" style={{ height: '16px' }}>
      {NOISY.map((h, i) => (
        <div key={i} style={{ background: 'rgba(0,212,255,0.18)', flex: 1, borderRadius: '1px 1px 0 0', height: `${h}%` }} />
      ))}
    </div>
    {/* Séparateur */}
    <div className="flex items-center gap-2">
      <div className="flex-1 h-px" style={{ background: 'rgba(0,212,255,0.12)' }} />
      <span className="text-[8px] font-mono tracking-widest" style={{ color: 'rgba(0,212,255,0.35)' }}>FILTRÉ</span>
      <div className="flex-1 h-px" style={{ background: 'rgba(0,212,255,0.12)' }} />
    </div>
    {/* Signal filtré — animé, plus net */}
    <div className="flex items-end gap-[3px]" style={{ height: '16px' }}>
      {CLEAN.map((h, i) => (
        <motion.div
          key={i}
          style={{ background: 'rgba(0,212,255,0.65)', flex: 1, borderRadius: '1px 1px 0 0', height: '100%', transformOrigin: 'bottom' }}
          animate={{ scaleY: [h * 0.5 / 100, h / 100, h * 0.5 / 100] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.08 }}
        />
      ))}
    </div>
  </div>
);

/** Comparaison de voix / biométrie pour la carte 3 */
const MatchMini = () => (
  <div className="flex items-end gap-2" style={{ height: '44px' }}>
    {/* Voix A */}
    <div className="flex items-end gap-[2px]" style={{ flex: 1, height: '100%' }}>
      {VOICE_A.map((h, i) => (
        <div key={i} style={{ background: 'rgba(0,212,255,0.38)', flex: 1, borderRadius: '1px 1px 0 0', height: `${h}%` }} />
      ))}
    </div>
    {/* Pulsing match indicator */}
    <div className="flex flex-col items-center justify-center gap-1 flex-shrink-0 self-center">
      <motion.div
        className="rounded-full"
        style={{ width: '7px', height: '7px', background: '#00d4ff' }}
        animate={{ opacity: [1, 0.15, 1], scale: [1, 1.6, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
    {/* Voix B */}
    <div className="flex items-end gap-[2px]" style={{ flex: 1, height: '100%' }}>
      {VOICE_B.map((h, i) => (
        <div key={i} style={{ background: 'rgba(0,212,255,0.58)', flex: 1, borderRadius: '1px 1px 0 0', height: `${h}%` }} />
      ))}
    </div>
  </div>
);

// ─── Concept cards data ───────────────────────────────────────────────────────

type ConceptEntry = {
  number: string;
  label: string;
  Visual: () => React.JSX.Element;
  title: string;
  desc: string;
};

const CONCEPTS: ConceptEntry[] = [
  {
    number: '01',
    label: 'EMPREINTE SONORE',
    Visual: EqualizerMini,
    title: 'Le son laisse des traces',
    desc: 'Chaque enregistrement cache des indices que l\'oreille seule ne peut pas entendre. Un bruit de fond, un écho, une distorsion tout est une empreinte.',
  },
  {
    number: '02',
    label: 'TRAITEMENT DU SIGNAL',
    Visual: FilterMini,
    title: 'Filtrez pour révéler',
    desc: 'Manipulez les fréquences, le pitch et la vitesse. En isolant les bons paramètres, la vérité émerge du bruit comme une voix dans l\'obscurité.',
  },
  {
    number: '03',
    label: 'COMPARAISON BIOMÉTRIQUE',
    Visual: MatchMini,
    title: 'Identifiez le coupable',
    desc: 'Comparez les voix des suspects à l\'enregistrement. Analysez, déduisez, accusez. L\'enquête n\'attend pas chaque indice compte.',
  },
];

// ─── Phase 0 : Cinématique d'accès ────────────────────────────────────────────

interface TitlePhaseProps {
  onContinue: () => void;
  onSkip: () => void;
}

const TitlePhase = ({ onContinue, onSkip }: TitlePhaseProps) => (
  <motion.div
    className="flex-1 flex flex-col items-center justify-center px-6 relative z-10"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0, y: -14 }}
    transition={{ duration: 0.55 }}
  >
    {/* Skip */}
    <motion.div
      className="absolute top-7 right-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2 }}
    >
      <button
        onClick={onSkip}
        className="font-mono text-[10px] tracking-[0.4em] uppercase transition-colors"
        style={{ color: 'rgba(0,212,255,0.28)' }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(0,212,255,0.65)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(0,212,255,0.28)'; }}
      >
        Passer →
      </button>
    </motion.div>

    {/* Status badge */}
    <motion.div
      className="flex items-center gap-3 mb-10"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <motion.span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: '#00d4ff' }}
        animate={{ opacity: [1, 0.25, 1] }}
        transition={{ duration: 1.1, repeat: Infinity }}
      />
      <span className="font-mono text-[10px] tracking-[0.55em] uppercase" style={{ color: 'rgba(0,212,255,0.42)' }}>
        Système criminalistique audio · Actif
      </span>
    </motion.div>

    {/* Waveform — pleine largeur avec container schématique */}
    <motion.div
      className="relative w-full max-w-2xl mb-3"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Freq label */}
      <div className="absolute -top-5 left-0 font-mono text-[8px] tracking-widest" style={{ color: 'rgba(0,212,255,0.22)' }}>
        FREQ ANALYSIS · 20Hz–20kHz
      </div>
      <MainWaveform />
      <div className="absolute -bottom-5 right-0 font-mono text-[8px] tracking-widest" style={{ color: 'rgba(0,212,255,0.22)' }}>
        LIVE · REC ●
      </div>
    </motion.div>

    {/* Title */}
    <motion.div
      className="text-center mt-10 mb-5"
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.65 }}
    >
      <h1
        className="font-mono font-black tracking-tight leading-none mb-5 text-white"
        style={{ fontSize: 'clamp(2.6rem, 6vw, 4.8rem)' }}
      >
        LE SON EST{' '}
        <span style={{ color: '#00d4ff' }}>LA CLÉ</span>
      </h1>
      <p className="font-mono text-sm leading-relaxed max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.38)' }}>
        Un enregistrement. Des fréquences cachées. Une seule vérité.<br />
        Votre mission : entendre ce que personne d'autre n'a entendu.
      </p>
    </motion.div>

    {/* CTA + dots */}
    <motion.div
      className="flex flex-col items-center gap-5 mt-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.4 }}
    >
      <motion.button
        onClick={onContinue}
        className="relative overflow-hidden px-10 py-3.5 font-mono text-sm tracking-[0.35em] uppercase transition-colors hover:bg-forensics-cyan/10"
        style={{ border: '1px solid rgba(0,212,255,0.35)', color: '#00d4ff' }}
        whileHover={{ borderColor: 'rgba(0,212,255,0.75)' }}
        whileTap={{ scale: 0.97 }}
      >
        Découvrir →
      </motion.button>
      <ProgressDots phase={0} />
    </motion.div>
  </motion.div>
);

// ─── Phase 1 : Méthodologie ───────────────────────────────────────────────────

const ConceptsPhase = ({ onContinue }: { onContinue: () => void }) => (
  <motion.div
    className="flex-1 flex flex-col items-center justify-center px-8 py-10 relative z-10"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0, y: -14 }}
    transition={{ duration: 0.5 }}
  >
    <motion.p
      className="font-mono uppercase mb-12"
      style={{ fontSize: '16px', letterSpacing: '0.55em', color: 'rgba(0,212,255,0.38)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.12 }}
    >
      Comment ça marche
    </motion.p>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mb-12">
      {CONCEPTS.map((c, i) => (
        <motion.div
          key={c.title}
          className="relative p-10 flex flex-col"
          style={{ background: 'rgba(0,212,255,0.025)' }}
          initial={{ opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26 + i * 0.15, duration: 0.55 }}
        >
          <Brackets />

          {/* Step + label */}
          <div className="flex items-center justify-between mb-7">
            <span className="font-mono text-[8px] tracking-[0.5em] uppercase" style={{ color: 'rgba(0,212,255,0.28)' }}>
              {c.label}
            </span>
            <span className="font-mono text-[14px]" style={{ color: 'rgba(0,212,255,0.18)' }}>
              {c.number}
            </span>
          </div>

          {/* Mini visual */}
          <div className="mb-7">
            <c.Visual />
          </div>

          {/* Separator */}
          <motion.div
            className="mb-6"
            style={{ height: '1px', background: 'rgba(0,212,255,0.14)', transformOrigin: 'left' }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5 + i * 0.15, duration: 0.45, ease: 'easeOut' }}
          />

          {/* Title */}
          <h3 className="text-white font-mono font-bold text-base mb-4 leading-snug">
            {c.title}
          </h3>

          {/* Description */}
          <p className="font-mono text-sm leading-relaxed flex-1" style={{ color: 'rgba(255,255,255,0.38)' }}>
            {c.desc}
          </p>
        </motion.div>
      ))}
    </div>

    {/* CTA + dots */}
    <motion.div
      className="flex flex-col items-center gap-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.92 }}
    >
      <motion.button
        onClick={onContinue}
        className="px-12 py-4 font-mono font-bold text-sm tracking-[0.3em] uppercase hover:bg-white transition-colors"
        style={{ background: '#00d4ff', color: '#060810' }}
        whileTap={{ scale: 0.97 }}
      >
        Choisir mon enquête →
      </motion.button>
      <ProgressDots phase={1} />
    </motion.div>
  </motion.div>
);

// ─── Brain City Intro ─────────────────────────────────────────────────────────

const BC_CONCEPTS: Array<{ emoji: string; title: string; desc: string; color: string }> = [
  {
    emoji: '🎧',
    title: 'Écoute attentivement',
    desc: "Le coupable a laissé sa voix sur la bande, mais Larry le Malicieux l'a saboté ! À toi de bien tendre l'oreille.",
    color: '#118AB2',
  },
  {
    emoji: '🧰',
    title: 'Utilise tes super outils',
    desc: "L'Éléphant, l'Abeille, le Balai Magique, la Loupe… chaque outil enlève un bruit ou révèle un détail caché.",
    color: '#FFD166',
  },
  {
    emoji: '🎯',
    title: 'Démasque le coupable',
    desc: "Compare la voix nettoyée à celle des suspects. Tralalero ? Chimpanzini ? Brrbrr ? Ou Tung Tung Tung Sahur ?",
    color: '#EF476F',
  },
];

interface BrainCityIntroProps {
  onContinue: () => void;
}

const BrainCityIntro = ({ onContinue }: BrainCityIntroProps) => (
  <div
    className="min-h-screen flex flex-col items-center justify-center px-6 py-10 overflow-hidden relative"
    style={{
      background: 'linear-gradient(145deg, #FFF9EC 0%, #FFF3D4 55%, #FFEBC0 100%)',
      backgroundImage:
        'radial-gradient(circle, rgba(7,59,76,0.18) 1.5px, transparent 1.5px), linear-gradient(145deg, #FFF9EC 0%, #FFF3D4 55%, #FFEBC0 100%)',
      backgroundSize: '26px 26px, 100% 100%',
    }}
  >
    {/* Decorative blobs */}
    <div
      className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none"
      style={{ background: 'radial-gradient(circle, rgba(239,71,111,0.22) 0%, transparent 70%)' }}
    />
    <div
      className="absolute -bottom-28 -left-24 w-[28rem] h-[28rem] rounded-full pointer-events-none"
      style={{ background: 'radial-gradient(circle, rgba(17,138,178,0.18) 0%, transparent 70%)' }}
    />
    <div
      className="absolute top-1/3 left-1/4 w-20 h-20 rounded-full pointer-events-none"
      style={{ background: 'radial-gradient(circle, rgba(6,214,160,0.4) 0%, transparent 70%)' }}
    />

    <div className="relative z-10 max-w-5xl w-full">
      {/* Header with Ricardo */}
      <motion.div
        className="flex items-center justify-center gap-5 mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.img
          src="/images/inspecteur/Ricardo_Pouleto_sticker.png"
          alt="Ricardo Pouleto"
          className="w-20 h-20 object-contain"
          animate={{ rotate: [0, -8, 8, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <div className="text-left">
          <h1
            className="font-bangers leading-none"
            style={{
              color: '#118AB2',
              fontSize: 'clamp(2rem, 4vw, 3.2rem)',
              textShadow: '2px 2px 0 rgba(7,59,76,0.18)',
            }}
          >
            BIENVENUE À
          </h1>
          <h1
            className="font-bangers leading-none"
            style={{
              color: '#EF476F',
              fontSize: 'clamp(3rem, 6vw, 5rem)',
              textShadow: '3px 3px 0 rgba(7,59,76,0.2)',
            }}
          >
            BRAIN CITY !
          </h1>
        </div>
      </motion.div>

      <motion.p
        className="font-nunito font-bold text-center text-lg mb-10"
        style={{ color: 'rgba(7,59,76,0.75)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        L'enquête sonore la plus déjantée de la ville t'attend !<br />
        Es-tu prêt&nbsp;à devenir détective&nbsp;?
      </motion.p>

      {/* Concept cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {BC_CONCEPTS.map((c, i) => (
          <motion.div
            key={c.title}
            className="bg-white border-4 border-[#073B4C] rounded-[28px] p-5 shadow-[0_6px_0_0_#073B4C]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 + i * 0.12, duration: 0.45 }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-3 border-2 border-[#073B4C]"
              style={{ background: c.color, boxShadow: '0 3px 0 0 #073B4C' }}
            >
              {c.emoji}
            </div>
            <h3
              className="font-bangers text-2xl tracking-wider leading-tight mb-1"
              style={{ color: c.color, textShadow: '1.5px 1.5px 0 rgba(7,59,76,0.18)' }}
            >
              {c.title}
            </h3>
            <p
              className="font-nunito font-semibold text-sm leading-snug"
              style={{ color: 'rgba(7,59,76,0.7)' }}
            >
              {c.desc}
            </p>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.95 }}
      >
        <motion.button
          onClick={onContinue}
          className="px-10 py-4 font-bangers text-2xl tracking-widest text-white border-4 border-[#073B4C] rounded-full"
          style={{ background: '#EF476F', boxShadow: '0 5px 0 0 #073B4C' }}
          whileHover={{ scale: 1.04, translateY: -2, boxShadow: '0 7px 0 0 #073B4C' }}
          whileTap={{ scale: 0.97, translateY: 4, boxShadow: '0 0 0 0 #073B4C' }}
        >
          🚀 JE SUIS PRÊT&nbsp;!
        </motion.button>
      </motion.div>
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

const IntroScreen = () => {
  const [phase, setPhase] = useState<0 | 1>(0);
  const navigate = useNavigate();
  const scenario = useAudioStore((s) => s.scenario);
  const isBrainCity = scenario === 'braincity';

  if (isBrainCity) {
    return <BrainCityIntro onContinue={() => navigate('/setup')} />;
  }

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative" style={{ background: '#060810' }}>

      {/* Blueprint grid */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,212,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.02) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* Radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(0,0,0,0.72) 100%)' }}
      />

      {/* Subtle CRT scanlines */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)',
        }}
      />

      <AnimatePresence mode="wait">
        {phase === 0 && (
          <TitlePhase
            key="title"
            onContinue={() => setPhase(1)}
            onSkip={() => navigate('/setup')}
          />
        )}
        {phase === 1 && (
          <ConceptsPhase
            key="concepts"
            onContinue={() => navigate('/setup')}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default IntroScreen;
