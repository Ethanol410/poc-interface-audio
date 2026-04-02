/**
 * AudioSetup Component — Configuration en 2 étapes
 * Étape 1 : choix du scénario + timer de mission
 * Étape 2 : mode audio (demo synthétique ou upload)
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateAllTestAudios, reverseAudioBlob, createAudioURL } from '@/utils/audioGenerator';
import { useAudioStore } from '@/stores/audioStore';
import type { ScenarioId } from '@/data/scenarios';
import { SCENARIOS } from '@/data/scenarios';
import RicardoBubble from '@/components/BrainCity/RicardoBubble';
import Spinner from '@/components/Layout/Spinner';

const CORBEAU_OFFICIAL_AUDIO = {
  evidenceDistorted: '/audio/Coupable.m4a',
  evidenceClean: '/audio/Coupable.m4a',
  suspect1: '/audio/Voix 1.m4a',
  suspect2: '/audio/Voix 2.m4a',
  suspect3: '/audio/Voix 3.m4a',
  suspect4: '/audio/Voix 4.m4a',
} as const;

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

  const [step, setStep] = useState<'scenario' | 'audio'>('scenario');
  const [selectedScenario, setSelectedScenario] = useState<ScenarioId>('corbeau');
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(8);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingOfficial, setIsLoadingOfficial] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{
    evidence?: File;
    suspect1?: File;
    suspect2?: File;
    suspect3?: File;
    suspect4?: File;
  }>({});

  const handleConfirmScenario = () => {
    setScenario(selectedScenario);
    setMissionTimerEnabled(timerEnabled);
    setMissionDuration(timerMinutes * 60);
    setStep('audio');
  };

  const handleLoadOfficial = useCallback(async () => {
    setIsLoadingOfficial(true);
    try {
      const response = await fetch(CORBEAU_OFFICIAL_AUDIO.evidenceDistorted);
      const blob = await response.blob();
      const evidenceReverse = await reverseAudioBlob(blob);
      onAudiosReady({
        ...CORBEAU_OFFICIAL_AUDIO,
        evidenceReverse: createAudioURL(evidenceReverse),
      });
    } catch {
      alert('❌ Erreur lors du chargement des fichiers audio officiels');
    } finally {
      setIsLoadingOfficial(false);
    }
  }, [onAudiosReady]);

  const handleGenerateDemo = useCallback(async () => {
    setIsGenerating(true);
    try {
      const audios = await generateAllTestAudios();
      onAudiosReady({
        evidenceDistorted: createAudioURL(audios.evidenceDistorted),
        evidenceClean: createAudioURL(audios.evidenceClean),
        evidenceReverse: createAudioURL(audios.evidenceReverse),
        suspect1: createAudioURL(audios.suspect1),
        suspect2: createAudioURL(audios.suspect2),
        suspect3: createAudioURL(audios.suspect3),
        suspect4: createAudioURL(audios.suspect4),
      });
    } catch (error) {
      console.error('Erreur génération audio:', error);
      alert('❌ Erreur lors de la génération des fichiers audio de test');
    } finally {
      setIsGenerating(false);
    }
  }, [onAudiosReady]);

  const handleFileUpload =
    (key: 'evidence' | 'suspect1' | 'suspect2' | 'suspect3' | 'suspect4') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith('audio/')) {
        setUploadedFiles((prev) => ({ ...prev, [key]: file }));
      } else {
        alert('❌ Veuillez sélectionner un fichier audio valide');
      }
    };

  const handleUseUploaded = useCallback(async () => {
    if (!uploadedFiles.evidence) {
      alert('❌ Veuillez uploader au moins le fichier Evidence principal');
      return;
    }
    setIsGenerating(true);
    try {
      const evidenceReverse = await reverseAudioBlob(uploadedFiles.evidence);
      onAudiosReady({
        evidenceDistorted: URL.createObjectURL(uploadedFiles.evidence),
        evidenceClean: URL.createObjectURL(uploadedFiles.evidence),
        evidenceReverse: createAudioURL(evidenceReverse),
        suspect1: uploadedFiles.suspect1 ? URL.createObjectURL(uploadedFiles.suspect1) : '',
        suspect2: uploadedFiles.suspect2 ? URL.createObjectURL(uploadedFiles.suspect2) : '',
        suspect3: uploadedFiles.suspect3 ? URL.createObjectURL(uploadedFiles.suspect3) : '',
        suspect4: uploadedFiles.suspect4 ? URL.createObjectURL(uploadedFiles.suspect4) : undefined,
      });
    } catch {
      alert('❌ Erreur lors de l\'inversion audio');
    } finally {
      setIsGenerating(false);
    }
  }, [uploadedFiles, onAudiosReady]);

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
          <div className="flex justify-center gap-4 mt-3">
            {(['scenario', 'audio'] as const).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold border ${
                    step === s
                      ? 'bg-forensics-cyan text-forensics-bg border-forensics-cyan'
                      : step === 'audio' && s === 'scenario'
                      ? 'bg-forensics-green/20 border-forensics-green text-forensics-green'
                      : 'border-gray-600 text-gray-500'
                  }`}
                >
                  {step === 'audio' && s === 'scenario' ? '✓' : i + 1}
                </span>
                <span
                  className={`text-xs font-mono ${
                    step === s ? 'text-forensics-cyan' : 'text-gray-500'
                  }`}
                >
                  {s === 'scenario' ? 'SCÉNARIO' : 'AUDIO'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* ── ÉTAPE 1 : Scénario + Timer ── */}
          {step === 'scenario' && (
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
                          selectedScenario === sc.id
                            ? 'text-forensics-cyan'
                            : 'text-gray-300'
                        }`}
                      >
                        {sc.title}
                      </h2>
                      <p className="text-xs text-gray-500 font-mono mb-3">{sc.subtitle}</p>
                      <p className="text-sm text-gray-400 font-mono">
                        {sc.id === 'corbeau'
                          ? 'Adultes — Démasquez le ravisseur avant le train de 14h15'
                          : 'Enfants / Ados — Retrouvez l\'agresseur du quartier industriel'}
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
                      <span className="text-forensics-cyan font-bold">
                        {timerMinutes} min
                      </span>
                      <span>15 min</span>
                    </div>
                    <p className="text-xs text-gray-500 font-mono mt-2">
                      Le compte à rebours démarre à l'entrée du poste de travail
                    </p>
                  </motion.div>
                )}
              </div>

              <button
                onClick={handleConfirmScenario}
                className="w-full py-3 bg-forensics-cyan text-forensics-bg font-mono font-bold rounded-lg hover:bg-white transition-colors"
              >
                SUIVANT → CONFIGURER L'AUDIO
              </button>
            </motion.div>
          )}

          {/* ── ÉTAPE 2 : Mode Audio ── */}
          {step === 'audio' && (
            <motion.div
              key="audio"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Fichiers officiels — Corbeau uniquement */}
                {selectedScenario === 'corbeau' && (
                  <motion.div
                    className="bg-forensics-bg-light border-2 border-forensics-orange rounded-lg p-6"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="text-center mb-4">
                      <div className="text-5xl mb-3">🦅</div>
                      <h2 className="text-2xl font-bold text-forensics-orange font-mono mb-2">
                        OFFICIEL
                      </h2>
                      <p className="text-gray-400 text-sm font-mono">
                        Fichiers audio de l'histoire Corbeau
                      </p>
                    </div>
                    <div className="space-y-2 text-sm text-gray-300 font-mono mb-6">
                      <p className="flex items-start">
                        <span className="text-forensics-green mr-2">✓</span>
                        Enregistrement Coupable.m4a
                      </p>
                      <p className="flex items-start">
                        <span className="text-forensics-green mr-2">✓</span>
                        4 voix suspects incluses
                      </p>
                      <p className="flex items-start">
                        <span className="text-forensics-green mr-2">✓</span>
                        Audio inversé généré auto
                      </p>
                    </div>
                    <button
                      onClick={() => { void handleLoadOfficial(); }}
                      disabled={isLoadingOfficial}
                      className="w-full py-3 px-4 bg-forensics-orange hover:bg-orange-300 text-forensics-bg font-bold font-mono rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoadingOfficial ? (
                        <Spinner size="sm" color="border-forensics-bg" label="Chargement..." />
                      ) : (
                        '🎯 UTILISER LES FICHIERS'
                      )}
                    </button>
                  </motion.div>
                )}

                {/* Mode Démo — Brain City uniquement */}
                {selectedScenario !== 'corbeau' && (
                <motion.div
                  className="bg-forensics-bg-light border-2 border-forensics-cyan rounded-lg p-6"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="text-center mb-4">
                    <div className="text-5xl mb-3">🤖</div>
                    <h2 className="text-2xl font-bold text-forensics-cyan font-mono mb-2">
                      MODE DÉMO
                    </h2>
                    <p className="text-gray-400 text-sm font-mono">
                      Sons synthétiques générés automatiquement
                    </p>
                  </div>
                  <div className="space-y-2 text-sm text-gray-300 font-mono mb-6">
                    <p className="flex items-start">
                      <span className="text-forensics-green mr-2">✓</span>
                      Aucun fichier requis
                    </p>
                    <p className="flex items-start">
                      <span className="text-forensics-green mr-2">✓</span>
                      Test immédiat de l'interface
                    </p>
                    <p className="flex items-start">
                      <span className="text-forensics-green mr-2">✓</span>
                      4 voix suspects + audio inversé inclus
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateDemo}
                    disabled={isGenerating}
                    className="w-full py-3 px-4 bg-forensics-cyan hover:bg-white text-forensics-bg font-bold font-mono rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <Spinner size="sm" color="border-forensics-bg" label="Génération..." />
                    ) : (
                      '🚀 GÉNÉRER & DÉMARRER'
                    )}
                  </button>
                </motion.div>
                )}

                {/* Mode Upload — Brain City uniquement */}
                {selectedScenario !== 'corbeau' && (
                <motion.div
                  className="bg-forensics-bg-light border-2 border-gray-600 rounded-lg p-6"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="text-center mb-4">
                    <div className="text-5xl mb-3">📁</div>
                    <h2 className="text-2xl font-bold text-gray-300 font-mono mb-2">
                      MES FICHIERS
                    </h2>
                    <p className="text-gray-400 text-sm font-mono">
                      Utilisez vos propres fichiers audio
                    </p>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div>
                      <label className="block text-xs text-gray-400 font-mono mb-1">
                        Evidence principale (requis) *
                      </label>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleFileUpload('evidence')}
                        className="w-full text-sm text-gray-300 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-mono file:bg-forensics-cyan file:text-forensics-bg hover:file:bg-white file:cursor-pointer"
                      />
                      {uploadedFiles.evidence && (
                        <p className="text-xs text-forensics-green mt-1 font-mono">
                          ✓ {uploadedFiles.evidence.name}
                        </p>
                      )}
                    </div>
                    <details className="text-gray-400">
                      <summary className="cursor-pointer text-xs font-mono hover:text-gray-300">
                        + Ajouter voix suspects (optionnel)
                      </summary>
                      <div className="mt-2 space-y-2 pl-3">
                        {(['suspect1', 'suspect2', 'suspect3', 'suspect4'] as const).map(
                          (key, i) => (
                            <div key={key}>
                              <label className="block text-xs font-mono mb-1">
                                Suspect {i + 1}
                              </label>
                              <input
                                type="file"
                                accept="audio/*"
                                onChange={handleFileUpload(key)}
                                className="w-full text-xs text-gray-300 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-mono file:bg-gray-700 file:text-gray-300 hover:file:bg-gray-600"
                              />
                            </div>
                          )
                        )}
                      </div>
                    </details>
                  </div>
                  <button
                    onClick={() => { void handleUseUploaded(); }}
                    disabled={!uploadedFiles.evidence || isGenerating}
                    className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold font-mono rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <Spinner size="sm" color="border-gray-200" label="Inversion audio..." />
                    ) : uploadedFiles.evidence ? (
                      '✓ UTILISER MES FICHIERS'
                    ) : (
                      '⚠ Fichier requis'
                    )}
                  </button>
                </motion.div>
                )}
              </div>

              <button
                onClick={() => setStep('scenario')}
                className="w-full py-2 border border-gray-600 text-gray-400 font-mono text-sm rounded-lg hover:border-gray-400 hover:text-gray-300 transition-colors"
              >
                ← RETOUR AU CHOIX DU SCÉNARIO
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
