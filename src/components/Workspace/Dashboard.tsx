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

  // Start timer when entering workspace
  useEffect(() => {
    if (missionTimerEnabled && !missionStartTime) {
      setMissionStartTime(Date.now());
    }
  }, [missionTimerEnabled, missionStartTime, setMissionStartTime]);

  // Countdown interval
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

  // Detect clues
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
  const formattedDuration = useMemo(() => formatTime(duration), [duration, formatTime]);

  const handleContinueToSuspects = useCallback(() => navigate('/suspects'), [navigate]);

  const stepsDone = [
    isPlaying || currentTime > 0,
    store.lowPassFilter.enabled || store.highPassFilter.enabled || store.bandPassFilter.enabled || store.notchFilter.enabled || store.compressor.enabled,
    store.pitchShift.semitones !== 0,
    store.isReversed,
  ];

  const activeAudioUrl = isReversed
    ? (audioUrls?.evidenceReverse ?? audioUrls?.evidenceDistorted)
    : audioUrls?.evidenceDistorted;

  const timerColor =
    timeLeft !== null && timeLeft < 60
      ? 'text-red-500'
      : timeLeft !== null && timeLeft < 120
      ? 'text-forensics-orange'
      : isBrainCity ? 'text-braincity-primary' : 'text-forensics-cyan';

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-[1800px] mx-auto space-y-4">

        {/* ── HEADER ── */}
        <motion.header
          className={`flex items-center justify-between rounded-lg px-5 py-3 ${
            isBrainCity
              ? 'bg-white shadow-sm border border-sky-100'
              : 'bg-forensics-bg-light border border-forensics-cyan-dark'
          }`}
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {isBrainCity ? (
            <>
              <div className="flex items-center gap-3">
                <img src="/images/inspecteur/Ricardo_Pouleto_sticker.png" alt="Ricardo" className="w-8 h-8 object-contain" />
                <div>
                  <h1 className="text-xl font-black text-braincity-primary leading-none">BRAIN CITY 🏙️</h1>
                  <p className="text-gray-400 text-xs font-semibold mt-0.5">Mission : Trouve l'agresseur !</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-braincity-primary font-bold text-base leading-none">
                    {formattedCurrentTime}
                  </div>
                  <div className="text-gray-400 text-[10px] mt-0.5 font-semibold">PISTE</div>
                </div>
                {missionTimerEnabled && timeLeft !== null && (
                  <div className="text-center">
                    <div className={`font-bold text-base leading-none ${timerColor}`}>
                      {formatTime(timeLeft)}
                    </div>
                    <div className="text-gray-400 text-[10px] mt-0.5 font-semibold">MISSION</div>
                  </div>
                )}
                {/* Star-based clue progress */}
                <div className="flex gap-1">
                  {clueTriggers.map(({ id }) => (
                    <motion.span
                      key={id}
                      className="text-lg leading-none"
                      animate={discoveredClues.includes(id) ? { scale: [1, 1.4, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      {discoveredClues.includes(id) ? '⭐' : '☆'}
                    </motion.span>
                  ))}
                </div>
                <motion.button
                  onClick={handleContinueToSuspects}
                  className="px-4 py-2 font-black rounded-2xl text-white text-sm"
                  style={{ background: 'linear-gradient(90deg, #22d3ee, #84cc16)' }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  🎯 J'accuse !
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

        {/* Ricardo event modal */}
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

        {/* Timer expired overlay */}
        <AnimatePresence>
          {timerExpired && (
            <motion.div
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="bg-forensics-bg-light border-2 border-red-500 rounded-lg p-8 max-w-md text-center"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
              >
                <div className="text-6xl mb-4">⏰</div>
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
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-12 gap-4">

          {/* ── LEFT: Visualisations ── */}
          <div className="col-span-12 lg:col-span-8 space-y-4">

            {/* Mission brief */}
            <motion.div
              className={`rounded-lg px-5 py-3 ${
                isBrainCity
                  ? 'bg-white shadow-sm border border-sky-100'
                  : 'bg-forensics-bg-light border border-forensics-cyan-dark'
              }`}
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
              className={`rounded-lg p-4 ${
                isBrainCity
                  ? 'bg-white shadow-sm border border-sky-100'
                  : 'bg-forensics-bg-light border border-forensics-cyan-dark'
              }`}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-3">
                {isBrainCity ? (
                  <h3 className="text-sm font-bold text-braincity-primary">
                    🎧 L'enregistrement mystère {isReversed && <span className="text-braincity-accent ml-2">🔄 INVERSÉ</span>}
                  </h3>
                ) : (
                  <h3 className="text-sm font-bold text-forensics-cyan font-mono tracking-wider">
                    FORME D'ONDE {isReversed && <span className="text-forensics-orange ml-2">◀◀ INVERSÉE</span>}
                  </h3>
                )}
                <div className="flex items-center gap-3">
                  {isBrainCity ? (
                    <motion.button
                      onClick={() => { store.toggleReverse(); audioEngine.setReverse(!isReversed); }}
                      className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition-all border-2 ${
                        isReversed
                          ? 'bg-orange-50 border-braincity-accent text-braincity-accent'
                          : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      🔄 Inverser
                    </motion.button>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              </div>
              <Waveform audioUrl={activeAudioUrl} />
            </motion.div>

            {/* Spectrogram */}
            <motion.div
              className={`rounded-lg p-4 ${
                isBrainCity
                  ? 'bg-white shadow-sm border border-sky-100'
                  : 'bg-forensics-bg-light border border-forensics-cyan-dark'
              }`}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className={`text-sm font-bold mb-3 ${isBrainCity ? 'text-braincity-primary' : 'text-forensics-cyan font-mono tracking-wider'}`}>
                {isBrainCity ? '📊 Les sons en image' : 'SPECTROGRAMME'}
              </h3>
              <Spectrogram audioUrl={activeAudioUrl} />
            </motion.div>

            {/* Frequency Bars */}
            <motion.div
              className={`rounded-lg p-4 ${
                isBrainCity
                  ? 'bg-white shadow-sm border border-sky-100'
                  : 'bg-forensics-bg-light border border-forensics-cyan-dark'
              }`}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className={`text-sm font-bold mb-3 ${isBrainCity ? 'text-braincity-primary' : 'text-forensics-cyan font-mono tracking-wider'}`}>
                {isBrainCity ? '🎼 Les fréquences' : 'ANALYSE FRÉQUENTIELLE'}
              </h3>
              <FrequencyBars isPlaying={isPlaying} width={800} height={120} />
            </motion.div>
          </div>

          {/* ── RIGHT: Controls ── */}
          <div className="col-span-12 lg:col-span-4 space-y-4">

            {/* Guide */}
            <motion.div
              className={`rounded-lg p-4 ${
                isBrainCity
                  ? 'bg-white shadow-sm border border-sky-100'
                  : 'bg-forensics-bg-light border border-forensics-cyan-dark'
              }`}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <h3 className={`text-sm font-bold mb-3 ${isBrainCity ? 'text-braincity-primary' : 'text-forensics-cyan font-mono tracking-wider'}`}>
                {isBrainCity ? '📋 Les étapes' : 'GUIDE D\'ANALYSE'}
              </h3>
              <ol className="space-y-2">
                {analysisSteps.map((text, i) => {
                  const done = stepsDone[i];
                  return (
                    <li
                      key={i}
                      className={`flex items-start gap-3 text-xs transition-colors ${
                        isBrainCity
                          ? done ? 'text-braincity-success font-semibold' : 'text-gray-400'
                          : done ? 'text-forensics-green font-mono' : 'text-gray-500 font-mono'
                      }`}
                    >
                      <span
                        className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isBrainCity
                            ? done
                              ? 'bg-braincity-success text-white'
                              : 'border-2 border-gray-200 text-gray-400'
                            : done
                            ? 'border-forensics-green bg-forensics-green/20 text-forensics-green border'
                            : 'border border-gray-600 text-gray-600'
                        }`}
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
              className={`rounded-lg p-4 ${
                isBrainCity
                  ? 'bg-white shadow-sm border border-sky-100'
                  : 'bg-forensics-bg-light border border-forensics-cyan-dark'
              }`}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <h3 className={`text-sm font-bold mb-3 ${isBrainCity ? 'text-braincity-primary' : 'text-forensics-cyan font-mono tracking-wider'}`}>
                {isBrainCity ? '📢 Le volume' : 'NIVEAUX AUDIO'}
              </h3>
              <AudioMeter isPlaying={isPlaying} height={150} />
            </motion.div>

            {/* Tools */}
            <motion.div
              className={`rounded-lg overflow-hidden ${
                isBrainCity
                  ? 'bg-white shadow-sm border border-sky-100'
                  : 'bg-forensics-bg-light border border-forensics-cyan-dark'
              }`}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              {isBrainCity ? (
                <div className="p-4">
                  <KidsToolPanel />
                </div>
              ) : (
                <>
                  <div className="flex border-b border-forensics-cyan-dark">
                    {(
                      [
                        { key: 'filtres', label: 'FILTRES' },
                        { key: 'pitch', label: 'PITCH' },
                        { key: 'avance', label: 'PARAMÈTRES' },
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
                    {activeTab === 'pitch' && <PitchControl />}
                    {activeTab === 'avance' && (
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

            {/* Clue Tracker */}
            <motion.div
              className={`rounded-lg p-4 ${
                isBrainCity
                  ? 'bg-white shadow-sm border border-sky-100'
                  : 'bg-forensics-bg-light border border-forensics-cyan-dark'
              }`}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-sm font-bold ${isBrainCity ? 'text-braincity-primary' : 'text-forensics-cyan font-mono tracking-wider'}`}>
                  {isBrainCity ? '⭐ Tes indices trouvés' : 'INDICES'}
                </h3>
                <span className={`text-xs ${isBrainCity ? 'text-gray-400 font-semibold' : 'text-gray-500 font-mono'}`}>
                  {clueCount}/{totalClues}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {clueTriggers.map(({ id, label, hint }) => {
                  const found = discoveredClues.includes(id);
                  return (
                    <motion.div
                      key={id}
                      className={`flex items-start gap-2 p-2 rounded-xl border text-[11px] transition-all ${
                        isBrainCity
                          ? found
                            ? 'border-yellow-200 bg-yellow-50 text-yellow-700'
                            : 'border-dashed border-gray-200 text-gray-300'
                          : found
                          ? 'border-forensics-green/40 bg-forensics-green/5 text-forensics-green font-mono'
                          : 'border-gray-800 text-gray-700 font-mono'
                      }`}
                      animate={found && isBrainCity ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="flex-shrink-0 mt-0.5">
                        {isBrainCity ? (found ? '⭐' : '☆') : (found ? '✓' : '○')}
                      </span>
                      <div className="min-w-0">
                        <div className="leading-tight">{found ? label : '???'}</div>
                        {found && (
                          <div className={`text-[10px] mt-0.5 ${isBrainCity ? 'text-yellow-500' : 'text-gray-500'}`}>
                            {hint}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Stream Deck — contrôles audio */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <StreamDeckPanel />
            </motion.div>

            {/* Stream Deck — suspects */}
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
              <button
                onClick={handleContinueToSuspects}
                className={`w-full font-bold py-4 rounded-2xl uppercase tracking-wider text-sm transition-colors ${
                  isBrainCity
                    ? 'text-white'
                    : 'bg-forensics-green text-forensics-bg font-mono hover:bg-white'
                }`}
                style={isBrainCity ? { background: 'linear-gradient(90deg, #22d3ee, #84cc16)' } : {}}
              >
                {isBrainCity ? '🎯 J\'accuse !' : '→ Identifier le Suspect'}
              </button>
              <p className={`text-xs text-center mt-1.5 ${isBrainCity ? 'text-gray-400 font-semibold' : 'text-gray-600 font-mono'}`}>
                {isBrainCity ? 'Tu penses savoir qui c\'est ?' : 'Passez à la comparaison vocale'}
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
