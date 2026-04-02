/**
 * Scenarios data — définit les deux scénarios jouables
 * Corbeau de Quissioux (adulte) + Agressions à Brain City (enfants/ados)
 */

import type { Suspect } from '@/types/suspects';

export type ScenarioId = 'corbeau' | 'braincity';

export interface ClueDefinition {
  id: string;
  label: string;
  hint: string;
  check: (s: {
    lowPassFilter: { enabled: boolean; frequency: number };
    highPassFilter: { enabled: boolean; frequency: number };
    pitchShift: { semitones: number };
    isReversed: boolean;
    bandPassFilter: { enabled: boolean; frequency: number };
    notchFilter: { enabled: boolean; frequency: number };
    compressor: { enabled: boolean };
    playbackSpeed: number;
  }) => boolean;
}

export interface ScenarioData {
  id: ScenarioId;
  title: string;
  subtitle: string;
  guiltyId: string;
  suspects: Omit<Suspect, 'isIdentified'>[];
  matchScores: Record<string, number>;
  clueTriggers: ClueDefinition[];
  missionBrief: { crime: string; evidence: string; mission: string };
  analysisSteps: string[];
  successTitle: string;
  successStory: string;
  failureTitle: string;
  failureMessage: string;
}

// ──────────────────────────────────────────────
// Scénario A : Le Corbeau de Quissioux
// ──────────────────────────────────────────────
const CORBEAU: ScenarioData = {
  id: 'corbeau',
  title: 'Le Corbeau de Quissioux',
  subtitle: 'Dossier 84-V — Division Criminalistique Audio',
  guiltyId: 'suspect-2',
  suspects: [
    {
      id: 'suspect-1',
      name: 'Bernard Mallet',
      role: "Gardien d'immeuble",
      photoUrl: '/images/suspects/suspect-12.jpg',
      notes: 'Alibi : "J\'étais à la cave toute la matinée"',
    },
    {
      id: 'suspect-2',
      name: 'Isabelle Renard',
      role: 'Voisine de palier',
      photoUrl: '/images/suspects/suspect-47.jpg',
      notes: 'Alibi : "J\'étais chez ma sœur à Quissioux"',
    },
    {
      id: 'suspect-3',
      name: 'Karim Daoudi',
      role: 'Livreur',
      photoUrl: '/images/suspects/suspect-33.jpg',
      notes: 'Alibi : "En tournée de livraison toute la journée"',
    },
    {
      id: 'suspect-4',
      name: 'Sylvie Marchand',
      role: 'Institutrice retraitée',
      photoUrl: '/images/suspects/suspect-26.jpg',
      notes: 'Alibi : "Cours de jardinage au centre communal"',
    },
  ],
  matchScores: {
    'suspect-1': 12,
    'suspect-2': 94,
    'suspect-3': 8,
    'suspect-4': 21,
  },
  clueTriggers: [
    {
      id: 'clocher',
      label: 'Son de clocher identifié',
      hint: 'Low-pass entre 600–2 000 Hz',
      check: (s) => s.lowPassFilter.enabled && s.lowPassFilter.frequency >= 600 && s.lowPassFilter.frequency <= 2000,
    },
    {
      id: 'voix',
      label: 'Voix clarifiée',
      hint: 'High-pass entre 80–400 Hz',
      check: (s) => s.highPassFilter.enabled && s.highPassFilter.frequency >= 80 && s.highPassFilter.frequency <= 400,
    },
    {
      id: 'pitch',
      label: 'Tonalité restaurée',
      hint: 'Pitch entre -8 et -2 ST',
      check: (s) => s.pitchShift.semitones >= -8 && s.pitchShift.semitones <= -2,
    },
    {
      id: 'message-cache',
      label: 'Message caché trouvé',
      hint: 'Reverse activé',
      check: (s) => s.isReversed,
    },
    {
      id: 'plage-vocale',
      label: 'Accent reconnu',
      hint: 'Band-pass entre 800–3 000 Hz',
      check: (s) => s.bandPassFilter.enabled && s.bandPassFilter.frequency >= 800 && s.bandPassFilter.frequency <= 3000,
    },
    {
      id: 'interference',
      label: 'Interférence supprimée',
      hint: 'Notch entre 40–80 Hz',
      check: (s) => s.notchFilter.enabled && s.notchFilter.frequency >= 40 && s.notchFilter.frequency <= 80,
    },
    {
      id: 'chuchotement',
      label: 'Chuchotement révélé',
      hint: 'Compresseur activé',
      check: (s) => s.compressor.enabled,
    },
    {
      id: 'ralenti',
      label: 'Accent détecté',
      hint: 'Vitesse ≤ 0.75×',
      check: (s) => s.playbackSpeed <= 0.75,
    },
  ],
  missionBrief: {
    crime: 'Menaces anonymes répétées',
    evidence: 'Enregistrement vocal modifié',
    mission: 'Restaurer la voix et identifier le suspect',
  },
  analysisSteps: [
    "Lancez la lecture et observez le spectrogramme",
    "Activez les filtres pour nettoyer l'audio",
    'Corrigez le pitch pour restaurer la voix',
    'Activez REVERSE pour les messages cachés',
  ],
  successTitle: 'ARRESTATION CONFIRMÉE',
  successStory:
    'Le clocher de l\'église Saint-Pierre et le message inversé "Prenez le train de 14h15" ont permis de localiser Isabelle Renard, voisine de palier, au moment des faits. Elle a été interceptée en gare de Quissioux avant de monter à bord du train. Le petit Léo est sain et sauf.',
  failureTitle: 'IDENTIFICATION ERRONÉE',
  failureMessage:
    'Mauvaise piste, agent. Le Corbeau a pris le train de 14h15. Les indices sonores étaient là — le clocher, la gare, la voix inversée. Recommencez l\'analyse et regardez de plus près le spectrogramme.',
};

// ──────────────────────────────────────────────
// Scénario B : Agressions à Brain City
// ──────────────────────────────────────────────
const BRAIN_CITY: ScenarioData = {
  id: 'braincity',
  title: 'Agressions à Brain City',
  subtitle: 'Dossier 21-K — Unité Jeunesse & Sécurité',
  guiltyId: 'suspect-bc-2',
  suspects: [
    {
      id: 'suspect-bc-2',
      name: 'BrrBrr Patapim',
      role: 'Créature de la forêt urbaine',
      photoUrl: '/images/suspects/brrbrr.png',
      notes: 'Aucun alibi solide — a été vu rôder près du parc',
    },
    {
      id: 'suspect-bc-3',
      name: 'Chimpanzani Banana',
      role: 'Singe banane de Brain City',
      photoUrl: '/images/suspects/chimpanzani.png',
      notes: 'Alibi : "J\'étais en train de manger des bananes"',
    },
    {
      id: 'suspect-bc-4',
      name: 'Tralalero Tralala',
      role: 'Requin des rues',
      photoUrl: '/images/suspects/tralala.png',
      notes: 'Alibi : "Je faisais du jogging avec mes Nike"',
    },
    {
      id: 'suspect-bc-5',
      name: 'Tung Tung Tung',
      role: 'Gardien de la cuillère sacrée',
      photoUrl: '/images/suspects/tuntuntun.png',
      notes: 'Alibi : "Je balayais le trottoir toute la matinée"',
    },
  ],
  matchScores: {
    'suspect-bc-2': 93,
    'suspect-bc-3': 8,
    'suspect-bc-4': 21,
    'suspect-bc-5': 11,
  },
  clueTriggers: [
    {
      id: 'cles-chantier',
      label: 'Cliquetis de clés détecté',
      hint: 'Low-pass entre 300–2 000 Hz',
      check: (s) => s.lowPassFilter.enabled && s.lowPassFilter.frequency >= 300 && s.lowPassFilter.frequency <= 2000,
    },
    {
      id: 'voix-agr',
      label: 'Voix de l\'agresseur isolée',
      hint: 'High-pass entre 80–400 Hz',
      check: (s) => s.highPassFilter.enabled && s.highPassFilter.frequency >= 80 && s.highPassFilter.frequency <= 400,
    },
    {
      id: 'sifflement',
      label: 'Sifflement asthmatique repéré',
      hint: 'Band-pass entre 400–1 500 Hz',
      check: (s) => s.bandPassFilter.enabled && s.bandPassFilter.frequency >= 400 && s.bandPassFilter.frequency <= 1500,
    },
    {
      id: 'buzz-elec',
      label: 'Buzz électrique supprimé',
      hint: 'Notch entre 40–80 Hz',
      check: (s) => s.notchFilter.enabled && s.notchFilter.frequency >= 40 && s.notchFilter.frequency <= 80,
    },
    {
      id: 'pitch-agr',
      label: 'Voix grave restaurée',
      hint: 'Pitch entre -6 et -2 ST',
      check: (s) => s.pitchShift.semitones >= -6 && s.pitchShift.semitones <= -2,
    },
    {
      id: 'message-larry',
      label: 'Message de Larry décodé',
      hint: 'Reverse activé',
      check: (s) => s.isReversed,
    },
    {
      id: 'chuchotement-agr',
      label: 'Menaces amplifiées',
      hint: 'Compresseur activé',
      check: (s) => s.compressor.enabled,
    },
    {
      id: 'ralenti-agr',
      label: 'Accent industriel confirmé',
      hint: 'Vitesse ≤ 0.75×',
      check: (s) => s.playbackSpeed <= 0.75,
    },
  ],
  missionBrief: {
    crime: 'Agressions répétées dans le quartier industriel',
    evidence: 'Enregistrement corrompu par "Larry"',
    mission: 'Retrouver l\'agresseur avant qu\'il frappe à nouveau',
  },
  analysisSteps: [
    'Écoute l\'enregistrement et repère les sons ambiants',
    'Filtre le bruit du chantier avec les filtres',
    'Corrige la voix modifiée (pitch)',
    'Inverse le son pour décoder le message de Larry',
  ],
  successTitle: 'SUSPECT ARRÊTÉ !',
  successStory:
    'Les grognements caractéristiques et le bruit de branches cassées dans l\'enregistrement ont permis d\'identifier BrrBrr Patapim avec certitude. La créature rôdait dans le parc depuis des semaines. Elle a été capturée près de la fontaine de Brain City. Le quartier est à nouveau en sécurité !',
  failureTitle: 'MAUVAISE PISTE !',
  failureMessage:
    'Ce n\'est pas le bon ! BrrBrr Patapim court toujours dans Brain City. Écoute mieux — les grognements et les bruits de forêt sont dans l\'enregistrement. Analyse à nouveau !',
};

export const SCENARIOS: Record<ScenarioId, ScenarioData> = {
  corbeau: CORBEAU,
  braincity: BRAIN_CITY,
};

export function getScenario(id: ScenarioId): ScenarioData {
  return SCENARIOS[id];
}
