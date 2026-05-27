import { useEffect, useState, useCallback } from 'react';
import { resetTour } from '@/utils/tourState';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Suspect } from '@/types/suspects';
import { useAudioStore } from '@/stores/audioStore';
import { getScenario } from '@/data/scenarios';
import { useScenarioTheme } from '@/hooks/useScenarioTheme';
import RicardoBubble from '@/components/BrainCity/RicardoBubble';
import { audioEngine } from '@/services/audioEngine';

interface LocationState {
  suspect?: Suspect;
}

const ResultScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { suspect } = (location.state as LocationState) || {};

  const {
    scenario: scenarioId,
    discoveredClues,
    lowPassFilter,
    highPassFilter,
    pitchShift,
    isReversed,
    missionTimerEnabled,
    missionDuration,
    missionStartTime,
    reset,
  } = useAudioStore();

  const scenario = getScenario(scenarioId);
  const { isBrainCity } = useScenarioTheme();
  const isCorrect = suspect?.id === scenario.guiltyId;

  // Brain City a déjà joué l'animation d'analyse via AccusationOverlay
  // sur la page /suspects → on saute la phase d'analyse du debrief.
  const [showResult, setShowResult] = useState(isBrainCity);

  useEffect(() => {
    if (isBrainCity) return;
    const timer = setTimeout(() => setShowResult(true), 1500);
    return () => clearTimeout(timer);
  }, [isBrainCity]);

  const missionElapsed =
    missionTimerEnabled && missionStartTime
      ? Math.floor((Date.now() - missionStartTime) / 1000)
      : null;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    return `${m}m${String(s % 60).padStart(2, '0')}s`;
  };

  const handleRetry = useCallback(() => {
    audioEngine.pause();
    navigate('/workspace');
  }, [navigate]);

  const handleQuit = useCallback(() => {
    audioEngine.pause();
    resetTour();
    reset();
    navigate('/setup');
  }, [navigate, reset]);

  if (!suspect) {
    navigate('/suspects');
    return null;
  }

  return (
    <div className={`min-h-screen p-6 flex items-center justify-center ${isBrainCity ? 'bg-[#FFF9EC]' : ''}`} style={isBrainCity ? { backgroundImage: 'radial-gradient(circle, #E0D4C3 2px, transparent 2px)', backgroundSize: '24px 24px' } : {}}>
      <div className="max-w-4xl w-full">

        {/* Analyzing animation */}
        <AnimatePresence>
          {!showResult && (
            <motion.div
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {isBrainCity ? (
                <>
                  <motion.img
                    src="/images/inspecteur/Ricardo_Pouleto_sticker.png"
                    alt="Ricardo Pouleto"
                    className="w-24 h-24 object-contain mx-auto mb-4"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <h2 className="text-4xl font-bangers tracking-wider text-[#073B4C] mt-6">
                    Ricardo analyse ta réponse…
                  </h2>
                  <p className="text-[#6b7280] font-fredoka font-bold text-lg mt-2">Comparaison des voix en cours !</p>
                </>
              ) : (
                <>
                  <motion.div
                    className="inline-block"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <span className="text-6xl">⚙</span>
                  </motion.div>
                  <h2 className="text-2xl font-bold text-forensics-cyan font-mono mt-6">
                    ANALYSE VOCALE EN COURS...
                  </h2>
                  <p className="text-gray-400 font-mono mt-2">Comparaison des empreintes vocales</p>
                  <div className="mt-8 flex items-center justify-center gap-2">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-8 bg-forensics-cyan rounded"
                        animate={{ height: [32, 8, 32] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                      />
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              id="rapport-pdf"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {isBrainCity ? (
                /* ── KIDS RESULT ── */
                <>
                  {/* Confetti */}
                  {isCorrect && (
                    <div className="text-center text-3xl tracking-widest">
                      🎉🎊🎈🎊🎉
                    </div>
                  )}

                  {/* Ricardo verdict */}
                  <motion.div
                    className="text-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <motion.img
                      src="/images/inspecteur/Ricardo_Pouleto_sticker.png"
                      alt="Ricardo Pouleto"
                      className="w-24 h-24 object-contain mx-auto mb-2"
                      animate={isCorrect ? { rotate: [0, 10, -10, 0] } : { rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 0.5, repeat: isCorrect ? 0 : 3 }}
                    />
                    <h1
                      className="text-6xl font-bangers tracking-widest mb-3"
                      style={{ color: isCorrect ? '#06D6A0' : '#EF476F' }}
                    >
                      {isCorrect ? 'BRAVO ! 🎉' : 'Pas tout à fait… 🤔'}
                    </h1>
                    <p className="text-xl font-fredoka font-bold text-[#073B4C]">
                      {isCorrect ? 'Tu as trouvé le coupable !' : `Ce n'est pas le bon suspect !`}
                    </p>
                  </motion.div>

                  {/* Ricardo message */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <RicardoBubble
                      message={isCorrect
                        ? (scenario.ricardoLines?.correctSuspect ?? scenario.successStory)
                        : (scenario.ricardoLines?.wrongSuspect ?? scenario.failureMessage)}
                      emotion={isCorrect ? 'triumphant' : 'scared'}
                    />
                  </motion.div>

                  {/* Score tiles */}
                  {isCorrect && (
                    <motion.div
                      className="bg-white rounded-[32px] p-6 shadow-[0_6px_0_0_#073B4C] border-4 border-[#073B4C]"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <h2 className="text-3xl font-bangers tracking-wider text-[#073B4C] mb-6 text-center">📊 Ton carnet de détective</h2>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#FFF9EC] rounded-2xl p-4 text-center border-4 border-[#073B4C] shadow-[0_4px_0_0_#073B4C]">
                          <div className="text-4xl font-bangers text-[#06D6A0]">
                            {discoveredClues.length}/{scenario.clueTriggers.length}
                          </div>
                          <div className="text-sm text-[#073B4C] font-fredoka font-bold mt-1">Indices trouvés ⭐</div>
                        </div>
                        <div className="bg-[#FFF9EC] rounded-2xl p-4 text-center border-4 border-[#073B4C] shadow-[0_4px_0_0_#073B4C]">
                          <div className="text-4xl font-bangers text-[#118AB2]">
                            {suspect ? scenario.matchScores[suspect.id] : 0}%
                          </div>
                          <div className="text-sm text-[#073B4C] font-fredoka font-bold mt-1">Comparaison Vocale 🎵</div>
                        </div>
                        {missionElapsed !== null && (
                          <div className="bg-[#FFF9EC] rounded-2xl p-4 text-center border-4 border-[#073B4C] shadow-[0_4px_0_0_#073B4C]">
                            <div className="text-4xl font-bangers text-[#FFD166]">
                              {formatTime(missionElapsed)}
                            </div>
                            <div className="text-sm text-[#073B4C] font-fredoka font-bold mt-1">Temps Record ⏱️</div>
                          </div>
                        )}
                        {isReversed && (
                          <div className="bg-[#FFF9EC] rounded-2xl p-4 text-center border-4 border-[#073B4C] shadow-[0_4px_0_0_#073B4C]">
                            <div className="text-4xl font-bangers text-[#9D4EDD]">✅</div>
                            <div className="text-sm text-[#073B4C] font-fredoka font-bold mt-1">Message décodé 🔄</div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Actions */}
                  <motion.div
                    className="flex flex-col gap-3 print:hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    {!isCorrect && (
                      <button
                        onClick={handleRetry}
                        className="w-full py-4 text-[#073B4C] font-bangers text-2xl rounded-2xl border-4 border-[#073B4C] shadow-[0_4px_0_0_#073B4C] hover:-translate-y-[2px] hover:shadow-[0_6px_0_0_#073B4C] active:translate-y-[4px] active:shadow-[0_0_0_0_#073B4C] transition-all tracking-wider"
                        style={{ background: '#FFD166' }}
                      >
                        🔄 RÉESSAYER
                      </button>
                    )}
                    <button
                      onClick={handleQuit}
                      className="w-full py-4 font-bangers text-2xl rounded-2xl border-4 border-[#073B4C] shadow-[0_4px_0_0_#073B4C] hover:-translate-y-[2px] hover:shadow-[0_6px_0_0_#073B4C] active:translate-y-[4px] active:shadow-[0_0_0_0_#073B4C] transition-all tracking-wider"
                      style={{
                        background: isCorrect ? '#06D6A0' : 'white',
                        color: '#073B4C',
                      }}
                    >
                      {isCorrect ? '🏠 QUITTER LA PARTIE' : '🚪 QUITTER LA PARTIE'}
                    </button>
                  </motion.div>
                </>
              ) : (
                /* ── ADULT RESULT (unchanged) ── */
                <>
                  {/* Verdict header */}
                  <motion.div
                    className="text-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <motion.div
                      className="text-9xl mb-4"
                      animate={isCorrect ? { rotate: [0, 10, -10, 0] } : { rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 0.5, repeat: isCorrect ? 0 : 3 }}
                    >
                      {isCorrect ? '✓' : '✗'}
                    </motion.div>
                    <h1
                      className={`text-5xl font-bold font-mono mb-3 ${
                        isCorrect ? 'text-forensics-green' : 'text-red-500'
                      }`}
                    >
                      {isCorrect ? scenario.successTitle : scenario.failureTitle}
                    </h1>
                    <p className="text-xl text-gray-300 font-mono">
                      {isCorrect
                        ? `Identification positive : `
                        : `${suspect.name} n'est pas coupable`}
                      {isCorrect && (
                        <span className="text-forensics-cyan">{suspect.name}</span>
                      )}
                    </p>
                  </motion.div>

                  {/* Analysis report */}
                  <motion.div
                    className={`border-2 rounded-lg p-6 ${
                      isCorrect
                        ? 'bg-forensics-green/10 border-forensics-green'
                        : 'bg-red-500/10 border-red-500'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h2
                      className={`text-xl font-bold font-mono mb-4 ${
                        isCorrect ? 'text-forensics-green' : 'text-red-500'
                      }`}
                    >
                      📊 RAPPORT D'ANALYSE — {scenario.title}
                    </h2>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 font-mono text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Suspect identifié :</span>
                        <span className={isCorrect ? 'text-forensics-green font-bold' : 'text-red-500 font-bold'}>
                          {suspect.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Match vocal :</span>
                        <span className={isCorrect ? 'text-forensics-green font-bold' : 'text-red-500 font-bold'}>
                          {suspect ? scenario.matchScores[suspect.id] : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Signature spectrale :</span>
                        <span className={isCorrect ? 'text-forensics-green font-bold' : 'text-red-500 font-bold'}>
                          {isCorrect ? 'POSITIVE' : 'NÉGATIVE'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Indices découverts :</span>
                        <span className="text-forensics-cyan font-bold">
                          {discoveredClues.length}/{scenario.clueTriggers.length}
                        </span>
                      </div>
                      {pitchShift.semitones !== 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Correction pitch :</span>
                          <span className="text-forensics-cyan font-bold">
                            {pitchShift.semitones > 0 ? '+' : ''}{pitchShift.semitones} ST
                          </span>
                        </div>
                      )}
                      {lowPassFilter.enabled && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Filtre LP :</span>
                          <span className="text-forensics-cyan font-bold">{Math.round(lowPassFilter.frequency)} Hz</span>
                        </div>
                      )}
                      {highPassFilter.enabled && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Filtre HP :</span>
                          <span className="text-forensics-cyan font-bold">{Math.round(highPassFilter.frequency)} Hz</span>
                        </div>
                      )}
                      {isReversed && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Message inversé :</span>
                          <span className="text-forensics-orange font-bold">DÉCODÉ</span>
                        </div>
                      )}
                      {missionElapsed !== null && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Temps de mission :</span>
                          <span className={`font-bold ${missionElapsed <= missionDuration ? 'text-forensics-green' : 'text-red-500'}`}>
                            {formatTime(missionElapsed)} / {formatTime(missionDuration)}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Narrative */}
                  <motion.div
                    className={`bg-forensics-bg-light border rounded-lg p-5 ${
                      isCorrect ? 'border-forensics-cyan' : 'border-red-500'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3
                      className={`text-lg font-bold font-mono mb-3 ${
                        isCorrect ? 'text-forensics-cyan' : 'text-red-500'
                      }`}
                    >
                      {isCorrect ? '🏆 MISSION ACCOMPLIE' : '📨 MESSAGE'}
                    </h3>
                    <p className="text-gray-300 font-mono text-sm italic">
                      {isCorrect ? scenario.successStory : scenario.failureMessage}
                    </p>
                  </motion.div>

                  {/* Actions */}
                  <motion.div
                    className="flex gap-4 justify-center flex-wrap print:hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    {!isCorrect && (
                      <button
                        onClick={handleRetry}
                        className="px-8 py-3 bg-forensics-cyan text-forensics-bg font-mono font-bold rounded-lg hover:bg-white transition-all"
                      >
                        🔄 RÉESSAYER
                      </button>
                    )}
                    <button
                      onClick={handleQuit}
                      className="px-8 py-3 bg-forensics-bg-light border-2 border-forensics-cyan text-forensics-cyan font-mono font-bold rounded-lg hover:bg-forensics-cyan hover:text-forensics-bg transition-all"
                    >
                      🚪 QUITTER LA PARTIE
                    </button>
                  </motion.div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ResultScreen;
