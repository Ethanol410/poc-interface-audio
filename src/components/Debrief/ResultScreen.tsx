import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Suspect } from '@/types/suspects';
import { useAudioStore } from '@/stores/audioStore';
import { getScenario } from '@/data/scenarios';

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
  const isCorrect = suspect?.id === scenario.guiltyId;

  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowResult(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Compute elapsed mission time for PDF report
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
              <p className="text-gray-400 font-mono mt-2">
                Comparaison des empreintes vocales
              </p>
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ResultScreen;
