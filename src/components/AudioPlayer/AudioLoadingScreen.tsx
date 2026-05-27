/**
 * AudioLoadingScreen — Écran de chargement audio post-intro.
 * Le scénario a déjà été choisi (ModeSelectScreen). On se contente de
 * télécharger / pré-traiter les pistes puis de continuer vers le login.
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAudioStore } from '@/stores/audioStore';
import type { ScenarioId } from '@/data/scenarios';
import { reverseAudioBlob, createAudioURL } from '@/utils/audioGenerator';

const OFFICIAL_AUDIO: Record<ScenarioId, {
  evidenceDistorted: string;
  evidenceClean: string;
  suspect1: string;
  suspect2: string;
  suspect3: string;
  suspect4: string;
}> = {
  corbeau: {
    evidenceDistorted: '/audio/voixModifie.mp3',
    evidenceClean: '/audio/voixModifie.mp3',
    suspect1: '/audio/voix_theo.m4a',
    suspect2: '/audio/voix_robin.m4a',
    suspect3: '/audio/voix_juliette.m4a',
    suspect4: '/audio/voix_yanis.m4a',
  },
  braincity: {
    evidenceDistorted: '/audio/Sahur_Voice Changer.mp3',
    evidenceClean: '/audio/Sahur_Voice Changer.mp3',
    suspect1: '/audio/BrrBrrPatapim.wav',
    suspect2: '/audio/Chimpanzinibananini.wav',
    suspect3: '/audio/Tralalerotralala.wav',
    suspect4: '/audio/Sahur.wav',
  },
};

const AudioLoadingScreen = () => {
  const navigate = useNavigate();
  const { scenario, setAudioUrls } = useAudioStore();
  const [error, setError] = useState<string | null>(null);
  const hasStartedRef = useRef(false);
  const isBrainCity = scenario === 'braincity';

  useEffect(() => {
    // Garde contre le double-mount en React.StrictMode
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const MIN_DISPLAY_MS = 2200; // laisse le temps d'apprécier l'animation
    const load = async () => {
      try {
        const audio = OFFICIAL_AUDIO[scenario];
        const minDelay = new Promise<void>((resolve) => setTimeout(resolve, MIN_DISPLAY_MS));

        const fetchAndReverse = (async () => {
          const response = await fetch(audio.evidenceDistorted);
          if (!response.ok) {
            throw new Error(`Fichier audio introuvable (${response.status})`);
          }
          const blob = await response.blob();
          const evidenceReverse = await reverseAudioBlob(blob);
          return createAudioURL(evidenceReverse);
        })();

        const [evidenceReverseUrl] = await Promise.all([fetchAndReverse, minDelay]);
        setAudioUrls({ ...audio, evidenceReverse: evidenceReverseUrl });
        navigate('/login');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'inconnu';
        setError(`Impossible de charger les pistes audio (${msg}).`);
      }
    };
    void load();
  }, [scenario, setAudioUrls, navigate]);

  if (isBrainCity) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #FFF9EC 0%, #FFF3D4 55%, #FFEBC0 100%)',
          backgroundImage:
            'radial-gradient(circle, rgba(7,59,76,0.18) 1.5px, transparent 1.5px), linear-gradient(145deg, #FFF9EC 0%, #FFF3D4 55%, #FFEBC0 100%)',
          backgroundSize: '26px 26px, 100% 100%',
        }}
      >
        <motion.img
          src="/images/inspecteur/Ricardo_Pouleto_thinking.png"
          alt="Ricardo prépare l'enquête"
          className="w-40 h-40 object-contain mb-6"
          animate={{ rotate: [0, -6, 6, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <h1
          className="font-bangers text-5xl tracking-widest mb-2"
          style={{ color: '#118AB2', textShadow: '3px 3px 0 rgba(7,59,76,0.18)' }}
        >
          Préparation de l'enquête…
        </h1>
        <p className="font-nunito font-bold text-base" style={{ color: 'rgba(7,59,76,0.6)' }}>
          Ricardo prépare les pistes audio ! 🎧
        </p>
        {error && (
          <p className="mt-6 font-nunito font-bold text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden" style={{ background: '#060810' }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
      <div className="relative z-10 flex flex-col items-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <motion.div
              key={i}
              className="w-1 bg-forensics-cyan/80"
              style={{ height: 36 }}
              animate={{ height: [36, 10, 36] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.08 }}
            />
          ))}
        </div>
        <h1 className="font-mono text-xl tracking-[0.35em] uppercase text-forensics-cyan mb-3">
          Initialisation du dossier
        </h1>
        <p className="font-mono text-xs tracking-[0.3em] uppercase" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Chargement des pièces sonores en cours
        </p>
        {error && (
          <p className="mt-6 font-mono text-xs tracking-wider text-red-500 uppercase">{error}</p>
        )}
      </div>
    </div>
  );
};

export default AudioLoadingScreen;
