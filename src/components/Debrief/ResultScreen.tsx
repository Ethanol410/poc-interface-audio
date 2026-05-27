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

  // Métadonnées rapport (côté Corbeau)
  const reportId = suspect
    ? `SRIS-${scenarioId.slice(0, 3).toUpperCase()}-${new Date().getFullYear()}-${suspect.id.slice(0, 4).toUpperCase()}`
    : '';
  const reportTimestamp = new Date().toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

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
                <div className="font-mono">
                  <div className="flex items-center justify-center gap-3 text-[11px] tracking-[0.3em] text-forensics-cyan-dark uppercase mb-6">
                    <span className="w-2 h-2 rounded-full bg-forensics-cyan animate-pulse" />
                    <span>Canal sécurisé 08 — Transmission en cours</span>
                  </div>
                  <h2 className="text-xl text-forensics-cyan tracking-[0.25em] uppercase mb-3">
                    Analyse vocale en cours
                  </h2>
                  <p className="text-gray-500 text-xs tracking-widest uppercase">
                    Comparaison des empreintes — patientez
                  </p>
                  <div className="mt-8 flex items-center justify-center gap-2">
                    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-forensics-cyan/70"
                        style={{ height: 32 }}
                        animate={{ height: [32, 8, 32] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.08 }}
                      />
                    ))}
                  </div>
                </div>
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
                /* ── CORBEAU REPORT — Rapport SRIS classifié ── */
                (() => {
                  const accentText = isCorrect ? 'text-forensics-green' : 'text-red-500';
                  const verdictLabel = isCorrect ? 'IDENTIFICATION POSITIVE' : 'IDENTIFICATION NÉGATIVE';
                  const matchScore = scenario.matchScores[suspect.id] ?? 0;
                  return (
                    <div className="font-mono text-gray-200 bg-forensics-bg-light border border-forensics-cyan-dark rounded-sm overflow-hidden shadow-2xl">
                      {/* Top status bar */}
                      <div className="flex items-center justify-between px-5 py-2 bg-forensics-bg border-b border-forensics-cyan-dark text-[10px] tracking-[0.25em] uppercase">
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-0.5 border border-forensics-cyan/40 text-forensics-cyan">
                            Classifié — TOP SECRET
                          </span>
                          <span className="text-gray-500">{reportId}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-500">
                          <span>{reportTimestamp}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-forensics-cyan animate-pulse" />
                        </div>
                      </div>

                      <div className="p-7 space-y-7">
                        {/* Title + verdict */}
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                        >
                          <p className="text-[11px] tracking-[0.4em] text-gray-500 uppercase mb-1">
                            Service de Recherche et d'Investigation Sonore
                          </p>
                          <h1 className="text-2xl tracking-[0.18em] text-white uppercase font-bold">
                            Rapport final d'identification
                          </h1>
                          <p className="text-xs text-gray-500 mt-1 tracking-wider">
                            Dossier : <span className="text-gray-300">{scenario.title.toUpperCase()}</span>
                          </p>
                        </motion.div>

                        {/* Verdict block */}
                        <motion.div
                          className={`border ${isCorrect ? 'border-forensics-green' : 'border-red-500'} bg-black/30 px-6 py-5`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15 }}
                        >
                          <div className="flex items-baseline justify-between gap-6 flex-wrap">
                            <div>
                              <p className="text-[10px] tracking-[0.4em] uppercase text-gray-500 mb-1">
                                Verdict
                              </p>
                              <p className={`text-2xl tracking-[0.2em] font-bold uppercase ${accentText}`}>
                                [ {verdictLabel} ]
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] tracking-[0.4em] uppercase text-gray-500 mb-1">
                                Sujet désigné
                              </p>
                              <p className="text-base text-white tracking-wider">{suspect.name}</p>
                            </div>
                          </div>
                        </motion.div>

                        {/* Technical report */}
                        <motion.section
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <h2 className="text-[11px] tracking-[0.35em] uppercase text-forensics-cyan border-b border-forensics-cyan-dark pb-2 mb-4">
                            § 1 — Empreinte technique
                          </h2>
                          <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
                            <div className="flex justify-between border-b border-dotted border-gray-700/60 py-1">
                              <span className="text-gray-500 tracking-wider text-xs uppercase">Correspondance vocale</span>
                              <span className={`${accentText} font-bold`}>{matchScore}%</span>
                            </div>
                            <div className="flex justify-between border-b border-dotted border-gray-700/60 py-1">
                              <span className="text-gray-500 tracking-wider text-xs uppercase">Signature spectrale</span>
                              <span className={`${accentText} font-bold`}>{isCorrect ? 'POSITIVE' : 'NÉGATIVE'}</span>
                            </div>
                            <div className="flex justify-between border-b border-dotted border-gray-700/60 py-1">
                              <span className="text-gray-500 tracking-wider text-xs uppercase">Indices recueillis</span>
                              <span className="text-forensics-cyan font-bold">
                                {discoveredClues.length} / {scenario.clueTriggers.length}
                              </span>
                            </div>
                            {pitchShift.semitones !== 0 && (
                              <div className="flex justify-between border-b border-dotted border-gray-700/60 py-1">
                                <span className="text-gray-500 tracking-wider text-xs uppercase">Correction tonale</span>
                                <span className="text-forensics-cyan font-bold">
                                  {pitchShift.semitones > 0 ? '+' : ''}{pitchShift.semitones} ST
                                </span>
                              </div>
                            )}
                            {lowPassFilter.enabled && (
                              <div className="flex justify-between border-b border-dotted border-gray-700/60 py-1">
                                <span className="text-gray-500 tracking-wider text-xs uppercase">Coupe-haut (LP)</span>
                                <span className="text-forensics-cyan font-bold">{Math.round(lowPassFilter.frequency)} Hz</span>
                              </div>
                            )}
                            {highPassFilter.enabled && (
                              <div className="flex justify-between border-b border-dotted border-gray-700/60 py-1">
                                <span className="text-gray-500 tracking-wider text-xs uppercase">Coupe-bas (HP)</span>
                                <span className="text-forensics-cyan font-bold">{Math.round(highPassFilter.frequency)} Hz</span>
                              </div>
                            )}
                            {isReversed && (
                              <div className="flex justify-between border-b border-dotted border-gray-700/60 py-1">
                                <span className="text-gray-500 tracking-wider text-xs uppercase">Lecture inversée</span>
                                <span className="text-forensics-orange font-bold">DÉCODÉE</span>
                              </div>
                            )}
                            {missionElapsed !== null && (
                              <div className="flex justify-between border-b border-dotted border-gray-700/60 py-1">
                                <span className="text-gray-500 tracking-wider text-xs uppercase">Durée d'enquête</span>
                                <span className={`font-bold ${missionElapsed <= missionDuration ? 'text-forensics-green' : 'text-red-500'}`}>
                                  {formatTime(missionElapsed)} / {formatTime(missionDuration)}
                                </span>
                              </div>
                            )}
                          </div>
                        </motion.section>

                        {/* Narrative */}
                        <motion.section
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.45 }}
                        >
                          <h2 className="text-[11px] tracking-[0.35em] uppercase text-forensics-cyan border-b border-forensics-cyan-dark pb-2 mb-3">
                            § 2 — Conclusion d'enquête
                          </h2>
                          <p className="text-sm text-gray-300 leading-relaxed text-justify">
                            {isCorrect ? scenario.successStory : scenario.failureMessage}
                          </p>
                        </motion.section>

                        {/* Signature line */}
                        <motion.div
                          className="flex items-end justify-between pt-4 border-t border-gray-700/60"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.55 }}
                        >
                          <div className="text-[10px] tracking-widest uppercase text-gray-500">
                            <p>Agent en mission : V.</p>
                            <p className="mt-1">Référent : Commissariat — SRIS / Cellule audio</p>
                          </div>
                          <div className="text-[10px] tracking-[0.3em] text-gray-600 uppercase">
                            // Fin de rapport //
                          </div>
                        </motion.div>

                        {/* Actions */}
                        <motion.div
                          className="flex gap-3 justify-end pt-2 print:hidden"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.7 }}
                        >
                          {!isCorrect && (
                            <button
                              onClick={handleRetry}
                              className="px-6 py-2.5 border border-forensics-cyan text-forensics-cyan tracking-[0.25em] text-xs uppercase hover:bg-forensics-cyan hover:text-forensics-bg transition-colors"
                            >
                              Nouvelle tentative
                            </button>
                          )}
                          <button
                            onClick={handleQuit}
                            className="px-6 py-2.5 border border-gray-600 text-gray-300 tracking-[0.25em] text-xs uppercase hover:border-white hover:text-white transition-colors"
                          >
                            Clore le dossier
                          </button>
                        </motion.div>
                      </div>
                    </div>
                  );
                })()
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ResultScreen;
