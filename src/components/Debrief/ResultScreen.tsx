import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Suspect } from '@/types/suspects';
import { useAudioStore } from '@/stores/audioStore';
import { getScenario } from '@/data/scenarios';
import { useScenarioTheme } from '@/hooks/useScenarioTheme';
import RexBubble from '@/components/BrainCity/RexBubble';

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
    setMissionStartTime,
  } = useAudioStore();

  const scenario = getScenario(scenarioId);
  const { isBrainCity } = useScenarioTheme();
  const isCorrect = suspect?.id === scenario.guiltyId;

  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowResult(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const missionElapsed =
    missionTimerEnabled && missionStartTime
      ? Math.floor((Date.now() - missionStartTime) / 1000)
      : null;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    return `${m}m${String(s % 60).padStart(2, '0')}s`;
  };

  const handleRestart = useCallback(() => {
    setMissionStartTime(null);
    navigate('/');
  }, [navigate, setMissionStartTime]);

  const handleExportPDF = useCallback(() => {
    window.print();
  }, []);

  if (!suspect) {
    navigate('/suspects');
    return null;
  }

  return (
    <div className="min-h-screen p-6 flex items-center justify-center">
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
                  <motion.div
                    className="text-7xl mb-4"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    🐕
                  </motion.div>
                  <h2 className="text-2xl font-black text-braincity-primary mt-4">
                    Rex analyse ta réponse…
                  </h2>
                  <p className="text-gray-400 font-semibold mt-2">Comparaison des voix en cours !</p>
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

                  {/* Rex verdict */}
                  <motion.div
                    className="text-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <motion.div
                      className="text-7xl mb-2"
                      animate={isCorrect ? { rotate: [0, 10, -10, 0] } : { rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 0.5, repeat: isCorrect ? 0 : 3 }}
                    >
                      🐕
                    </motion.div>
                    <h1
                      className="text-4xl font-black mb-2"
                      style={{ color: isCorrect ? '#16a34a' : '#ea580c' }}
                    >
                      {isCorrect ? 'BRAVO ! 🎉' : 'Pas tout à fait… 🤔'}
                    </h1>
                    <p className="text-lg font-bold text-braincity-primary">
                      {isCorrect ? 'Tu as trouvé le coupable !' : `Ce n'est pas le bon suspect !`}
                    </p>
                  </motion.div>

                  {/* Rex message */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <RexBubble
                      message={isCorrect ? scenario.successStory : scenario.failureMessage}
                    />
                  </motion.div>

                  {/* Score tiles */}
                  {isCorrect && (
                    <motion.div
                      className="bg-white rounded-2xl p-5 shadow-sm border border-sky-100"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <h2 className="text-sm font-black text-braincity-primary mb-4">📊 Ton score de détective</h2>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-green-50 rounded-xl p-3 text-center">
                          <div className="text-2xl font-black text-braincity-success">
                            {discoveredClues.length}/{scenario.clueTriggers.length}
                          </div>
                          <div className="text-xs text-gray-400 font-semibold mt-0.5">Indices trouvés ⭐</div>
                        </div>
                        <div className="bg-sky-50 rounded-xl p-3 text-center">
                          <div className="text-2xl font-black text-braincity-primary">
                            {suspect ? scenario.matchScores[suspect.id] : 0}%
                          </div>
                          <div className="text-xs text-gray-400 font-semibold mt-0.5">Correspondance vocale 🎵</div>
                        </div>
                        {missionElapsed !== null && (
                          <div className="bg-yellow-50 rounded-xl p-3 text-center">
                            <div className="text-2xl font-black text-braincity-warning">
                              {formatTime(missionElapsed)}
                            </div>
                            <div className="text-xs text-gray-400 font-semibold mt-0.5">Temps de mission ⏱️</div>
                          </div>
                        )}
                        {isReversed && (
                          <div className="bg-purple-50 rounded-xl p-3 text-center">
                            <div className="text-2xl font-black text-braincity-violet">✅</div>
                            <div className="text-xs text-gray-400 font-semibold mt-0.5">Message décodé 🔄</div>
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
                    <button
                      onClick={handleRestart}
                      className="w-full py-3 text-white font-black rounded-2xl text-sm"
                      style={{ background: 'linear-gradient(90deg, #22d3ee, #84cc16)' }}
                    >
                      {isCorrect ? '🏠 Retour à l\'accueil' : '🔄 Réessayer'}
                    </button>
                    {!isCorrect && (
                      <button
                        onClick={() => navigate('/suspects')}
                        className="w-full py-3 bg-white border-2 border-sky-200 text-braincity-primary font-bold rounded-2xl hover:bg-sky-50 transition-colors text-sm"
                      >
                        ← Retour aux suspects
                      </button>
                    )}
                    {isCorrect && (
                      <button
                        onClick={handleExportPDF}
                        className="w-full py-3 bg-white border-2 border-sky-200 text-braincity-primary font-bold rounded-2xl hover:bg-sky-50 transition-colors text-sm print:hidden"
                      >
                        📄 Imprimer mon diplôme de détective
                      </button>
                    )}
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
                    <button
                      onClick={handleRestart}
                      className="px-8 py-3 bg-forensics-cyan text-forensics-bg font-mono font-bold rounded-lg hover:bg-white transition-all"
                    >
                      {isCorrect ? '🏠 RETOUR ACCUEIL' : '🔄 RÉESSAYER'}
                    </button>
                    {!isCorrect && (
                      <button
                        onClick={() => navigate('/suspects')}
                        className="px-8 py-3 bg-forensics-bg-light border-2 border-forensics-cyan text-forensics-cyan font-mono font-bold rounded-lg hover:bg-forensics-cyan hover:text-forensics-bg transition-all"
                      >
                        ← RETOUR SUSPECTS
                      </button>
                    )}
                    <button
                      onClick={handleExportPDF}
                      className="px-8 py-3 bg-forensics-bg-light border-2 border-forensics-orange text-forensics-orange font-mono font-bold rounded-lg hover:bg-forensics-orange hover:text-forensics-bg transition-all"
                    >
                      📄 EXPORTER PDF
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
