# 🎙️ Audio Investigation Game

> **Application web immersive de criminalistique audio** — le joueur reçoit un enregistrement dégradé, applique des filtres en temps réel pour révéler des indices sonores, et démasque le coupable parmi quatre suspects.

Conçu pour le **festival [Crime & Science 2026](https://www.crimeetscience.com/)** — Pôle Phoenix, Pleumeur-Bodou (8 – 31 mai 2026).

![Built with React](https://img.shields.io/badge/React-18-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite)
![Web Audio API](https://img.shields.io/badge/Web%20Audio-API-ff6b6b)
![Stream Deck+](https://img.shields.io/badge/Stream%20Deck%2B-WebHID-000000?logo=elgato)
![PWA](https://img.shields.io/badge/PWA-offline-5a0fc8)

---

## ✨ Le projet en une minute

Deux **scénarios narratifs** au choix, chacun avec sa propre identité visuelle, sa narration et ses indices :

| Scénario | Public | Univers | Mission |
|---|---|---|---|
| **🦅 Le Corbeau de Quissioux** | Adulte | Forensique noir / cyan, terminal de police scientifique | Décoder un appel anonyme, démasquer un ravisseur d'enfant |
| **🧠 Agressions à Brain City** | Enfants / ados | Cartoon kid-tech, jaune / teal / coral, mascotte « Ricardo Pouleto » | Aider une poule inspectrice à confondre un agresseur de Brain City |

Le moteur audio, l'UX et les contrôles physiques sont les mêmes — seuls la narration, les visuels et les seuils de détection changent. **Architecture entièrement data-driven** : ajouter un scénario = ajouter un objet dans `src/data/scenarios.ts`.

---

## 🎛️ Feature phare — Stream Deck+ physique

L'application pilote en **WebHID** un [Elgato Stream Deck+](https://www.elgato.com/fr/fr/p/stream-deck-plus-black) — 8 touches LCD, 4 encodeurs rotatifs et un écran tactile horizontal — pour transformer le poste joueur en **vraie console d'analyse forensique**.

- **Page A — Filtres** : Lecture, Inverse, Graves, Aigus, Voix, Buzz, Murmure, *(switch page)*
- **Page B — Avancé** : Comparaison A/B, Reset, Presets « Clear / Masque / Analyse »
- **4 encodeurs** : Volume, fréquence Low-pass, fréquence High-pass, Pitch (–12 → +12 ST)
- **Push-encoder** : reset rapide / mute / toggle
- **Accélération rotation** ×9 sur rotation rapide (<30 ms entre events) pour balayer 20 kHz à la vitesse du geste
- **LCD strip** affiche en temps réel chaque potentiomètre avec barre de progression et unité (Hz, st, ×)
- **Skin Brain City** automatique : labels remplacés par des emojis (🐘 ELEPH, 🐝 ABEILL, 🤖 ROBOT, 🧹 BALAI, 🔎 LOUPE, 🎵 BALLON HÉLIUM…)
- Une **deuxième Stream Deck** peut être branchée pour piloter la grille des suspects (pop-up à l'écran, écoute, modification de la voix)

> Aucun driver à installer : tout tient dans le navigateur via [`@elgato-stream-deck/webhid`](https://www.npmjs.com/package/@elgato-stream-deck/webhid).

---

## 🧪 Le moteur audio

Singleton `AudioEngine` ([`src/services/audioEngine.ts`](src/services/audioEngine.ts)) basé sur la **Web Audio API native** + Tone.js pour l'unlock du contexte.

```
Source ─► LowPass ─► HighPass ─► BandPass ─► Notch ─► Compressor ─► Makeup ─► Gain ─► Analyser ─► Output
                                                                                          │
                                                                                          └► (bypass A/B via gain cross-fade)
```

- **5 filtres biquad** indépendants, désactivés en restant *dans le graphe* (réglés en `allpass` ou cutoff extrême)
- **Compresseur agressif** (ratio 12 : 1, threshold –30 dB, +6 dB makeup) déclenché par le bouton « Murmure / Loupe »
- **Pitch + Speed unifiés** en un seul `playbackRate = speed × 2^(semitones/12)`
- **Inversion** pré-calculée sur le `Blob` au chargement (pour révéler `MURDER` derrière `REDRUM`)
- **AnalyserNode** (FFT 2048, smoothing 0.8) alimentant 4 visualisations : waveform Wavesurfer, spectrogramme glissant, frequency bars, peak/RMS meter
- **Comparaison A/B** instantanée : un nœud bypass parallèle remixé par fades de gain (pas de reconnexion du graphe → zéro click)

---

## 🧩 Système d'indices auto-discovery

Chaque scénario définit des **`ClueDefinition`** avec une fonction `check(state) => boolean` lue à chaque mise à jour du store :

```ts
{
  id: 'message-cache',
  label: 'Message REDRUM inversé découvert',
  hint: 'Reverse activé (MURDER)',
  check: (s) => s.isReversed,
}
```

Le tableau de bord poll tous les triggers à chaque changement, et auto-révèle les indices au joueur. Aucune logique métier dispersée dans les composants : la « checklist d'enquête » est **purement déclarative**.

Brain City ajoute une fonction `proximity(state) => 0..1` permettant à Ricardo Pouleto de réagir : *« Chaud chaud ! Bouge encore un peu ce curseur ! »* à mesure que le joueur s'approche de la bonne fréquence.

---

## 🛠️ Stack technique

| Domaine | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript 5 strict (`noUnusedLocals`, ESLint 0 warning) |
| **Build / dev** | Vite 5, ESLint, Prettier, Vitest, Testing Library |
| **State** | Zustand 4 + middleware `persist` (volume, filtres, pitch, notes) |
| **Audio** | Web Audio API native, Tone.js 15 (unlock context), Wavesurfer.js 7 (UI playback) |
| **Animations** | Framer Motion 11 (transitions de routes, stagger, springs) |
| **Hardware** | `@elgato-stream-deck/webhid` 7 (WebHID — Chrome / Edge) |
| **Onboarding** | React Joyride 3 (tour interactif) |
| **Style** | TailwindCSS 3, deux thèmes (forensique sombre + bento kid-tech) |
| **PWA** | `vite-plugin-pwa`, Workbox `autoUpdate`, fonctionnement 100 % offline une fois chargé |

---

## 🧭 Flow applicatif

```
/intro       cinématique d'acquisition du signal (2 phases animées)
   │
   ▼
/setup       sélection du scénario (Corbeau / Brain City) + minuteur de mission
   │
   ▼
/            login d'agent (avec garde RequireAudio)
   │
   ▼
/briefing    briefing narratif (Story Brief) + onboarding modal
   │
   ▼
/workspace   ★ écran principal — filtres, visualisations, indices, Stream Deck
   │
   ▼
/suspects    grille des 4 suspects, écoute comparée, interrogatoire
   │
   ▼
/debrief     verdict — succès (arrestation) ou échec (mauvaise piste)
```

Les routes de gameplay sont protégées par le composant `RequireAudio` ([`App.tsx:21`](src/App.tsx#L21)) qui redirige vers `/intro` tant que les fichiers audio ne sont pas chargés.

---

## 📁 Architecture

```
src/
├── App.tsx                          Routes + lazy-loading + RequireAudio
├── main.tsx                         Entry + service worker
├── stores/
│   └── audioStore.ts                Zustand — source de vérité unique (persistée)
├── services/
│   ├── audioEngine.ts               Singleton Web Audio API
│   ├── audioAnalysis.ts             FFT helpers
│   ├── filterActions.ts             Bridge store ↔ engine
│   └── streamdeck/                  Intégration WebHID Elgato
│       ├── StreamDeckService.ts          Orchestrateur principal
│       ├── StreamDeckSuspectService.ts   Service dédié à la grille suspects
│       ├── streamDeckMappings.ts         Boutons + encodeurs (data-driven)
│       ├── streamDeckCommands.ts         Dispatch des actions
│       ├── streamDeckDisplay.ts          Rendu LCD
│       └── streamDeckConnector.ts        WebHID handshake
├── data/
│   └── scenarios.ts                 Narration, suspects, indices, briefs
├── components/
│   ├── Intro/IntroScreen.tsx        Cinématique d'ouverture
│   ├── Auth/                        Login, Story Brief
│   ├── AudioPlayer/                 Setup audio, Waveform Wavesurfer
│   ├── Workspace/Dashboard.tsx      ★ Écran principal de jeu
│   ├── Workspace/WorkspaceTour.tsx  Tour interactif Joyride
│   ├── Controls/                    Filter panel, pitch, params
│   ├── Visualization/               Spectrogram, FrequencyBars, AudioMeter
│   ├── Suspects/                    Grille + popup
│   ├── BrainCity/                   Ricardo, KidsToolPanel, événements
│   ├── StreamDeck/                  Statut connexion + suspect panel
│   ├── Debrief/ResultScreen.tsx     Verdict
│   └── Layout/                      AppLayout, ErrorBoundary, Offline, Loading
├── hooks/                           useAudioControls, useABComparison,
│                                    useFilterControls, useRicardo, useStreamDeck…
├── utils/
│   ├── audioGenerator.ts            Synthèse + reverse de Blobs
│   └── tourState.ts                 Persistance du tour Joyride
└── types/                           audio, suspects, navigation
```

**Principe directeur** : *many small files > few large files*. Chaque hook, service, mapping est isolé pour rester testable et remplaçable.

---

## 🚀 Lancer le projet

```bash
# 1. Installer
npm install

# 2. Dev server (http://localhost:3000)
npm run dev

# 3. Build prod (tsc + vite)
npm run build && npm run preview

# 4. Qualité
npm run lint     # ESLint, 0 warning toléré
npm run format   # Prettier
npm run test     # Vitest
```

> Pour utiliser le Stream Deck+ : navigateur **Chromium** (Chrome / Edge / Brave), brancher l'appareil, cliquer sur « Connecter le Stream Deck » dans le workspace, autoriser l'accès WebHID.

---

## ✅ État du projet

| Phase | Statut |
|---|---|
| Setup React / TS / Vite | ✅ |
| Pipeline Web Audio (5 filtres + compresseur + analyser) | ✅ |
| Visualisations (waveform, spectrogramme, FFT, meter) | ✅ |
| Deux scénarios complets (Corbeau + Brain City) | ✅ |
| Stream Deck+ WebHID — Page A + Page B + LCD | ✅ |
| Stream Deck dédiée à la grille suspects | ✅ |
| Onboarding + tour Joyride | ✅ |
| PWA / offline | ✅ |
| Tests Vitest (composants + hooks Brain City) | ✅ |
| Polish festival (Crime & Science, mai 2026) | 🟡 en cours |

---

## 🌐 Compatibilité navigateurs

| Navigateur | Audio | Stream Deck+ (WebHID) |
|---|---|---|
| Chrome / Edge / Brave (desktop) | ✅ | ✅ |
| Firefox desktop | ✅ | ❌ (pas de WebHID) |
| Safari desktop | ✅ | ❌ |
| iOS / iPadOS | ⚠️ restrictions audio | ❌ |

Pour le festival, l'environnement de référence est **Chrome desktop**.

---

## 🎓 Contexte

Projet réalisé dans le cadre d'une **installation interactive immersive** pour le festival **[Crime & Science 2026](https://www.crimeetscience.com/)**, qui se tient au **Pôle Phoenix de Pleumeur-Bodou** du **8 au 31 mai 2026**. L'objectif : faire vivre au public, jeune et adulte, l'expérience d'un analyste son de la police scientifique — manipulation de signaux réels, choix narratifs, hardware tangible.

---

## 📄 Licence

Projet éducatif et événementiel — tous droits réservés. Contactez l'auteur pour toute réutilisation.
