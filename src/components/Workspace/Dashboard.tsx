import { useEffect, useMemo, useCallback, memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAudioStore } from '@/stores/audioStore';
import { useAudioControls } from '@/hooks/useAudioControls';
import { useABComparison } from '@/hooks/useABComparison';
import {
  Waveform,
  Spectrogram,
  FrequencyBars,
  AudioMeter,
  ParameterDisplay,
} from '@/components/Visualization';
import FilterPanel from '@/components/Controls/FilterPanel';
import PitchControl from '@/components/Controls/PitchControl';
import { getScenario } from '@/data/scenarios';
import StreamDeckPanel from '@/components/StreamDeck/StreamDeckPanel';
import StreamDeckSuspectPanel from '@/components/StreamDeck/StreamDeckSuspectPanel';
import { useScenarioTheme } from '@/hooks/useScenarioTheme';
import RicardoBubble from '@/components/BrainCity/RicardoBubble';
import RicardoEventModal from '@/components/BrainCity/RicardoEventModal';
import KidsToolPanel from '@/components/BrainCity/KidsToolPanel';
import { audioEngine } from '@/services/audioEngine';
import { useRicardo } from '@/hooks/useRicardo';
import WorkspaceTour from '@/components/Workspace/WorkspaceTour';

type ToolTab = 'filtres' | 'pitch' | 'avance';

// Brain City Kid-Tech palette
const BC = {
  mustard: '#FFD166',
  teal: '#06D6A0',
  coral: '#EF476F',
  blue: '#118AB2',
  pink: '#FF70A6',
  violet: '#9D4EDD',
  border: '#073B4C',
  bg: '#FFF9EC',
  text: '#073B4C',
  dim: '#6b7280',
} as const;

/** Light flat bento card class shared by all BC panels. */
const BC_CARD = 'bg-white border-4 border-braincity-border rounded-[32px] overflow-hidden shadow-[0_6px_0_0_#073B4C]';

const Dashboard = memo(() => {
  const navigate = useNavigate();
  const store = useAudioStore();
  const {
    isPlaying, currentTime, duration, audioUrls,
    discoveredClues, addClue, isReversed,
    scenario: scenarioId,
    missionTimerEnabled, missionDuration, missionStartTime,
    setMissionStartTime,
  } = store;

  const [activeTab, setActiveTab] = useState<ToolTab>('filtres');
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerExpired, setTimerExpired] = useState(false);
  const [runTour, setRunTour] = useState(true);

  const { isComparisonMode, toggleComparison } = useABComparison();

  const scenario = getScenario(scenarioId);
  const { clueTriggers, analysisSteps } = scenario;
  const { isBrainCity } = useScenarioTheme();

  const clueCount = discoveredClues.length;
  const totalClues = clueTriggers.length;

  const ricardo = useRicardo(missionTimerEnabled ? timeLeft : null);

  useAudioControls();

  // Start timer on first workspace entry
  useEffect(() => {
    if (missionTimerEnabled && !missionStartTime) {
      setMissionStartTime(Date.now());
    }
  }, [missionTimerEnabled, missionStartTime, setMissionStartTime]);

  // Countdown tick
  useEffect(() => {
    if (!missionTimerEnabled || !missionStartTime) return;
    const tick = () => {
      const elapsed = Math.floor((Date.now() - missionStartTime) / 1000);
      const remaining = missionDuration - elapsed;
      if (remaining <= 0) {
        setTimeLeft(0);
        setTimerExpired(true);
      } else {
        setTimeLeft(remaining);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [missionTimerEnabled, missionStartTime, missionDuration]);

  // Auto-discover clues
  useEffect(() => {
    clueTriggers.forEach(({ id, check }) => {
      if (check(store) && !discoveredClues.includes(id)) {
        addClue(id);
      }
    });
  }, [store, discoveredClues, addClue, clueTriggers]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const formattedCurrentTime = useMemo(() => formatTime(currentTime), [currentTime, formatTime]);
  const formattedDuration    = useMemo(() => formatTime(duration),    [duration,    formatTime]);

  const handleContinueToSuspects = useCallback(() => navigate('/suspects'), [navigate]);

  const stepsDone = [
    isPlaying || currentTime > 0,
    store.lowPassFilter.enabled || store.highPassFilter.enabled ||
      store.bandPassFilter.enabled || store.notchFilter.enabled || store.compressor.enabled,
    store.pitchShift.semitones !== 0,
    store.isReversed,
  ];

  const activeAudioUrl = isReversed
    ? (audioUrls?.evidenceReverse ?? audioUrls?.evidenceDistorted)
    : audioUrls?.evidenceDistorted;

  const timerColor =
    timeLeft !== null && timeLeft < 60  ? 'text-red-500' :
    timeLeft !== null && timeLeft < 120 ? 'text-orange-500' :
    isBrainCity ? 'text-braincity-blue' : 'text-forensics-cyan';

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className={`min-h-screen p-4 ${isBrainCity ? 'bg-braincity-bg' : ''}`} style={isBrainCity ? { backgroundImage: 'radial-gradient(circle, #E0D4C3 2px, transparent 2px)', backgroundSize: '24px 24px' } : {}}>
      <div className="max-w-[1800px] mx-auto space-y-4">

        {/* ── HEADER ── */}
        <motion.header
          className={`flex items-center justify-between rounded-xl px-5 py-3 ${
            isBrainCity
              ? `${BC_CARD}`
              : 'bg-forensics-bg-light border border-forensics-cyan-dark'
          }`}
          style={isBrainCity ? {} : {}}
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {isBrainCity ? (
            <>
              {/* Left: title */}
              <div className="flex items-center gap-3">
                <motion.img
                  src="/images/inspecteur/Ricardo_Pouleto_sticker.png"
                  alt="Ricardo"
                  className="w-9 h-9 object-contain"
                  animate={{ rotate: [0, -8, 8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, repeatDelay: 4 }}
                />
                <div>
                  <h1
                    className="font-bangers text-3xl tracking-wider leading-none"
                    style={{ color: BC.coral, textShadow: '2px 2px 0px #073B4C' }}
                  >
                    BRAIN CITY
                  </h1>
                  <p className="text-braincity-text text-sm font-fredoka font-semibold mt-0.5">
                    Trouve l'agresseur !
                  </p>
                </div>
              </div>

              {/* Right: controls */}
              <div className="flex items-center gap-4">
                {/* Track position */}
                <div className="text-center">
                  <div className="font-fredoka text-xl font-bold leading-none" style={{ color: BC.blue }}>
                    {formattedCurrentTime}
                  </div>
                  <div className="text-braincity-dim text-[10px] mt-0.5 font-bangers tracking-wider">PISTE</div>
                </div>

                {/* Mission timer */}
                {missionTimerEnabled && timeLeft !== null && (
                  <div className="text-center">
                    <div className={`font-fredoka text-xl font-bold leading-none ${isBrainCity ? 'text-[#EF476F]' : timerColor}`}>
                      {formatTime(timeLeft)}
                    </div>
                    <div className="text-braincity-dim text-[10px] mt-0.5 font-bangers tracking-wider">TEMPS</div>
                  </div>
                )}

                {/* Stars progress */}
                <div className="flex gap-1 items-center">
                  {clueTriggers.map(({ id }) => {
                    const found = discoveredClues.includes(id);
                    return (
                      <motion.span
                        key={id}
                        className="text-lg leading-none"
                        style={{
                          filter: found
                            ? `drop-shadow(2px 2px 0px #073B4C)`
                            : 'grayscale(1) opacity(0.3)',
                        }}
                        animate={found ? { scale: [1, 1.4, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        ⭐
                      </motion.span>
                    );
                  })}
                </div>

                {/* J'ACCUSE */}
                <motion.button
                  onClick={handleContinueToSuspects}
                  className="px-6 py-2.5 font-bangers text-xl tracking-widest rounded-2xl text-white border-2 border-braincity-border"
                  style={{
                    background: BC.coral,
                    boxShadow: `0 4px 0 0 #073B4C`,
                  }}
                  whileHover={{ scale: 1.04, translateY: -2, boxShadow: `0 6px 0 0 #073B4C` }}
                  whileTap={{ scale: 0.96, translateY: 4, boxShadow: `0 0 0 0 #073B4C` }}
                >
                  J'ACCUSE !
                </motion.button>
              </div>
            </>
          ) : (
            <>
              <div>
                <h1 className="text-2xl font-bold text-forensics-cyan font-mono leading-none">
                  {scenario.title.toUpperCase()}
                </h1>
                <p className="text-gray-500 font-mono text-xs mt-0.5">{scenario.subtitle}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-forensics-cyan font-mono text-lg font-bold leading-none">
                    {formattedCurrentTime} / {formattedDuration}
                  </div>
                  <div className="text-gray-600 font-mono text-[10px] mt-0.5">PISTE</div>
                </div>
                {missionTimerEnabled && timeLeft !== null && (
                  <div className="text-center">
                    <div className={`font-mono text-lg font-bold leading-none ${timerColor}`}>
                      {formatTime(timeLeft)}
                    </div>
                    <div className="text-gray-600 font-mono text-[10px] mt-0.5">MISSION</div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {clueTriggers.map(({ id }) => (
                      <div
                        key={id}
                        className={`w-2 h-2 rounded-full transition-all ${
                          discoveredClues.includes(id) ? 'bg-forensics-green' : 'bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-mono text-gray-400">
                    {clueCount}/{totalClues} indices
                  </span>
                </div>
                <motion.button
                  onClick={handleContinueToSuspects}
                  className="px-5 py-2 bg-forensics-green text-forensics-bg font-mono font-bold rounded uppercase tracking-wider text-sm hover:bg-white transition-colors"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  → Identifier le Suspect
                </motion.button>
              </div>
            </>
          )}
        </motion.header>

        {/* ── Ricardo event modal ── */}
        <AnimatePresence>
          {isBrainCity && ricardo.isEvent && (
            <RicardoEventModal
              emotion={ricardo.emotion}
              title={ricardo.eventTitle ?? ''}
              message={ricardo.message}
              clueProgress={{ found: clueCount, total: totalClues }}
              onDismiss={ricardo.dismissEvent}
            />
          )}
        </AnimatePresence>

        {/* ── Timer expired overlay ── */}
        <AnimatePresence>
          {timerExpired && (
            <motion.div
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className={`border-4 rounded-[24px] p-8 max-w-md text-center ${
                  isBrainCity ? 'bg-braincity-bg border-braincity-coral shadow-[0_8px_0_0_#EF476F]' : 'bg-forensics-bg-light border-red-500'
                }`}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
              >
                <div className="text-6xl mb-4">⏰</div>
                {isBrainCity ? (
                  <>
                    <h2
                      className="font-bangers text-4xl tracking-wider mb-2"
                      style={{ color: BC.coral }}
                    >
                      TEMPS ÉCOULÉ !
                    </h2>
                    <p className="text-braincity-text text-sm font-fredoka font-semibold mb-6">
                      Le temps est épuisé. Tu peux continuer ou identifier le suspect !
                    </p>
                    <div className="flex gap-3">
                      <motion.button
                        onClick={() => setTimerExpired(false)}
                        className="flex-1 py-3 font-bangers text-xl tracking-wider rounded-2xl bg-white text-braincity-text border-4 border-braincity-border"
                        style={{ boxShadow: `0 4px 0 0 #073B4C` }}
                        whileHover={{ scale: 1.03, translateY: -2, boxShadow: `0 6px 0 0 #073B4C` }}
                        whileTap={{ scale: 0.97, translateY: 4, boxShadow: `0 0 0 0 #073B4C` }}
                      >
                        CONTINUER
                      </motion.button>
                      <motion.button
                        onClick={handleContinueToSuspects}
                        className="flex-1 py-3 font-bangers text-xl tracking-wider rounded-2xl text-white border-4 border-braincity-border"
                        style={{ background: BC.coral, boxShadow: `0 4px 0 0 #073B4C` }}
                        whileHover={{ scale: 1.03, translateY: -2, boxShadow: `0 6px 0 0 #073B4C` }}
                        whileTap={{ scale: 0.97, translateY: 4, boxShadow: `0 0 0 0 #073B4C` }}
                      >
                        J'ACCUSE !
                      </motion.button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-3xl font-bold text-red-500 font-mono mb-3">
                      TEMPS ÉCOULÉ !
                    </h2>
                    <p className="text-gray-300 font-mono text-sm mb-6">
                      Le temps imparti est épuisé. Vous pouvez continuer ou recommencer.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setTimerExpired(false)}
                        className="flex-1 py-2 bg-forensics-cyan text-forensics-bg font-mono font-bold rounded hover:bg-white transition-colors"
                      >
                        CONTINUER
                      </button>
                      <button
                        onClick={handleContinueToSuspects}
                        className="flex-1 py-2 bg-forensics-green text-forensics-bg font-mono font-bold rounded hover:bg-white transition-colors"
                      >
                        IDENTIFIER
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-12 gap-4">

          {/* ═══ LEFT: Visualisations ═══ */}
          <div className="col-span-12 lg:col-span-8 space-y-4">

            {/* Mission brief / Ricardo bubble */}
            <motion.div
              className={
                isBrainCity
                  ? `${BC_CARD} p-4`
                  : 'bg-forensics-bg-light border border-forensics-cyan-dark rounded-lg px-5 py-3'
              }
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {isBrainCity ? (
                <RicardoBubble
                  message={ricardo.message}
                  emotion={ricardo.emotion}
                  soundOnMessage={ricardo.soundKey}
                />
              ) : (
                <div className="flex items-start gap-6 flex-wrap">
                  <div className="flex items-center gap-2 text-sm font-mono">
                    <span className="text-forensics-green text-xs">▸ CRIME</span>
                    <span className="text-gray-300">{scenario.missionBrief.crime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-mono">
                    <span className="text-forensics-green text-xs">▸ PREUVE</span>
                    <span className="text-gray-300">{scenario.missionBrief.evidence}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-mono">
                    <span className="text-forensics-green text-xs">▸ MISSION</span>
                    <span className="text-gray-300">{scenario.missionBrief.mission}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-mono ml-auto">
                    <span className="px-2 py-0.5 bg-red-500/20 border border-red-500 rounded text-red-400 text-xs animate-pulse">
                      🚨 URGENT
                    </span>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Waveform */}
            <motion.div
              id="tour-waveform"
              className={
                isBrainCity
                  ? `${BC_CARD} p-4`
                  : 'bg-forensics-bg-light border border-forensics-cyan-dark rounded-lg p-4'
              }
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-3">
                {isBrainCity ? (
                  <>
                    <h3 className="font-bangers text-xl tracking-wider" style={{ color: BC.blue }}>
                      ENREGISTREMENT
                      {isReversed && (
                        <span className="ml-3 text-sm font-bangers" style={{ color: BC.coral }}>
                          ◀ INVERSÉ
                        </span>
                      )}
                    </h3>
                    <motion.button
                      onClick={() => { store.toggleReverse(); audioEngine.setReverse(!isReversed); }}
                      className="px-4 py-2 rounded-xl text-sm font-bold font-fredoka transition-all border-2 border-braincity-border bg-white"
                      style={isReversed ? {
                        boxShadow: `0 4px 0 0 #073B4C`,
                        color: BC.coral,
                        transform: 'translateY(2px)'
                      } : {
                        boxShadow: `0 6px 0 0 #073B4C`,
                        color: BC.text,
                      }}
                      whileHover={{ translateY: isReversed ? 2 : -2, boxShadow: isReversed ? `0 4px 0 0 #073B4C` : `0 8px 0 0 #073B4C` }}
                      whileTap={{ translateY: 6, boxShadow: `0 0 0 0 #073B4C` }}
                    >
                      🔄 Inverser
                    </motion.button>
                  </>
                ) : (
                  <>
                    <h3 className="text-sm font-bold text-forensics-cyan font-mono tracking-wider">
                      FORME D'ONDE {isReversed && <span className="text-forensics-orange ml-2">◀◀ INVERSÉE</span>}
                    </h3>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={toggleComparison}
                        className={`px-3 py-1 font-mono text-xs font-bold rounded border transition-all ${
                          isComparisonMode
                            ? 'bg-forensics-orange/20 border-forensics-orange text-forensics-orange'
                            : 'bg-forensics-bg border-forensics-cyan-dark text-forensics-cyan hover:border-forensics-cyan'
                        }`}
                      >
                        {isComparisonMode ? 'A/B: BYPASS' : 'A/B: FILTRES'}
                      </button>
                      <span className="text-gray-600 font-mono text-xs">
                        Cliquez pour lire / pause
                      </span>
                    </div>
                  </>
                )}
              </div>
              <Waveform audioUrl={activeAudioUrl} isBrainCity={isBrainCity} />
            </motion.div>

            {/* Spectrogram */}
            <motion.div
              id="tour-spectrogram"
              className={
                isBrainCity
                  ? `${BC_CARD} p-4`
                  : 'bg-forensics-bg-light border border-forensics-cyan-dark rounded-lg p-4'
              }
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3
                className={`mb-3 ${isBrainCity ? 'font-bangers text-xl tracking-wider' : 'text-sm font-bold text-forensics-cyan font-mono tracking-wider'}`}
                style={isBrainCity ? { color: BC.violet } : {}}
              >
                {isBrainCity ? 'CARTE DES SONS' : 'SPECTROGRAMME'}
              </h3>
              <Spectrogram audioUrl={activeAudioUrl} isBrainCity={isBrainCity} />
            </motion.div>

            {/* Frequency Bars */}
            <motion.div
              className={
                isBrainCity
                  ? `${BC_CARD} p-4`
                  : 'bg-forensics-bg-light border border-forensics-cyan-dark rounded-lg p-4'
              }
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3
                className={`mb-3 ${isBrainCity ? 'font-bangers text-xl tracking-wider' : 'text-sm font-bold text-forensics-cyan font-mono tracking-wider'}`}
                style={isBrainCity ? { color: BC.teal } : {}}
              >
                {isBrainCity ? 'FRÉQUENCES' : 'ANALYSE FRÉQUENTIELLE'}
              </h3>
              <FrequencyBars isPlaying={isPlaying} height={120} isBrainCity={isBrainCity} />
            </motion.div>
          </div>

          {/* ═══ RIGHT: Controls ═══ */}
          <div className="col-span-12 lg:col-span-4 space-y-4">

            {/* Steps guide */}
            <motion.div
              className={
                isBrainCity
                  ? `${BC_CARD} p-4`
                  : 'bg-forensics-bg-light border border-forensics-cyan-dark rounded-lg p-4'
              }
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <h3
                className={`mb-3 ${isBrainCity ? 'font-bangers text-xl tracking-wider' : 'text-sm font-bold text-forensics-cyan font-mono tracking-wider'}`}
                style={isBrainCity ? { color: BC.blue } : {}}
              >
                {isBrainCity ? 'ÉTAPES' : "GUIDE D'ANALYSE"}
              </h3>
              <ol className="space-y-2">
                {analysisSteps.map((text, i) => {
                  const done = stepsDone[i];
                  return (
                    <li
                      key={i}
                      className={`flex items-start gap-3 text-xs transition-colors ${
                        isBrainCity
                          ? ''
                          : done ? 'text-forensics-green font-mono' : 'text-gray-500 font-mono'
                      }`}
                      style={isBrainCity ? { color: done ? BC.text : BC.dim, fontWeight: done ? 'bold' : 'normal', fontFamily: 'Fredoka, sans-serif', fontSize: '13px' } : {}}
                    >
                      <span
                        className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          !isBrainCity
                            ? done
                              ? 'border-forensics-green bg-forensics-green/20 text-forensics-green border'
                              : 'border border-gray-600 text-gray-600'
                            : ''
                        }`}
                        style={isBrainCity ? (done ? {
                          background: BC.teal,
                          color: '#000',
                          border: '2px solid #073B4C',
                          boxShadow: `0 2px 0 0 #073B4C`,
                        } : {
                          background: '#F3F4F6',
                          border: '2px solid #D1D5DB',
                          color: '#9CA3AF',
                        }) : {}}
                      >
                        {done ? '✓' : i + 1}
                      </span>
                      <span className="leading-5">{text}</span>
                    </li>
                  );
                })}
              </ol>
            </motion.div>

            {/* Audio Meter */}
            <motion.div
              className={
                isBrainCity
                  ? `${BC_CARD} p-4`
                  : 'bg-forensics-bg-light border border-forensics-cyan-dark rounded-lg p-4'
              }
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <h3
                className={`mb-3 ${isBrainCity ? 'font-bangers text-lg tracking-wider' : 'text-sm font-bold text-forensics-cyan font-mono tracking-wider'}`}
                style={isBrainCity ? { color: BC.mustard } : {}}
              >
                {isBrainCity ? 'NIVEAUX' : 'NIVEAUX AUDIO'}
              </h3>
              <AudioMeter isPlaying={isPlaying} height={150} isBrainCity={isBrainCity} />
            </motion.div>

            {/* Tools */}
            <motion.div
              id="tour-tools"
              className={
                isBrainCity
                  ? `${BC_CARD}`
                  : `bg-forensics-bg-light border border-forensics-cyan-dark rounded-lg overflow-hidden`
              }
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              {isBrainCity ? (
                <div className="p-4">
                  <h3
                    className="font-bangers text-lg tracking-wider mb-3"
                    style={{ color: BC.mustard }}
                  >
                    OUTILS DÉTECTIVE
                  </h3>
                  <KidsToolPanel />
                </div>
              ) : (
                <>
                  <div className="flex border-b border-forensics-cyan-dark">
                    {(
                      [
                        { key: 'filtres',  label: 'FILTRES' },
                        { key: 'pitch',    label: 'PITCH' },
                        { key: 'avance',   label: 'PARAMÈTRES' },
                      ] as { key: ToolTab; label: string }[]
                    ).map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`flex-1 py-2.5 text-xs font-mono font-bold tracking-wider transition-colors ${
                          activeTab === key
                            ? 'bg-forensics-cyan/10 text-forensics-cyan border-b-2 border-forensics-cyan'
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="p-4 max-h-[520px] overflow-y-auto">
                    {activeTab === 'filtres' && <FilterPanel />}
                    {activeTab === 'pitch'   && <PitchControl />}
                    {activeTab === 'avance'  && (
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-forensics-cyan font-mono tracking-wider">
                          PARAMÈTRES ACTIFS
                        </h4>
                        <ParameterDisplay />
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>

            {/* Clue tracker */}
            <motion.div
              id="tour-clues"
              className={
                isBrainCity
                  ? `${BC_CARD} p-4`
                  : 'bg-forensics-bg-light border border-forensics-cyan-dark rounded-lg p-4'
              }
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3
                  className={`${isBrainCity ? 'font-bangers text-lg tracking-wider' : 'text-sm font-bold text-forensics-cyan font-mono tracking-wider'}`}
                  style={isBrainCity ? { color: BC.pink } : {}}
                >
                  INDICES
                </h3>
                <span
                  className="text-xs font-bold"
                  style={isBrainCity ? { color: BC.pink } : { color: '#6b7280', fontFamily: 'monospace' }}
                >
                  {clueCount}/{totalClues}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {clueTriggers.map(({ id, label, hint }) => {
                  const found = discoveredClues.includes(id);
                  return (
                    <motion.div
                      key={id}
                      className={`flex items-start gap-2 p-2 rounded-lg text-[11px] transition-all ${
                        !isBrainCity
                          ? found
                            ? 'border border-forensics-green/40 bg-forensics-green/5 text-forensics-green font-mono'
                            : 'border border-gray-800 text-gray-700 font-mono'
                          : ''
                      }`}
                      style={isBrainCity ? (found ? {
                        border: `2px solid ${BC.blue}`,
                        background: '#FFF9EC',
                        boxShadow: `0 2px 0 0 ${BC.blue}`,
                      } : {
                        border: '2px dashed #9CA3AF',
                        background: '#F3F4F6',
                        color: '#9CA3AF',
                      }) : {}}
                      animate={found && isBrainCity ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="flex-shrink-0 mt-0.5">
                        {isBrainCity
                          ? (found
                            ? <span style={{ filter: `drop-shadow(1px 1px 0px #073B4C)` }}>⭐</span>
                            : <span style={{ color: '#9CA3AF' }}>☆</span>
                          )
                          : (found ? '✓' : '○')
                        }
                      </span>
                      <div className="min-w-0">
                        <div
                          className={`leading-tight ${isBrainCity ? 'font-fredoka font-bold' : ''}`}
                          style={isBrainCity ? { color: found ? BC.blue : BC.dim } : {}}
                        >
                          {found ? label : '???'}
                        </div>
                        {found && (
                          <div
                            className={`text-[11px] mt-0.5 ${isBrainCity ? 'font-fredoka font-semibold' : ''}`}
                            style={isBrainCity ? { color: BC.text } : { color: '#6b7280' }}
                          >
                            {hint}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Stream Deck panels */}
            <div id="tour-streamdeck" className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <StreamDeckPanel />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.52 }}
              >
                <StreamDeckSuspectPanel />
              </motion.div>
            </div>

            {/* Continue CTA */}
            <motion.div
              id="tour-jaccuse"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 }}
            >
              {isBrainCity ? (
                <motion.button
                  onClick={handleContinueToSuspects}
                  className="w-full font-bangers text-xl tracking-widest py-4 rounded-xl text-black"
                  style={{
                    background: BC.mustard,
                    boxShadow: `0 0 20px rgba(240,229,0,0.4), 0 4px 12px rgba(0,0,0,0.4)`,
                  }}
                  whileHover={{ scale: 1.02, boxShadow: `0 0 32px rgba(240,229,0,0.7)` }}
                  whileTap={{ scale: 0.97 }}
                >
                  ⚡ J'ACCUSE !
                </motion.button>
              ) : (
                <button
                  onClick={handleContinueToSuspects}
                  className="w-full bg-forensics-green text-forensics-bg font-mono font-bold py-4 rounded-2xl uppercase tracking-wider text-sm hover:bg-white transition-colors"
                >
                  → Identifier le Suspect
                </button>
              )}
              <p className={`text-xs text-center mt-1.5 ${isBrainCity ? '' : 'text-gray-600 font-mono'}`}
                 style={isBrainCity ? { color: '#44447a' } : {}}>
                {isBrainCity ? "Tu penses savoir qui c'est ?" : 'Passez à la comparaison vocale'}
              </p>
            </motion.div>
          </div>
        </div>

        {/* ── Interactive Tour ── */}
        <WorkspaceTour
          run={runTour}
          onFinish={() => setRunTour(false)}
        />
      </div>
    </div>
  );
});

Dashboard.displayName = 'Dashboard';
export default Dashboard;
