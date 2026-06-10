# 🎙️ Audio Investigation Game

> **Application web immersive de criminalistique audio** — le joueur reçoit un enregistrement dégradé, applique des filtres en temps réel pour révéler des indices sonores, identifie le coupable parmi quatre suspects, et se voit jugé par une mise en scène cinématique.

Conçu pour le **festival [Crime & Science 2026](https://www.crimeetscience.com/)** — Pôle Phoenix, Pleumeur-Bodou (28 – 31 mai 2026).

![Built with React](https://img.shields.io/badge/React-18-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite)
![Web Audio API](https://img.shields.io/badge/Web%20Audio-API-ff6b6b)
![Stream Deck+](https://img.shields.io/badge/Stream%20Deck%2B-WebHID-000000?logo=elgato)
![PWA](https://img.shields.io/badge/PWA-offline-5a0fc8)

---

## ✨ Le projet en une minute

Deux **scénarios narratifs** au choix, chacun avec sa propre identité visuelle, sa narration, ses indices et son rythme :

| Scénario                            | Public         | Univers                                                                                        | Mission                                                       |
| ----------------------------------- | -------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| **🦅 L'Écho du Corbeau** (Quissoux) | Adulte         | Forensique noir / cyan, terminal de police scientifique, esthétique « dossier classifié SRIS » | Décoder un appel anonyme, démasquer un ravisseur d'enfant     |
| **🧠 Brain City**                   | Enfants / ados | Cartoon kid-tech, jaune / teal / coral, mascotte « Ricardo Pouleto » la poule inspectrice      | Aider Ricardo à confondre l'agresseur de Ballerina Cappuccina |

Le moteur audio, l'UX cœur et les contrôles physiques sont **les mêmes**. Seules la narration, les visuels, les seuils de détection et les écrans de fin changent. **Architecture entièrement data-driven** : ajouter un scénario = ajouter un objet dans `src/data/scenarios.ts`.

---

## 🧭 Flow joueur (de l'arrivée à la sortie)

```
   /              ★ Choix du mode (split-screen Quissoux ↔ Brain City)
   │              → set du scenario dans le store
   ▼
   /intro         Intro adaptée au scénario
   │              · Corbeau : cinématique d'acquisition de signal (2 phases animées,
   │                bandes pulsantes, « LE SON EST LA CLÉ »)
   │              · Brain City : page colorée avec sticker Ricardo, 3 cartes concept
   │                (Écoute / Outils / Démasque), bouton « 🚀 JE SUIS PRÊT ! »
   ▼
   /setup         Chargement audio (AudioLoadingScreen)
   │              · Téléchargement + reverse de la piste distordue
   │              · Affichage adapté au scénario (Ricardo pensif / bandes cyan)
   │              · Délai minimum 2,2 s pour l'animation
   ▼
   /login         Saisie du prénom / matricule de l'agent (RequireAudio)
   ▼
   /briefing      Briefing du commissaire en plusieurs étapes
   │              · Découpage paragraphe par paragraphe (Suivant → / 1·2·3 / final)
   │              · Bannière « scène de crime » côté Brain City (Ricardo + Ballerina)
   ▼
   /workspace     ★ Écran principal — analyse, filtres, indices, Stream Deck
   │              · Layout h-screen sans scroll de page (cible Steam Deck 1280×800)
   │              · Colonnes scrollables indépendantes si nécessaire
   ▼
   /suspects      Grille des 4 suspects, écoute comparée, accusation
   │              · Modal de confirmation
   │              · Brain City : animation d'accusation 3 s (voir ci-dessous)
   ▼
   /debrief       Verdict (uniquement côté Corbeau)
                  · Rapport « SRIS » classifié, sobre, sans emoji
                  · Côté Brain City : court-circuité, l'overlay d'accusation gère
                    la page de félicitations et le retry
```

Les routes de gameplay sont protégées par le composant `RequireAudio` ([`App.tsx`](src/App.tsx)) qui redirige vers `/` tant que les fichiers audio ne sont pas chargés.

---

## 🎬 La mise en scène (animation d'accusation Brain City)

Le moment fort du jeu — l'accusation d'un suspect — est traité comme une **scène cinématique** côté Brain City, jouée en deux phases :

**Phase 1 — Analyse (≈ 1,2 s)** : Ricardo _thinking_ au centre, oscillation subtile, texte **« ANALYSE… »** en mustard. Aucune information sur le résultat — le suspense est total.

**Phase 2 — Verdict (≈ 1,8 s)** :

- ✅ **Bonne réponse** : la photo du suspect apparaît, les **barreaux de prison tombent du haut** avec stagger (effet ressort), puis Ricardo _triumphant_ surgit en bas avec **« BIEN JOUÉ ! »** en teal.
- ❌ **Mauvaise réponse** : Ricardo _scared_ secoué de droite à gauche, **« PAS LUI… »** en corail, **aucun barreau** (le suspect n'est pas mis en prison), petit message « On retente ! ».

**Phase 3 — Après le verdict** :

- Succès → **page de félicitations dédiée** : confettis, photo du coupable + Ricardo, message héroïque (« Ballerina Cappuccina est sauvée ! »), bouton **« 🏠 QUITTER LA PARTIE »**.
- Échec → **fermeture automatique** de l'overlay, suspect désincriminé, retour à la grille pour retenter — aucun bouton à chercher, aucune friction.

Côté Corbeau, la transition est **immédiate** (1 s) pour respecter le ton mature ; le rapport SRIS prend ensuite le relais.

---

## 📋 Le rapport SRIS (debrief Corbeau)

Pour le scénario adulte, le verdict est livré sous la forme d'un **rapport classifié** plutôt qu'un écran de victoire ludique :

- Status bar : `[CLASSIFIÉ — TOP SECRET]` + identifiant de dossier dynamique (`SRIS-COR-2026-XXXX`) + horodatage réel
- Verdict encadré : `[ IDENTIFICATION POSITIVE ]` ou `[ IDENTIFICATION NÉGATIVE ]`
- `§ 1 — Empreinte technique` : tableau correspondance vocale / signature spectrale / indices recueillis / corrections appliquées (pitch, LP, HP, inversion) / durée d'enquête
- `§ 2 — Conclusion d'enquête` : récit narratif du scénario
- Signature « Agent V. » + référent SRIS + mention `// Fin de rapport //`
- Boutons sobres : `Nouvelle tentative` / `Clore le dossier`

**Zéro emoji, zéro animation criarde** — cohérent avec l'ambiance forensique adulte.

---

## 🎛️ Stream Deck+ physique (WebHID)

L'application pilote en **WebHID** un [Elgato Stream Deck+](https://www.elgato.com/fr/fr/p/stream-deck-plus-black) — 7 touches LCD, 4 encodeurs rotatifs et un écran tactile horizontal — pour transformer le poste joueur en **vraie console d'analyse forensique**.

- **7 boutons filtres** : Lecture, Inverse, Graves, Aigus, Voix, Buzz, Murmure
- **4 encodeurs** : Volume, fréquence Low-pass, fréquence High-pass, Pitch (–12 → +12 ST). Pitch remplacé par « Tortue » (vitesse de lecture) en mode Brain City.
- **Push-encoder** : reset rapide / mute / toggle filtre
- **Accélération rotation** ×9 sur rotation rapide (< 30 ms entre events) pour balayer 20 kHz à la vitesse du geste
- **LCD strip** affiche en temps réel chaque potentiomètre avec barre de progression et unité (Hz, st, ×)
- **Skin Brain City** automatique : labels remplacés par des emojis (🐘 ELEPH, 🐝 ABEILL, 🤖 ROBOT, 🧹 BALAI, 🔎 LOUPE, 🔄 REVERS)
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

- **5 filtres biquad** indépendants, désactivés en restant _dans le graphe_ (réglés en `allpass` ou cutoff extrême)
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

- **Corbeau** : 7 indices (filtres, pitch, masque, inversion, fréquence vocale, etc.)
- **Brain City** : 7 indices ludiques (sons ambiants, voix isolée, message inversé…). Les étoiles ⭐ du header se remplissent en temps réel.

Brain City ajoute une fonction `proximity(state) => 0..1` permettant à Ricardo Pouleto de réagir vocalement : _« Chaud chaud ! Tu y es presque ! »_ à mesure que le joueur s'approche du bon réglage.

---

## 🎨 Choix de design et UX

### Deux univers disjoints, assumés

Pas de compromis visuel entre les deux scénarios. Chaque univers a sa propre palette, sa propre typographie, ses propres icônes — ils ne se mélangent jamais. Le **choix du mode arrive en tout premier** (avant l'intro) pour que tout le reste du parcours soit déjà à la charte.

|             | Corbeau (adulte)                  | Brain City (enfants/ados)          |
| ----------- | --------------------------------- | ---------------------------------- |
| Fond        | `#060810` (presque noir)          | `#FFF9EC` (crème)                  |
| Typographie | Monospace + bold                  | Bangers + Fredoka                  |
| Accents     | Cyan `#00d4ff`                    | Corail / Mustard / Teal / Blue     |
| Décor       | Scanlines CRT, grille blueprint   | Pois, blobs lumineux, vignettes BD |
| Ton         | Sec, technique, dossier classifié | Vif, narratif, dessin animé        |

### Workspace sans scroll de page

Cible : **Steam Deck 1280 × 800**. Le Dashboard utilise un layout `h-screen flex flex-col` avec deux colonnes en `overflow-y-auto` indépendantes — **jamais de scroll global**. Le header (J'Accuse, étoiles, timer) reste toujours visible.

Côté Brain City, plusieurs sections jugées superflues pour le public jeune sont masquées (FrequencyBars, AudioMeter, grille d'indices détaillée, gros bouton J'Accuse du bas — déjà présent dans le header). Côté Corbeau, le rapport complet est conservé.

### Briefing en plusieurs étapes

Le message du commissaire (3 paragraphes) est désormais découpé : **un paragraphe à la fois**, bouton « Suivant → » entre chaque, indicateur de progression `1 / 3`, dernier bouton transformé en CTA d'action (`C'EST COMPRIS !` / `ACCEPTER LA MISSION`). Évite le mur de texte.

### Bouton « Quitter la partie » global

Un bouton de sortie clair côté Brain City (page de félicitations) et côté Corbeau (rapport SRIS) déclenche un `reset()` complet du store + retour au choix de mode (`/`). Aucun résidu de partie ne survit.

---

## 🛠️ Stack technique

| Domaine         | Technologies                                                                          |
| --------------- | ------------------------------------------------------------------------------------- |
| **Frontend**    | React 18, TypeScript 5 strict (`noUnusedLocals`, ESLint 0 warning)                    |
| **Build / dev** | Vite 5, ESLint, Prettier, Vitest, Testing Library                                     |
| **State**       | Zustand 4 + middleware `persist` (volume, filtres, pitch, notes)                      |
| **Audio**       | Web Audio API native, Tone.js 15 (unlock context), Wavesurfer.js 7 (UI playback)      |
| **Animations**  | Framer Motion 11 (transitions de routes, stagger, springs, AnimatePresence)           |
| **Hardware**    | `@elgato-stream-deck/webhid` 7 (WebHID — Chrome / Edge)                               |
| **Onboarding**  | React Joyride 3 (tour interactif workspace)                                           |
| **Style**       | TailwindCSS 3, deux thèmes (forensique sombre + bento kid-tech)                       |
| **PWA**         | `vite-plugin-pwa`, Workbox `autoUpdate`, fonctionnement 100 % offline une fois chargé |

---

## 📁 Architecture

```
src/
├── App.tsx                              Routes + lazy-loading + RequireAudio
├── main.tsx                             Entry + service worker
├── stores/
│   └── audioStore.ts                    Zustand — source de vérité unique (persistée)
├── services/
│   ├── audioEngine.ts                   Singleton Web Audio API
│   ├── audioAnalysis.ts                 FFT helpers
│   ├── filterActions.ts                 Bridge store ↔ engine
│   └── streamdeck/                      Intégration WebHID Elgato
│       ├── StreamDeckService.ts             Orchestrateur principal
│       ├── StreamDeckSuspectService.ts      Service dédié à la grille suspects
│       ├── streamDeckMappings.ts            Boutons + encodeurs (data-driven)
│       ├── streamDeckCommands.ts            Dispatch des actions
│       ├── streamDeckDisplay.ts             Rendu LCD
│       └── streamDeckConnector.ts           WebHID handshake
├── data/
│   └── scenarios.ts                     Narration, suspects, indices, briefs (data-driven)
├── components/
│   ├── Intro/
│   │   ├── ModeSelectScreen.tsx         ★ Choix du mode (premier écran, split-screen)
│   │   └── IntroScreen.tsx              Intro adaptée selon scénario
│   ├── Auth/
│   │   ├── LoginScreen.tsx              Saisie identité agent
│   │   └── StoryBriefScreen.tsx         Briefing du commissaire en étapes
│   ├── AudioPlayer/
│   │   ├── AudioLoadingScreen.tsx       Chargement audio post-intro
│   │   └── Waveform.tsx                 Wavesurfer.js
│   ├── Workspace/
│   │   ├── Dashboard.tsx                ★ Écran principal de jeu (h-screen, no-scroll)
│   │   └── WorkspaceTour.tsx            Tour interactif Joyride
│   ├── Controls/                        Filter panel, pitch, params
│   ├── Visualization/                   Spectrogram, FrequencyBars, AudioMeter
│   ├── Suspects/
│   │   ├── SuspectGrid.tsx              Grille 4 suspects + popup notes
│   │   └── AccusationOverlay.tsx        ★ Animation cinématique d'accusation (BC)
│   ├── BrainCity/                       RicardoBubble, RicardoEventModal, KidsToolPanel
│   ├── StreamDeck/                      Statut connexion + suspect panel
│   ├── Debrief/
│   │   └── ResultScreen.tsx             Rapport SRIS (Corbeau uniquement)
│   └── Layout/                          AppLayout, ErrorBoundary, Offline, Loading, Spinner
├── hooks/                               useAudioControls, useABComparison, useFilterControls,
│                                        useRicardo, useStreamDeck, useScenarioTheme…
├── utils/
│   ├── audioGenerator.ts                Synthèse + reverse de Blobs
│   └── tourState.ts                     Persistance du tour Joyride
└── types/                               audio, suspects, navigation
```

**Principe directeur** : _many small files > few large files_. Chaque hook, service, mapping est isolé pour rester testable et remplaçable.

---

## 🎼 Fichiers audio embarqués

| Fichier                                                                          | Usage                                              | Scénario   |
| -------------------------------------------------------------------------------- | -------------------------------------------------- | ---------- |
| `voixModifie.mp3`                                                                | Pièce à conviction (voix distordue à reconstituer) | Corbeau    |
| `voix_theo.m4a` `voix_robin.m4a` `voix_juliette.m4a` `voix_yanis.m4a`            | Voix des 4 suspects                                | Corbeau    |
| `Sahur_Voice Changer.mp3`                                                        | Pièce à conviction (voix sabotée par Larry)        | Brain City |
| `BrrBrrPatapim.wav` `Chimpanzinibananini.wav` `Tralalerotralala.wav` `Sahur.wav` | Voix des 4 suspects                                | Brain City |
| `chantPoule.wav` `pouleAgace.wav` `pouleApeure.wav` `pouleBouche.wav`            | Réactions vocales de Ricardo Pouleto               | Brain City |

L'inversion (`evidenceReverse`) est calculée à la volée à partir du blob distordu lors du chargement (`AudioLoadingScreen`).

---

## 🖼️ Assets visuels clés

- `public/images/inspecteur/Ricardo_Pouleto_*.png` — sticker + 6 émotions (`neutral`, `thinking`, `triumphant`, `scared`, `excited`, `panicking`) utilisées par `RicardoBubble`, l'animation d'accusation et la page de félicitations.
- `public/images/crime_scene.png` — Ricardo + Ballerina blessée, **bannière du briefing Brain City** (object-contain pour ne pas cropper).
- `public/images/balerina_outch.png` — disponible (chargée si besoin).
- `public/images/suspects/*.png` — portraits des 4 suspects (par scénario).

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

| Phase                                                   | Statut |
| ------------------------------------------------------- | ------ |
| Setup React / TS / Vite                                 | ✅     |
| Pipeline Web Audio (5 filtres + compresseur + analyser) | ✅     |
| Visualisations (waveform, spectrogramme, FFT, meter)    | ✅     |
| Deux scénarios complets (Corbeau + Brain City)          | ✅     |
| Flow choix-de-mode → intro adaptée → chargement → login | ✅     |
| Stream Deck+ WebHID — Filtres + LCD                     | ✅     |
| Stream Deck dédiée à la grille suspects                 | ✅     |
| Animation cinématique d'accusation (Brain City)         | ✅     |
| Page de félicitations dédiée (Brain City)               | ✅     |
| Rapport SRIS classifié (Corbeau)                        | ✅     |
| Briefing du commissaire en étapes                       | ✅     |
| Workspace sans scroll de page (Steam Deck 1280×800)     | ✅     |
| Onboarding + tour Joyride                               | ✅     |
| PWA / offline                                           | ✅     |
| Tests Vitest (composants + hooks Brain City)            | ✅     |
| Polish festival (Crime & Science, mai 2026)             | ✅     |

---

## 🌐 Compatibilité navigateurs

| Navigateur                      | Audio                 | Stream Deck+ (WebHID) |
| ------------------------------- | --------------------- | --------------------- |
| Chrome / Edge / Brave (desktop) | ✅                    | ✅                    |
| Firefox desktop                 | ✅                    | ❌ (pas de WebHID)    |
| Safari desktop                  | ✅                    | ❌                    |
| iOS / iPadOS                    | ⚠️ restrictions audio | ❌                    |

Pour le festival, l'environnement de référence est **Chrome desktop** et aussi Steam Deck.

---

## 🎓 Contexte

Projet réalisé dans le cadre d'une **installation interactive immersive** pour le festival **[Crime & Science 2026](https://www.crimeetscience.com/)**, qui se tient au **Pôle Phoenix de Pleumeur-Bodou** du **28 au 31 mai 2026**.

L'objectif fixé par l'évènement : _« rétablir la réalité de la police scientifique par rapport aux fantasmes véhiculés par les œuvres de fiction populaires, considérer l'investigation policière depuis l'exploration de la scène de crime jusqu'aux différents laboratoires & compétences mobilisés, sensibiliser un large public à la diversité des métiers de la PTS, et susciter l'envie auprès des jeunes de s'orienter vers ces formations. »_

D'où le double scénario (adulte + enfants/ados), le choix d'un dispositif tangible (Stream Deck+) qui prolonge la métaphore du « poste d'analyste », et l'attention portée à la médiation : briefing pédagogique, indices auto-révélés, mascotte expressive pour le public jeune, rapport SRIS contextualisé pour le public adulte.

---

## 📄 Licence

Projet éducatif et événementiel — tous droits réservés. Contactez l'auteur pour toute réutilisation.
