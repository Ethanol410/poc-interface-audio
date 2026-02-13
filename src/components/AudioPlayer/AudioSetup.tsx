/**
 * AudioSetup Component - Configuration des fichiers audio (demo ou upload)
 */

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  generateAllTestAudios,
  createAudioURL,
} from '@/utils/audioGenerator';

interface AudioSetupProps {
  onAudiosReady: (audioUrls: {
    evidenceDistorted: string;
    evidenceClean: string;
    suspect1: string;
    suspect2: string;
    suspect3: string;
  }) => void;
}

export const AudioSetup = ({ onAudiosReady }: AudioSetupProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{
    evidence?: File;
    suspect1?: File;
    suspect2?: File;
    suspect3?: File;
  }>({});

  // Générer des fichiers de test
  const handleGenerateDemo = useCallback(async () => {
    setIsGenerating(true);
    try {
      const audios = await generateAllTestAudios();
      
      const audioUrls = {
        evidenceDistorted: createAudioURL(audios.evidenceDistorted),
        evidenceClean: createAudioURL(audios.evidenceClean),
        suspect1: createAudioURL(audios.suspect1),
        suspect2: createAudioURL(audios.suspect2),
        suspect3: createAudioURL(audios.suspect3),
      };

      onAudiosReady(audioUrls);
    } catch (error) {
      console.error('Erreur lors de la génération des audios:', error);
      alert('❌ Erreur lors de la génération des fichiers audio de test');
    } finally {
      setIsGenerating(false);
    }
  }, [onAudiosReady]);

  // Upload de fichier
  const handleFileUpload = (key: 'evidence' | 'suspect1' | 'suspect2' | 'suspect3') => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setUploadedFiles(prev => ({ ...prev, [key]: file }));
    } else {
      alert('❌ Veuillez sélectionner un fichier audio valide');
    }
  };

  // Utiliser les fichiers uploadés
  const handleUseUploaded = useCallback(() => {
    if (!uploadedFiles.evidence) {
      alert('❌ Veuillez uploader au moins le fichier Evidence principal');
      return;
    }

    const audioUrls = {
      evidenceDistorted: URL.createObjectURL(uploadedFiles.evidence),
      evidenceClean: uploadedFiles.evidence ? URL.createObjectURL(uploadedFiles.evidence) : '',
      suspect1: uploadedFiles.suspect1 ? URL.createObjectURL(uploadedFiles.suspect1) : '',
      suspect2: uploadedFiles.suspect2 ? URL.createObjectURL(uploadedFiles.suspect2) : '',
      suspect3: uploadedFiles.suspect3 ? URL.createObjectURL(uploadedFiles.suspect3) : '',
    };

    onAudiosReady(audioUrls);
  }, [uploadedFiles, onAudiosReady]);

  const isUploadReady = !!uploadedFiles.evidence;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-forensics-bg">
      <motion.div
        className="max-w-3xl w-full"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-forensics-cyan font-mono mb-3">
            🎵 CONFIGURATION AUDIO
          </h1>
          <p className="text-gray-400 font-mono text-sm">
            Choisissez votre mode de test
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mode Démo */}
          <motion.div
            className="bg-forensics-bg-light border-2 border-forensics-cyan rounded-lg p-6"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
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

            <div className="space-y-3 text-sm text-gray-300 font-mono mb-6">
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
                Sons de test réalistes
              </p>
            </div>

            <button
              onClick={handleGenerateDemo}
              disabled={isGenerating}
              className="w-full py-3 px-4 bg-forensics-cyan hover:bg-forensics-cyan-light text-forensics-bg font-bold font-mono rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? '⏳ Génération...' : '🚀 GÉNÉRER & DÉMARRER'}
            </button>
          </motion.div>

          {/* Mode Upload */}
          <motion.div
            className="bg-forensics-bg-light border-2 border-gray-600 rounded-lg p-6"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
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
              {/* Evidence principale */}
              <div>
                <label className="block text-xs text-gray-400 font-mono mb-1">
                  Evidence principale (requis) *
                </label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload('evidence')}
                  className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-mono file:bg-forensics-cyan file:text-forensics-bg hover:file:bg-forensics-cyan-light file:cursor-pointer"
                />
                {uploadedFiles.evidence && (
                  <p className="text-xs text-forensics-green mt-1 font-mono">
                    ✓ {uploadedFiles.evidence.name}
                  </p>
                )}
              </div>

              {/* Suspects (optionnels) */}
              <details className="text-gray-400">
                <summary className="cursor-pointer text-xs font-mono hover:text-gray-300">
                  + Ajouter voix suspects (optionnel)
                </summary>
                <div className="mt-2 space-y-2 pl-3">
                  <div>
                    <label className="block text-xs font-mono mb-1">Suspect 1</label>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload('suspect1')}
                      className="w-full text-xs text-gray-300 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-mono file:bg-gray-700 file:text-gray-300 hover:file:bg-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono mb-1">Suspect 2</label>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload('suspect2')}
                      className="w-full text-xs text-gray-300 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-mono file:bg-gray-700 file:text-gray-300 hover:file:bg-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono mb-1">Suspect 3</label>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload('suspect3')}
                      className="w-full text-xs text-gray-300 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-mono file:bg-gray-700 file:text-gray-300 hover:file:bg-gray-600"
                    />
                  </div>
                </div>
              </details>
            </div>

            <button
              onClick={handleUseUploaded}
              disabled={!isUploadReady}
              className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold font-mono rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isUploadReady ? '✓ UTILISER MES FICHIERS' : '⚠ Fichier requis'}
            </button>
          </motion.div>
        </div>

        {/* Info */}
        <motion.div
          className="mt-6 p-4 bg-blue-500/10 border border-blue-500 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xs text-blue-400 font-mono">
            💡 <strong>Astuce:</strong> Pour commencer rapidement, utilisez le MODE DÉMO pour générer des sons de test synthétiques et explorer l'interface.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};
