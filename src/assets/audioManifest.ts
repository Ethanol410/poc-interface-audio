/**
 * Audio Manifest - Catalogue des fichiers audio disponibles
 */

export interface AudioFile {
  id: string;
  name: string;
  url: string;
  duration: number; // seconds
  description: string;
  isOriginal?: boolean;
  tags: string[];
}

export const audioManifest: AudioFile[] = [
  {
    id: 'evidence-01',
    name: 'Message du Corbeau',
    url: '/audio/evidence-01-distorted.mp3',
    duration: 25,
    description:
      'Enregistrement vocal principal - voix modifiée du suspect (pitch shift, bruit, filtrage)',
    isOriginal: false,
    tags: ['evidence', 'distorted', 'main'],
  },
  {
    id: 'evidence-01-clean',
    name: 'Message Original (Référence)',
    url: '/audio/evidence-01-clean.mp3',
    duration: 25,
    description:
      "Version non altérée de l'enregistrement - pour comparaison A/B",
    isOriginal: true,
    tags: ['reference', 'clean'],
  },
  {
    id: 'suspect-voice-01',
    name: 'Voix Suspect A',
    url: '/audio/suspect-01.mp3',
    duration: 15,
    description: 'Échantillon vocal du suspect A pour comparaison',
    tags: ['suspect', 'comparison'],
  },
  {
    id: 'suspect-voice-02',
    name: 'Voix Suspect B',
    url: '/audio/suspect-02.mp3',
    duration: 15,
    description: 'Échantillon vocal du suspect B pour comparaison',
    tags: ['suspect', 'comparison'],
  },
  {
    id: 'suspect-voice-03',
    name: 'Voix Suspect C',
    url: '/audio/suspect-03.mp3',
    duration: 15,
    description: 'Échantillon vocal du suspect C pour comparaison',
    tags: ['suspect', 'comparison'],
  },
  {
    id: 'suspect-voice-04',
    name: 'Voix Suspect D',
    url: '/audio/suspect-04.mp3',
    duration: 15,
    description: 'Échantillon vocal du suspect D pour comparaison',
    tags: ['suspect', 'comparison'],
  },
  {
    id: 'evidence-reverse',
    name: 'Message Inversé',
    url: '/audio/evidence-reverse.wav',
    duration: 25,
    description: 'Enregistrement inversé — révèle le message caché "Prenez le train de 14h15"',
    isOriginal: false,
    tags: ['evidence', 'reverse'],
  },
];

/**
 * Get audio file by ID
 */
export const getAudioById = (id: string): AudioFile | undefined => {
  return audioManifest.find((audio) => audio.id === id);
};

/**
 * Get all audio files with specific tag
 */
export const getAudioByTag = (tag: string): AudioFile[] => {
  return audioManifest.filter((audio) => audio.tags.includes(tag));
};

/**
 * Get main evidence audio
 */
export const getMainEvidence = (): AudioFile | undefined => {
  return audioManifest.find((audio) => audio.tags.includes('main'));
};

/**
 * Get suspect voice samples
 */
export const getSuspectVoices = (): AudioFile[] => {
  return getAudioByTag('suspect');
};
