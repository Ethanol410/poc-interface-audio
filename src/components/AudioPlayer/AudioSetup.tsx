/**
 * AudioSetup Component — Interface de sélection de mission split-screen
 * Deux univers visuels distincts : Corbeau (noir forensic) / Brain City (coloré / comics)
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { reverseAudioBlob, createAudioURL } from '@/utils/audioGenerator';
import { useAudioStore } from '@/stores/audioStore';
import type { ScenarioId } from '@/data/scenarios';
import { SCENARIOS } from '@/data/scenarios';
import Spinner from '@/components/Layout/Spinner';

const OFFICIAL_AUDIO: Record<ScenarioId, {
  evidenceDistorted: string;
  evidenceClean: string;
  suspect1: string;
  suspect2: string;
  suspect3: string;
  suspect4: string;
}> = {
  corbeau: {
    evidenceDistorted: '/audio/voixModifie.mp3',
    evidenceClean: '/audio/voixModifie.mp3',
    suspect1: '/audio/voix_theo.m4a',
    suspect2: '/audio/voix_robin.m4a',
    suspect3: '/audio/voix_juliette.m4a',
    suspect4: '/audio/voix_yanis.m4a',
  },
  braincity: {
    evidenceDistorted: '/audio/Sahur_Voice Changer.mp3',
    evidenceClean: '/audio/Sahur_Voice Changer.mp3',
    suspect1: '/audio/BrrBrrPatapim.wav',
    suspect2: '/audio/Chimpanzinibananini.wav',
    suspect3: '/audio/Tralalerotralala.wav',
    suspect4: '/audio/Sahur.wav',
  },
};

interface AudioSetupProps {
  onAudiosReady: (audioUrls: {
    evidenceDistorted: string;
    evidenceClean: string;
    evidenceReverse?: string;
    suspect1: string;
    suspect2: string;
    suspect3: string;
    suspect4?: string;
  }) => void;
}

const SPRING = { type: 'spring' as const, stiffness: 340, damping: 32 };

export const AudioSetup = ({ onAudiosReady }: AudioSetupProps) => {
  const { setScenario, setMissionTimerEnabled, setMissionDuration } = useAudioStore();
  const [selectedScenario, setSelectedScenario] = useState<ScenarioId>('corbeau');
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(8);
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = useCallback(async () => {
    setScenario(selectedScenario);
    setMissionTimerEnabled(timerEnabled);
    setMissionDuration(timerMinutes * 60);
    setIsLoading(true);
    const audio = OFFICIAL_AUDIO[selectedScenario];
    try {
      const response = await fetch(audio.evidenceDistorted);
      const blob = await response.blob();
      const evidenceReverse = await reverseAudioBlob(blob);
      onAudiosReady({ ...audio, evidenceReverse: createAudioURL(evidenceReverse) });
    } catch {
      alert('❌ Erreur lors du chargement des fichiers audio');
    } finally {
      setIsLoading(false);
    }
  }, [selectedScenario, timerEnabled, timerMinutes, setScenario, setMissionTimerEnabled, setMissionDuration, onAudiosReady]);

  const isCorbeau = selectedScenario === 'corbeau';
  const isBraincity = selectedScenario === 'braincity';

  return (
    <div className="h-screen flex flex-col overflow-hidden">

      {/* ══════════════════════════════════════════
          SPLIT PANELS
      ══════════════════════════════════════════ */}
      <div className="flex-1 relative overflow-hidden">

        {/* ── LEFT: L'Écho du Corbeau ── */}
        <motion.div
          onClick={() => setSelectedScenario('corbeau')}
          className="absolute inset-y-0 left-0 overflow-hidden cursor-pointer select-none"
          animate={{ width: isCorbeau ? '62%' : '38%' }}
          transition={SPRING}
          style={{ background: 'linear-gradient(145deg, #04061a 0%, #080c24 55%, #050a1a 100%)' }}
        >
          {/* CRT scanlines */}
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.022) 2px, rgba(0,212,255,0.022) 4px)',
            }}
          />

          {/* Grid blueprint */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0,212,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.06) 1px, transparent 1px)',
              backgroundSize: '52px 52px',
              opacity: 0.35,
            }}
          />

          {/* Animated sweep line */}
          <motion.div
            className="absolute left-0 right-0 h-48 pointer-events-none z-10"
            style={{ background: 'linear-gradient(180deg, transparent, rgba(0,212,255,0.05) 50%, transparent)' }}
            animate={{ top: ['-30%', '130%'] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear', repeatDelay: 0.5 }}
          />

          {/* Vignette edges */}
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{ boxShadow: 'inset 60px 0 80px rgba(0,0,0,0.6), inset -60px 0 80px rgba(0,0,0,0.6)' }}
          />

          {/* Content */}
          <div className="relative z-20 h-full flex flex-col justify-between p-10">

            {/* Header badge row */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <span className="text-[9px] font-mono text-forensics-cyan/35 tracking-[0.45em] uppercase">
                  Dossier&nbsp;№&nbsp;CR-7291
                </span>
                <div className="flex-1 h-px bg-forensics-cyan/12" />
                <span className="text-[9px] font-mono text-red-400/55 border border-red-400/20 px-2 py-px tracking-widest uppercase">
                  Adultes
                </span>
              </div>

              {/* Redacted bars + title */}
              <div className="mb-6">
                <div
                  className="h-2.5 mb-3 rounded-sm"
                  style={{ width: '58%', background: 'rgba(0,212,255,0.07)' }}
                />
                <h2 className="font-mono font-black leading-none mb-3 overflow-hidden">
                  <span className="block text-gray-600 text-xs tracking-[0.5em] mb-2 uppercase">
                    L'écho du
                  </span>
                  <span
                    className="block text-white"
                    style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', letterSpacing: '-0.02em' }}
                  >
                    CORBEAU
                  </span>
                </h2>
                <div
                  className="h-2.5 rounded-sm"
                  style={{ width: '35%', background: 'rgba(0,212,255,0.07)' }}
                />
              </div>

              {/* Mission details — revealed on selection */}
              <AnimatePresence>
                {isCorbeau && (
                  <motion.div
                    key="corbeau-details"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ delay: 0.08 }}
                    className="space-y-2.5 mt-2"
                  >
                    <div className="flex gap-4 text-xs font-mono">
                      <span className="text-forensics-cyan/45 w-20 flex-shrink-0 uppercase">Affaire</span>
                      <span className="text-gray-400">Un enfant disparu. Une voix anonyme. Une seule piste&nbsp;: l'enregistrement.</span>
                    </div>
                    <div className="flex gap-4 text-xs font-mono">
                      <span className="text-forensics-cyan/45 w-20 flex-shrink-0 uppercase">Objectif</span>
                      <span className="text-gray-400">{SCENARIOS.corbeau.missionBrief.mission}</span>
                    </div>
                    <div className="flex gap-4 text-xs font-mono items-center">
                      <span className="text-forensics-cyan/45 w-20 flex-shrink-0 uppercase">Suspects</span>
                      <span className="text-gray-400">{SCENARIOS.corbeau.suspects.length} individus identifiés</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer status */}
            <div className="text-xs font-mono">
              {isCorbeau ? (
                <div className="flex items-center gap-2.5 text-forensics-cyan">
                  <span className="w-2 h-2 rounded-full bg-forensics-cyan animate-pulse" />
                  SÉLECTIONNÉ
                </div>
              ) : (
                <span className="text-gray-700 hover:text-gray-500 transition-colors">
                  ▷ Cliquer pour sélectionner
                </span>
              )}
            </div>
          </div>

          {/* Selection glow border */}
          <motion.div
            className="absolute inset-0 pointer-events-none z-20"
            animate={{ opacity: isCorbeau ? 1 : 0 }}
            style={{ boxShadow: 'inset 0 0 0 1px rgba(0,212,255,0.45)' }}
          />
        </motion.div>

        {/* ── DIVIDER ── */}
        <motion.div
          className="absolute inset-y-0 w-px z-30 flex items-center justify-center"
          animate={{ left: isCorbeau ? '62%' : '38%' }}
          transition={SPRING}
          style={{
            background:
              'linear-gradient(180deg, transparent 0%, rgba(0,212,255,0.25) 25%, rgba(0,212,255,0.4) 50%, rgba(0,212,255,0.25) 75%, transparent 100%)',
          }}
        >
          <span
            className="font-mono text-[8px] text-forensics-cyan/30 tracking-[0.6em] select-none"
            style={{ writingMode: 'vertical-lr' }}
          >
            URIS
          </span>
        </motion.div>

        {/* ── RIGHT: Brain City ── */}
        <motion.div
          onClick={() => setSelectedScenario('braincity')}
          className="absolute inset-y-0 right-0 overflow-hidden cursor-pointer select-none"
          animate={{ width: isBraincity ? '62%' : '38%' }}
          transition={SPRING}
          style={{ background: 'linear-gradient(145deg, #FFF9EC 0%, #FFF3D4 55%, #FFEBC0 100%)' }}
        >
          {/* Dot grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(7,59,76,0.18) 1.5px, transparent 1.5px)',
              backgroundSize: '26px 26px',
            }}
          />

          {/* Decorative color blobs */}
          <div
            className="absolute -top-24 -right-24 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(239,71,111,0.18) 0%, transparent 70%)' }}
          />
          <div
            className="absolute -bottom-28 -left-20 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(17,138,178,0.15) 0%, transparent 70%)' }}
          />
          <div
            className="absolute top-[38%] right-16 w-24 h-24 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,209,102,0.5) 0%, transparent 70%)' }}
          />
          <div
            className="absolute top-10 left-20 w-14 h-14 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(6,214,160,0.4) 0%, transparent 70%)' }}
          />
          {/* Comic panel lines */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.06]"
            style={{
              backgroundImage: 'linear-gradient(rgba(7,59,76,1) 2px, transparent 2px)',
              backgroundSize: '100% 120px',
            }}
          />

          {/* Content */}
          <div className="relative z-20 h-full flex flex-col justify-between p-10">

            {/* Header badge row */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[9px] font-mono text-braincity-text/25 tracking-[0.4em] uppercase">
                  Op.&nbsp;Sonique&nbsp;#BC-04
                </span>
                <div className="flex-1 h-px bg-braincity-border/12" />
                <span
                  className="text-[9px] font-bold font-nunito border-2 px-2 py-px rounded-full tracking-wider uppercase"
                  style={{ color: '#EF476F', borderColor: '#EF476F' }}
                >
                  Enfants & Ados
                </span>
              </div>

              {/* Title */}
              <h2 className="font-bangers leading-none mb-5 overflow-hidden">
                <span
                  className="block"
                  style={{
                    color: '#118AB2',
                    fontSize: 'clamp(2.8rem, 4.5vw, 4rem)',
                    textShadow: '2px 2px 0 rgba(7,59,76,0.12)',
                  }}
                >
                  BRAIN
                </span>
                <span
                  className="block"
                  style={{
                    color: '#EF476F',
                    fontSize: 'clamp(3.5rem, 5.5vw, 5rem)',
                    textShadow: '3px 3px 0 rgba(7,59,76,0.18)',
                    lineHeight: 0.9,
                  }}
                >
                  CITY
                </span>
              </h2>

              {/* Mission details — revealed on selection */}
              <AnimatePresence>
                {isBraincity && (
                  <motion.div
                    key="braincity-details"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ delay: 0.08 }}
                    className="space-y-2.5 mt-2"
                  >
                    <div className="flex gap-3 text-sm font-nunito items-start">
                      <span className="text-lg leading-snug flex-shrink-0">🎯</span>
                      <span style={{ color: 'rgba(7,59,76,0.65)' }}>La Ballerina Cappuccina attaquée&nbsp;! La piste audio sabotée par Larry.</span>
                    </div>
                    <div className="flex gap-3 text-sm font-nunito items-start">
                      <span className="text-lg leading-snug flex-shrink-0">🔍</span>
                      <span style={{ color: 'rgba(7,59,76,0.65)' }}>{SCENARIOS.braincity.missionBrief.mission}</span>
                    </div>
                    <div className="flex gap-3 text-sm font-nunito items-start">
                      <span className="text-lg leading-snug flex-shrink-0">👥</span>
                      <span style={{ color: 'rgba(7,59,76,0.65)' }}>{SCENARIOS.braincity.suspects.length} suspects à confronter</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer status */}
            <div>
              {isBraincity ? (
                <div className="flex items-center gap-2.5 font-bold font-nunito text-sm" style={{ color: '#EF476F' }}>
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#EF476F' }} />
                  SÉLECTIONNÉ !
                </div>
              ) : (
                <span className="font-mono text-xs" style={{ color: 'rgba(7,59,76,0.3)' }}>
                  ▷ Cliquer pour sélectionner
                </span>
              )}
            </div>
          </div>

          {/* Selection border */}
          <motion.div
            className="absolute inset-0 pointer-events-none z-20"
            animate={{ opacity: isBraincity ? 1 : 0 }}
            style={{ boxShadow: 'inset 0 0 0 2px rgba(239,71,111,0.6)' }}
          />
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════
          BOTTOM BAR — Timer + Démarrage
      ══════════════════════════════════════════ */}
      <div
        className={`flex-shrink-0 border-t transition-colors duration-300 ${
          isCorbeau
            ? 'bg-[#06091e] border-forensics-cyan/12'
            : 'bg-[#FFF3D4] border-braincity-border/15'
        }`}
      >
        <div className="flex items-center gap-5 px-8 py-4">

          {/* Timer label */}
          <span
            className={`text-[10px] uppercase tracking-[0.4em] font-mono flex-shrink-0 transition-colors duration-300 ${
              isCorbeau ? 'text-forensics-cyan/40' : 'text-braincity-text/40'
            }`}
          >
            Timer
          </span>

          {/* Toggle switch */}
          <button
            onClick={() => setTimerEnabled((v) => !v)}
            className="relative flex-shrink-0 focus:outline-none"
            aria-label={timerEnabled ? 'Désactiver le timer' : 'Activer le timer'}
          >
            <motion.div
              className="w-11 h-6 rounded-full"
              animate={{
                backgroundColor: timerEnabled
                  ? isCorbeau ? '#00d4ff' : '#06D6A0'
                  : 'rgba(120,120,120,0.2)',
              }}
              transition={{ duration: 0.2 }}
            />
            <motion.div
              className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
              animate={{ left: timerEnabled ? '24px' : '4px' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>

          {/* Duration slider */}
          <AnimatePresence>
            {timerEnabled && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex items-center gap-3 overflow-hidden"
              >
                <input
                  type="range"
                  min="3"
                  max="15"
                  step="1"
                  value={timerMinutes}
                  onChange={(e) => setTimerMinutes(parseInt(e.target.value))}
                  className="w-28"
                  style={{ accentColor: isCorbeau ? '#00d4ff' : '#EF476F' }}
                />
                <span
                  className="text-sm font-mono font-bold whitespace-nowrap tabular-nums"
                  style={{ color: isCorbeau ? '#00d4ff' : '#EF476F' }}
                >
                  {timerMinutes}&thinsp;min
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1" />

          {/* CTA button */}
          <motion.button
            onClick={() => { void handleStart(); }}
            disabled={isLoading}
            className={`px-8 py-2.5 font-bold text-sm tracking-widest uppercase transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              isCorbeau
                ? 'bg-forensics-cyan text-forensics-bg font-mono hover:bg-white'
                : 'bg-[#EF476F] text-white font-nunito rounded-full hover:bg-[#073B4C]'
            }`}
            whileHover={{ scale: isLoading ? 1 : 1.04 }}
            whileTap={{ scale: isLoading ? 1 : 0.97 }}
          >
            {isLoading ? (
              <Spinner
                size="sm"
                color={isCorbeau ? 'border-forensics-bg' : 'border-white'}
                label="Chargement..."
              />
            ) : isCorbeau ? (
              '▶ Lancer la mission'
            ) : (
              '🚀 Démarrer !'
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};
