/**
 * AudioSetup Component — Choix du scénario + timer de mission
 * Les fichiers audio officiels sont chargés automatiquement au démarrage.
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { reverseAudioBlob, createAudioURL } from '@/utils/audioGenerator';
import { useAudioStore } from '@/stores/audioStore';
import type { ScenarioId } from '@/data/scenarios';
import { SCENARIOS } from '@/data/scenarios';
import RicardoBubble from '@/components/BrainCity/RicardoBubble';
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
    evidenceDistorted: '/audio/Coupable.m4a',
    evidenceClean: '/audio/Coupable.m4a',
    suspect1: '/audio/Voix 1.m4a',
    suspect2: '/audio/Voix 2.m4a',
    suspect3: '/audio/Voix 3.m4a',
    suspect4: '/audio/Voix 4.m4a',
  },
  braincity: {
    evidenceDistorted: '/audio/Sahur_Voice Changer.mp3',
    evidenceClean: '/audio/Sahur_Voice Changer.mp3',
    suspect1: '/audio/BrrBrrPatapim.wav',
    suspect2: '/audio/Chimpanzinibananini.wav',
    suspect3: '/audio/Sahur.wav',
    suspect4: '/audio/Tralalerotralala.wav',
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

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-forensics-bg">
      <motion.div
        className="max-w-3xl w-full"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-forensics-cyan font-mono mb-2">
            URIS — CONFIGURATION
          </h1>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key="scenario"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {/* Scenario cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {(Object.values(SCENARIOS) as (typeof SCENARIOS)[keyof typeof SCENARIOS][]).map(
                (sc) => (
                  <motion.button
                    key={sc.id}
                    onClick={() => setSelectedScenario(sc.id)}
                    className={`text-left p-6 rounded-lg border-2 transition-all ${
                      selectedScenario === sc.id
                        ? 'border-forensics-cyan bg-forensics-cyan/10'
                        : 'border-gray-600 bg-forensics-bg-light hover:border-gray-400'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-3xl mb-3">
                      {sc.id === 'corbeau' ? '🦅' : '🏙️'}
                    </div>
                    <h2
                      className={`text-lg font-bold font-mono mb-1 ${
                        selectedScenario === sc.id ? 'text-forensics-cyan' : 'text-gray-300'
                      }`}
                    >
                      {sc.title}
                    </h2>
                    <p className="text-xs text-gray-500 font-mono mb-3">{sc.subtitle}</p>
                    <p className="text-sm text-gray-400 font-mono">
                      {sc.id === 'corbeau'
                        ? 'Adultes — Démasquez le ravisseur avant le train de 14h15'
                        : "Enfants / Ados — Retrouvez l'agresseur du quartier industriel"}
                    </p>
                    {selectedScenario === sc.id && (
                      <div className="mt-3 text-xs text-forensics-green font-mono font-bold">
                        ✓ SÉLECTIONNÉ
                      </div>
                    )}
                  </motion.button>
                )
              )}
            </div>

            {/* Ricardo briefing — Brain City uniquement */}
            {selectedScenario === 'braincity' && (
              <div className="mt-4 mb-6">
                <RicardoBubble
                  message={SCENARIOS.braincity.ricardoLines?.setup ?? ''}
                  emotion="neutral"
                />
              </div>
            )}

            {/* Timer config */}
            <div className="bg-forensics-bg-light border border-forensics-cyan-dark rounded-lg p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-forensics-cyan font-mono">
                  ⏱ TIMER DE MISSION
                </h3>
                <button
                  onClick={() => setTimerEnabled((v) => !v)}
                  className={`px-3 py-1 rounded font-mono text-xs font-bold transition-all ${
                    timerEnabled
                      ? 'bg-forensics-green text-forensics-bg'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {timerEnabled ? '● ACTIVÉ' : '○ DÉSACTIVÉ'}
                </button>
              </div>
              {timerEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <input
                    type="range"
                    min="3"
                    max="15"
                    step="1"
                    value={timerMinutes}
                    onChange={(e) => setTimerMinutes(parseInt(e.target.value))}
                    className="w-full accent-forensics-cyan mb-2"
                  />
                  <div className="flex justify-between text-xs font-mono text-gray-500">
                    <span>3 min</span>
                    <span className="text-forensics-cyan font-bold">{timerMinutes} min</span>
                    <span>15 min</span>
                  </div>
                  <p className="text-xs text-gray-500 font-mono mt-2">
                    Le compte à rebours démarre à l'entrée du poste de travail
                  </p>
                </motion.div>
              )}
            </div>

            <button
              onClick={() => { void handleStart(); }}
              disabled={isLoading}
              className="w-full py-3 bg-forensics-cyan text-forensics-bg font-mono font-bold rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Spinner size="sm" color="border-forensics-bg" label="Chargement des audios..." />
              ) : (
                '🚀 DÉMARRER LA MISSION'
              )}
            </button>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
