/**
 * Scenarios data — définit les deux scénarios jouables
 * Corbeau de Quissioux (adulte) + Agressions à Brain City (enfants/ados)
 */

import type { Suspect } from '@/types/suspects';

export type ScenarioId = 'corbeau' | 'braincity';

export interface RicardoLines {
  setup: string;
  play: string;
  filters: Record<string, string>;
  hot: string;
  veryHot: string;
  suspectComments: Record<string, string>;
  allCluesFound: string;
  correctSuspect: string;
  wrongSuspect: string;
}

type ClueCheckState = {
  lowPassFilter: { enabled: boolean; frequency: number };
  highPassFilter: { enabled: boolean; frequency: number };
  pitchShift: { semitones: number };
  isReversed: boolean;
  bandPassFilter: { enabled: boolean; frequency: number };
  notchFilter: { enabled: boolean; frequency: number };
  compressor: { enabled: boolean };
  playbackSpeed: number;
};

export interface ClueDefinition {
  id: string;
  label: string;
  hint: string;
  ricardoHint?: string;
  proximity?: (s: ClueCheckState) => number;
  check: (s: ClueCheckState) => boolean;
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
  storyBrief: string[];
  ricardoLines?: RicardoLines;
  onboarding?: {
    agentName: string;
    agentRole: string;
    agentImage?: string;
    greeting: string;
    instructions: string[];
  };
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
      name: 'Théo Garcia',
      role: "Chargé de production",
      photoUrl: '/images/suspects/theo_garcia.png',
      notes: 'Alibi : "J\'étais sur le tournage du clip M2LT De Michou"',
    },
    {
      id: 'suspect-2',
      name: 'Robin Lemaire',
      role: 'Professeur d\'EPS au collège de Quissioux',
      photoUrl: '/images/suspects/robin_lemaire.png',
      notes: 'Alibi : "J\'étais au collège de Quissioux toute la journée"',
    },
    {
      id: 'suspect-3',
      name: 'Juliette Meyer',
      role: 'Conseillère bancaire',
      photoUrl: '/images/suspects/juliette_meyer.png',
      notes: 'Alibi : "J\'étais partie boire un cappuccino en ville"',
    },
    {
      id: 'suspect-4',
      name: 'Yanis Benali',
      role: 'Physionomiste à la boite de nuit le Mirador',
      photoUrl: '/images/suspects/yanis_benali.png',
      notes: 'Alibi : "J\'étais au Mirador toute la soirée, je me reposais aujourd\'hui"',
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
      label: 'Message REDRUM inversé découvert',
      hint: 'Reverse activé (MURDER)',
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
      label: 'Tics de langage détectés',
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
    'Le clocher de l\'église Saint-Pierre et l\'analyse du mot inversé "REDRUM" en "MURDER" ont totalement détruit l\'alibi de Robin Lemaire. Au lieu de surveiller ses élèves au collège, il orchestrait cet appel démoniaque depuis le sommet de l\'église. Son arrestation a permis de retrouver le petit Léo, sain et sauf.',
  failureTitle: 'IDENTIFICATION ERRONÉE',
  failureMessage:
    'Mauvaise piste, agent. Le Corbeau n\'est pas cette personne. Les indices sonores étaient pourtant là — le clocher, et cette voix inversée masquant le mot "MURDER". Recommencez l\'analyse et regardez de plus près le spectrogramme.',
  storyBrief: [
    "Quissioux, une petite ville d'ordinaire sans histoire, est aujourd'hui plongée dans le silence. Depuis 72 heures, le jeune Léo Dragnon, 5 ans, s'est volatilisé. Alors que les battues s'essoufflent et que l'espoir vacille, un nouvel élément fait basculer l'enquête : Marie Dragnon a reçu un appel anonyme.",
    "Une voix d'outre-tombe, hachée par un brouillage sophistiqué, proférant des menaces explicites contre ceux qui chercheraient à retrouver l'enfant. La police locale est dans l'impasse. Votre unité, la SRIS (Section de Recherche et d’Investigation Sonore), est la seule capable de briser ce mur du son.",
    "Le fichier est entre vos mains. Derrière le chaos des fréquences et le bruit blanc se cache l'identité d'un ravisseur. Chaque seconde compte : filtrez, nettoyez, restaurez. Le coupable est parmi les suspects, et sa voix est la seule trace qu'il a laissée."
  ],
  onboarding: {
    agentName: "Agent V",
    agentRole: "Chef de la Section de Recherche et d'Investigation Sonore (SRIS)",
    greeting: "Agent, nous avons un nouveau dossier critique à traiter. Un corbeau sévit à Quissioux.",
    instructions: [
      "Votre mission est d'identifier le suspect à partir de l'enregistrement compromis.",
      "Utilisez les différents filtres audio pour nettoyer le bruit de fond, isoler les voix et révéler les indices dissimulés.",
      "La forme d'onde, le spectrogramme et l'analyse fréquentielle vous aideront à visualiser les signaux.",
      "Une fois les indices réunis, comparez l'enregistrement avec les profils des suspects pour trouver le coupable."
    ],
  },
};

// ──────────────────────────────────────────────
// Scénario B : Agressions à Brain City
// ──────────────────────────────────────────────
const BRAIN_CITY: ScenarioData = {
  id: 'braincity',
  title: 'Agressions à Brain City',
  subtitle: 'Dossier 21-K — Unité Jeunesse & Sécurité',
  guiltyId: 'suspect-bc-5',
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
      name: 'Chimpanzini Bananini',
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
      name: 'Tung Tung Tung Sahur',
      role: 'Joueur de baseball de rue',
      photoUrl: '/images/suspects/tuntuntun.png',
      notes: 'Alibi : "Je m\'entraînais aux lancers avec ma batte ce matin"',
    },
  ],
  matchScores: {
    'suspect-bc-2': 11,
    'suspect-bc-3': 8,
    'suspect-bc-4': 21,
    'suspect-bc-5': 93,
  },
  clueTriggers: [
    {
      id: 'cles-chantier',
      label: 'Impact de batte en bois détecté',
      hint: 'Éléphant activé',
      ricardoHint: 'Clique sur l\'Éléphant — l\'enregistrement a capté des chocs lourds, on dirait une batte de baseball en bois !',
      proximity: (s) => {
        if (!s.lowPassFilter.enabled) return 0;
        const f = s.lowPassFilter.frequency;
        if (f >= 300 && f <= 2000) return 1;
        return f > 2000 ? Math.max(0, 1 - (f - 2000) / 8000) : Math.max(0, f / 300);
      },
      check: (s) => s.lowPassFilter.enabled && s.lowPassFilter.frequency >= 300 && s.lowPassFilter.frequency <= 2000,
    },
    {
      id: 'voix-agr',
      label: 'Voix de l\'agresseur isolée',
      hint: 'Abeille activée',
      ricardoHint: 'Essaie l\'Abeille — il faut nettoyer les sifflements pour mieux entendre sa voix !',
      proximity: (s) => {
        if (!s.highPassFilter.enabled) return 0;
        const f = s.highPassFilter.frequency;
        if (f >= 80 && f <= 400) return 1;
        return f > 400 ? Math.max(0, 1 - (f - 400) / 2000) : Math.max(0, f / 80);
      },
      check: (s) => s.highPassFilter.enabled && s.highPassFilter.frequency >= 80 && s.highPassFilter.frequency <= 400,
    },
    {
      id: 'sifflement',
      label: 'Sifflement asthmatique repéré',
      hint: 'Filtre Robot activé',
      ricardoHint: 'Utilise le Filtre Robot — il y a un drôle de sifflement caché là-dedans !',
      proximity: (s) => {
        if (!s.bandPassFilter.enabled) return 0;
        const f = s.bandPassFilter.frequency;
        if (f >= 400 && f <= 1500) return 1;
        return f > 1500 ? Math.max(0, 1 - (f - 1500) / 4000) : Math.max(0, (f - 100) / 300);
      },
      check: (s) => s.bandPassFilter.enabled && s.bandPassFilter.frequency >= 400 && s.bandPassFilter.frequency <= 1500,
    },
    {
      id: 'buzz-elec',
      label: 'Buzz électrique supprimé',
      hint: 'Balai Magique activé',
      ricardoHint: 'Passe un coup de Balai Magique — il y a un buzz électrique qui cache des bruits !',
      proximity: (s) => {
        if (!s.notchFilter.enabled) return 0;
        const f = s.notchFilter.frequency;
        if (f >= 40 && f <= 80) return 1;
        return f > 80 ? Math.max(0, 1 - (f - 80) / 500) : Math.max(0, (f - 20) / 20);
      },
      check: (s) => s.notchFilter.enabled && s.notchFilter.frequency >= 40 && s.notchFilter.frequency <= 80,
    },
    {
      id: 'pitch-agr',
      label: 'Voix grave restaurée',
      hint: 'Ballon Hélium entre -6 et -2',
      ricardoHint: 'Dégonfle un peu le Ballon Hélium — la voix a été rendue trop aiguë pour cacher l\'identité de l\'agresseur !',
      proximity: (s) => {
        const p = s.pitchShift.semitones;
        if (p === 0) return 0;
        if (p >= -6 && p <= -2) return 1;
        if (p > -2) return Math.max(0, 1 - (p + 2) / 6);
        return Math.max(0, 1 - (-6 - p) / 6);
      },
      check: (s) => s.pitchShift.semitones >= -6 && s.pitchShift.semitones <= -2,
    },
    {
      id: 'message-larry',
      label: 'Message de Larry décodé',
      hint: 'Tourne-disque activé',
      ricardoHint: 'Utilise le Tourne-disque — Larry a caché un message à l\'envers dans l\'enregistrement !',
      proximity: (s) => (s.isReversed ? 1 : 0),
      check: (s) => s.isReversed,
    },
    {
      id: 'chuchotement-agr',
      label: 'Menaces amplifiées',
      hint: 'Grosse Loupe activée',
      ricardoHint: 'Prends la Grosse Loupe — il y a des chuchotements trop faibles pour être entendus normalement !',
      proximity: (s) => (s.compressor.enabled ? 1 : 0),
      check: (s) => s.compressor.enabled,
    },
    {
      id: 'ralenti-agr',
      label: 'Sifflement de batte fendant l\'air',
      hint: 'Mode Tortue activé (Vitesse ≤ 0.75×)',
      ricardoHint: 'Passe en mode Tortue — on entend le bruit de sa batte qui fend l\'air au ralenti !',
      proximity: (s) => {
        if (s.playbackSpeed <= 0.75) return 1;
        return Math.max(0, 1 - (s.playbackSpeed - 0.75) / 0.5);
      },
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
    'Utilise l\'Éléphant et l\'Abeille pour nettoyer le son',
    'Corrige la voix modifiée avec le Ballon Hélium',
    'Utilise le Tourne-disque pour décoder le message de Larry',
  ],
  successTitle: 'SUSPECT ARRÊTÉ !',
  successStory:
    'Le sifflement asthmatique et l\'impact résonnant de sa batte de baseball ont permis d\'identifier Tung Tung Tung Sahur avec certitude. Au lieu de s\'entraîner tranquillement, il s\'en est pris à la pauvre Ballerina Cappuccina. Il a été arrêté et sa batte saisie. Le quartier est à nouveau en sécurité !',
  failureTitle: 'MAUVAISE PISTE !',
  failureMessage:
    'Ce n\'est pas le bon ! L\'agresseur court toujours dans Brain City. Écoute mieux — le sifflement asthmatique et le fracas d\'une batte en bois sont bien cachés dans l\'enregistrement. Analyse à nouveau !',
  ricardoLines: {
    setup: "Salut l'équipe ! On a un gros problème à Brain City. Un enregistrement compromis par Larry… et un agresseur qui court toujours dans les rues ! Je compte sur vous pour l'analyser. Prêts à mener l'enquête ?",
    play: "Ouvre bien tes oreilles, l'enregistrement commence ! Il y a des sons bizarres là-dedans…",
    filters: {
      lowPass: "J'entends de gros bruits forts… demande à l'Éléphant !",
      highPass: "Des sifflements gênent l'écoute… appelle l'Abeille pour réparer ça !",
      bandPass: "La voix est modifiée… passe ça au Filtre Robot, on entendra mieux !",
      notch: "Ce buzz électrique agaçant… un coup de Balai Magique devrait l'éliminer !",
      compressor: "La Grosse Loupe nous aidera à mieux entendre… chut, j'entends des chuchotements !",
      reverse: "L'audio à l'envers ! Avec le Tourne-disque, Larry a peut-être caché un message secret là-dedans…",
    },
    hot: "Chaud chaud ! Bouge encore un peu ce curseur, on approche quelque chose !",
    veryHot: "TRÈS CHAUD !! Encore un tout petit peu… on y est presque !!",
    suspectComments: {
      'suspect-bc-2': "BrrBrr Patapim… sa physiologie corpulente ne correspond pas aux bruits agiles entendus dans l'enregistrement.",
      'suspect-bc-3': "Chimpanzini Bananini ? Il était en train de manger des bananes… mais son profil vocal ne correspond pas du tout.",
      'suspect-bc-4': "Tralalero Tralala ? Il faisait du jogging avec ses Nike… sa voix est bien trop douce comparée à l'enregistrement.",
      'suspect-bc-5': "Tung Tung Tung Sahur… ce sifflement asthmatique et le bruit sourd de sa batte en bois fendant l'air… Cot-cot, j'ai un très mauvais pressentiment sur lui !",
    },
    allCluesFound: "INCROYABLE ! On a trouvé tous les indices ! Je suis certain de savoir qui c'est. Vas-y, accuse-le !",
    correctSuspect: "BRAVO ! Je savais qu'on y arriverait ensemble ! Cot-cot-COT ! Brain City est sauvée grâce à toi ! 🎉",
    wrongSuspect: "Oh non… ce n'est pas lui. J'aurais dû insister davantage sur les indices sonores. On recommence ?",
  },
  storyBrief: [
    "Alerte générale à Brain City ! Ici le commissaire Ricardo Pouleto, chef de la police scientifique. Le 9 avril 2026, à 22h30, l'impensable s'est produit : la célèbre Ballerina Cappuccina a été lâchement attaquée, et sa précieuse anse a volé en éclats !",
    "J'ai réussi à enregistrer la voix du coupable, mais ce garnement de Larry le Malicieux est passé par là et a totalement saboté la bande audio. Agents, nous avons besoin de vous ! Votre mission : nettoyez la piste, filtrez les parasites et démasquez l'agresseur.",
    "Est-ce Tralalero Tralala, Chimpanzini Bananini, Brr Brr Patapim ou le mystérieux Tung Tung Tung Sahur ? À vous de jouer, l'enquête commence maintenant !"
  ],
  onboarding: {
    agentName: "Ricardo Pouleto",
    agentRole: "Inspecteur Chef",
    agentImage: "/images/inspecteur/Ricardo_Pouleto_sticker.png",
    greeting: "Salut la jeune recrue ! Prêt(e) à mener l'enquête ?",
    instructions: [
      "Ta mission est de retrouver le coupable en écoutant cet enregistrement mystère !",
      "Utilise nos supers outils de détective (comme l'Éléphant ou le Ballon Hélium) pour nettoyer le son.",
      "Regarde bien les couleurs sur l'écran pour trouver tous les indices, comme des bruits cachés !",
      "Quand tu penses avoir trouvé le coupable, clique très vite sur le gros bouton J'ACCUSE !"
    ],
  },
};

export const SCENARIOS: Record<ScenarioId, ScenarioData> = {
  corbeau: CORBEAU,
  braincity: BRAIN_CITY,
};

export function getScenario(id: ScenarioId): ScenarioData {
  return SCENARIOS[id];
}
