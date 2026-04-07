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

type ToolTab = 'filtres' | 'pitch' | 'avance';

// Brain City neon palette — each section has its own accent colour
const BC = {
  cyan:   '#00e5ff',
  purple: '#a855f7',
  green:  '#3dff85',
  yellow: '#f0e500',
  orange: '#ff7730',
  pink:   '#ff3fa4',
  blue:   '#3b82f6',
  red:    '#ff3355',
} as const;

/** Dark card class shared by all BC panels. */
const BC_CARD = 'bg-braincity-card border border-braincity-border rounded-xl overflow-hidden';

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
    timeLeft !== null && timeLeft < 120 ? 'text-forensics-orange' :
    isBrainCity ? 'text-[#00e5ff]' : 'text-forensics-cyan';

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-[1800px] mx-auto space-y-4">

        {/* ── HEADER ── */}
        <motion.header
          className={`flex items-center justify-between rounded-xl px-5 py-3 ${
            isBrainCity
              ? `${BC_CARD}`
              : 'bg-forensics-bg-light border border-forensics-cyan-dark'
          }`}
          style={isBrainCity ? { borderBottom: `2px solid ${BC.yellow}`, boxShadow: `0 2px 20px rgba(240,229,0,0.1)` } : {}}
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
                    className="font-bangers text-2xl tracking-wider leading-none animate-neon-flicker"
                    style={{ color: BC.yellow, textShadow: `0 0 20px rgba(240,229,0,0.6)` }}
                  >
                    BRAIN CITY
                  </h1>
                  <p className="text-braincity-dim text-xs font-nunito mt-0.5">
                    Mission : Trouve l'agresseur !
                  </p>
                </div>
              </div>

              {/* Right: controls */}
              <div className="flex items-center gap-4">
                {/* Track position */}
                <div className="text-center">
                  <div className="font-mono text-base font-bold leading-none" style={{ color: BC.cyan }}>
                    {formattedCurrentTime}
                  </div>
                  <div className="text-braincity-dim text-[10px] mt-0.5 font-bangers tracking-wider">PISTE</div>
                </div>

                {/* Mission timer */}
                {missionTimerEnabled && timeLeft !== null && (
                  <div className="text-center">
                    <div className={`font-mono text-base font-bold leading-none ${timerColor}`}>
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
                            ? `drop-shadow(0 0 6px ${BC.yellow})`
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
                  className="px-5 py-2 font-bangers text-base tracking-widest rounded-xl text-black"
                  style={{
                    background: BC.yellow,
                    boxShadow: `0 0 16px rgba(240,229,0,0.5), 0 2px 8px rgba(0,0,0,0.4)`,
                  }}
                  whileHover={{ scale: 1.06, boxShadow: `0 0 28px rgba(240,229,0,0.9)` }}
                  whileTap={{ scale: 0.94 }}
                >
                  ⚡ J'ACCUSE !
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
                className={`border-2 rounded-xl p-8 max-w-md text-center ${
                  isBrainCity ? `${BC_CARD}` : 'bg-forensics-bg-light border-red-500'
                }`}
                style={isBrainCity ? {
                  borderColor: BC.red,
                  boxShadow: `0 0 40px rgba(255,51,85,0.5)`,
                } : {}}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
              >
                <div className="text-6xl mb-4">⏰</div>
                {isBrainCity ? (
                  <>
                    <h2
                      className="font-bangers text-4xl tracking-wider mb-3"
                      style={{ color: BC.red, textShadow: `0 0 20px rgba(255,51,85,0.6)` }}
                    >
                      TEMPS ÉCOULÉ !
                    </h2>
                    <p className="text-braincity-text text-sm font-nunito mb-6">
                      Le temps est épuisé. Tu peux continuer ou identifier le suspect !
                    </p>
                    <div className="flex gap-3">
                      <motion.button
                        onClick={() => setTimerExpired(false)}
                        className="flex-1 py-2.5 font-bangers text-base tracking-wider rounded-lg"
                        style={{ background: '#12123a', border: `1px solid ${BC.cyan}`, color: BC.cyan }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        CONTINUER
                      </motion.button>
                      <motion.button
                        onClick={handleContinueToSuspects}
                        className="flex-1 py-2.5 font-bangers text-base tracking-wider rounded-lg text-black"
                        style={{ background: BC.yellow, boxShadow: `0 0 12px rgba(240,229,0,0.5)` }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
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
                  ? `${BC_CARD} p-4 bc-accent-yellow`
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
              className={
                isBrainCity
                  ? `${BC_CARD} p-4 bc-accent-cyan`
                  : 'bg-forensics-bg-light border border-forensics-cyan-dark rounded-lg p-4'
              }
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-3">
                {isBrainCity ? (
                  <>
                    <h3 className="font-bangers text-lg tracking-wider" style={{ color: BC.cyan }}>
                      ENREGISTREMENT
                      {isReversed && (
                        <span className="ml-3 text-sm font-bangers" style={{ color: BC.orange }}>
                          ◀ INVERSÉ
                        </span>
                      )}
                    </h3>
                    <motion.button
                      onClick={() => { store.toggleReverse(); audioEngine.setReverse(!isReversed); }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold font-nunito transition-all"
                      style={isReversed ? {
                        background: `${BC.orange}1a`,
                        border: `1px solid ${BC.orange}`,
                        color: BC.orange,
                      } : {
                        background: 'transparent',
                        border: '1px solid #1a1a48',
                        color: '#44447a',
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
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
              <Waveform audioUrl={activeAudioUrl} />
            </motion.div>

            {/* Spectrogram */}
            <motion.div
              className={
                isBrainCity
                  ? `${BC_CARD} p-4 bc-accent-purple`
                  : 'bg-forensics-bg-light border border-forensics-cyan-dark rounded-lg p-4'
              }
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3
                className={`mb-3 ${isBrainCity ? 'font-bangers text-lg tracking-wider' : 'text-sm font-bold text-forensics-cyan font-mono tracking-wider'}`}
                style={isBrainCity ? { color: BC.purple } : {}}
              >
                {isBrainCity ? 'CARTE DES SONS' : 'SPECTROGRAMME'}
              </h3>
              <Spectrogram audioUrl={activeAudioUrl} isBrainCity={isBrainCity} />
            </motion.div>

            {/* Frequency Bars */}
            <motion.div
              className={
                isBrainCity
                  ? `${BC_CARD} p-4 bc-accent-green`
                  : 'bg-forensics-bg-light border border-forensics-cyan-dark rounded-lg p-4'
              }
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3
                className={`mb-3 ${isBrainCity ? 'font-bangers text-lg tracking-wider' : 'text-sm font-bold text-forensics-cyan font-mono tracking-wider'}`}
                style={isBrainCity ? { color: BC.green } : {}}
              >
                {isBrainCity ? 'FRÉQUENCES' : 'ANALYSE FRÉQUENTIELLE'}
              </h3>
              <FrequencyBars isPlaying={isPlaying} height={120} />
            </motion.div>
          </div>

          {/* ═══ RIGHT: Controls ═══ */}
          <div className="col-span-12 lg:col-span-4 space-y-4">

            {/* Steps guide */}
            <motion.div
              className={
                isBrainCity
                  ? `${BC_CARD} p-4 bc-accent-blue`
                  : 'bg-forensics-bg-light border border-forensics-cyan-dark rounded-lg p-4'
              }
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <h3
                className={`mb-3 ${isBrainCity ? 'font-bangers text-lg tracking-wider' : 'text-sm font-bold text-forensics-cyan font-mono tracking-wider'}`}
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
                      style={isBrainCity ? { color: done ? '#c8c8ff' : '#44447a' } : {}}
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
                          background: BC.green,
                          color: '#000',
                          boxShadow: `0 0 8px ${BC.green}80`,
                        } : {
                          border: '1px solid #1a1a48',
                          color: '#44447a',
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
                  ? `${BC_CARD} p-4 bc-accent-yellow`
                  : 'bg-forensics-bg-light border border-forensics-cyan-dark rounded-lg p-4'
              }
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <h3
                className={`mb-3 ${isBrainCity ? 'font-bangers text-lg tracking-wider' : 'text-sm font-bold text-forensics-cyan font-mono tracking-wider'}`}
                style={isBrainCity ? { color: BC.yellow } : {}}
              >
                {isBrainCity ? 'NIVEAUX' : 'NIVEAUX AUDIO'}
              </h3>
              <AudioMeter isPlaying={isPlaying} height={150} />
            </motion.div>

            {/* Tools */}
            <motion.div
              className={
                isBrainCity
                  ? `${BC_CARD} bc-accent-orange`
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
                    style={{ color: BC.orange }}
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
              className={
                isBrainCity
                  ? `${BC_CARD} p-4 bc-accent-pink`
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
                        border: `1px solid ${BC.pink}60`,
                        background: `${BC.pink}10`,
                        boxShadow: `0 0 8px ${BC.pink}28`,
                      } : {
                        border: '1px dashed #1a1a48',
                      }) : {}}
                      animate={found && isBrainCity ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="flex-shrink-0 mt-0.5">
                        {isBrainCity
                          ? (found
                            ? <span style={{ filter: `drop-shadow(0 0 4px ${BC.yellow})` }}>⭐</span>
                            : <span style={{ color: '#2a2a5a' }}>☆</span>
                          )
                          : (found ? '✓' : '○')
                        }
                      </span>
                      <div className="min-w-0">
                        <div
                          className="leading-tight"
                          style={isBrainCity ? { color: found ? '#e0e0ff' : '#44447a' } : {}}
                        >
                          {found ? label : '???'}
                        </div>
                        {found && (
                          <div
                            className="text-[10px] mt-0.5"
                            style={isBrainCity ? { color: BC.pink } : { color: '#6b7280' }}
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

            {/* Continue CTA */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 }}
            >
              {isBrainCity ? (
                <motion.button
                  onClick={handleContinueToSuspects}
                  className="w-full font-bangers text-xl tracking-widest py-4 rounded-xl text-black"
                  style={{
                    background: BC.yellow,
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
      </div>
    </div>
  );
});

Dashboard.displayName = 'Dashboard';
export default Dashboard;
