# Roadmap Technique - L'Écho du Corbeau

## Résumé Exécutif

Application web immersive de criminalistique audio avec interface de police scientifique, traitement du signal en temps réel, et mécaniques d'enquête hybrides (numérique + réel). Stack technique premium: React 18 + TypeScript + Tone.js + Wavesurfer.js, optimisée pour fonctionnement offline sur stand physique. Timeline 3+ mois permettant polish visuel, animations fluides style CRT/terminal rétro, et optimisations de performance poussées.

**Architecture retenue**: Service Layer pattern avec Web Audio API + Tone.js pour traitement audio, Wavesurfer.js pour visualisations, Zustand pour state management, TailwindCSS + Framer Motion pour UI forensics immersive. PWA avec Service Workers pour support offline complet.

---

## Phase 1: Fondations & Architecture (Semaines 1-2)

### 1. Initialiser projet React + TypeScript + Vite

- Créer structure à la racine: `package.json`, `tsconfig.json`, `vite.config.ts`
- Installer dépendances core: `react@18`, `typescript@5`, `vite@5`, `tailwindcss@3`
- Configurer ESLint + Prettier pour code quality
- Créer structure dossiers: `src/{components,hooks,services,stores,types,assets,styles}`

### 2. Setup architecture audio

- Créer service `src/services/audioEngine.ts` - singleton gérant `AudioContext`, routage audio, lifecycle
- Installer `tone@15` + définir wrapper pour effets (filtres, pitch shift)
- Implémenter pattern singleton avec méthodes: `initialize()`, `loadAudio()`, `applyFilter()`, `cleanup()`
- Créer types TypeScript: `AudioState`, `FilterConfig`, `PitchShiftConfig` dans `src/types/audio.ts`

### 3. State management avec Zustand

- Créer store `src/stores/audioStore.ts` pour état audio global
- Définir slices: `playbackState`, `filterSettings`, `analysisProgress`, `suspectData`
- Implémenter persistence localStorage pour recovery après refresh
- Créer hooks custom: `useAudioControls`, `useFilterControls`, `useAnalysisProgress`

### 4. Router & navigation

- Installer `react-router-dom@6`
- Définir routes dans `src/App.tsx`: `/` (auth), `/workspace` (analyse), `/suspects` (comparaison), `/debrief` (résultats)
- Créer composant `src/components/Layout/AppLayout.tsx` avec transitions Framer Motion entre écrans

---

## Phase 2: Traitement Audio Core (Semaines 3-4)

### 5. Implémentation Web Audio API + Tone.js

- Dans `src/services/audioEngine.ts`, créer graph audio: `player → lowpass → highpass → pitchShift → analyzer → destination`
- Implémenter filtres biquad avec Tone.js: `Filter` nodes pour low-pass (cutoff 200-8000 Hz) et high-pass
- Configurer `AnalyserNode` (FFT size 2048) pour extraction données spectrales
- Gérer états: loading, playing, paused, processing avec callbacks/events

### 6. Pitch shifting & demodulation

- Intégrer `Tone.PitchShift` pour manipulation hauteur (-12 à +12 semitones)
- Implémenter ajustement progressif avec `rampTo()` pour transitions smooth
- Créer méthode `audioEngine.ts::applyPitchShift(semitones: number, rampTime: number)`
- Tester qualité audio et ajuster `windowSize` si artefacts

### 7. Système A/B comparison

- Créer deux buffers audio: original (frozen) et processed (avec effets)
- Implémenter toggle dans `src/services/audioEngine.ts::toggleComparison(useProcessed: boolean)` avec crossfade 100ms
- Synchroniser timecode entre deux streams pour playback aligné
- Ajouter indicateurs visuels dans UI pour feedback instant

### 8. Préparation fichiers audio

- Créer enregistrements test: voix claire + version distorted avec bruit, filtres, pitch shift IA
- Optimiser format: MP3 128kbps, durée 20-40 secondes max
- Stocker dans `public/audio/` pour bundling Vite
- Créer manifeste `src/assets/audioManifest.ts` avec métadonnées

---

## Phase 3: Visualisations Audio (Semaines 5-6)

### 9. Intégration Wavesurfer.js

- Installer `wavesurfer.js@7`
- Créer composant `src/components/AudioPlayer/Waveform.tsx`
- Configurer: container ref, waveform color (gradient bleu forensics), responsive width, cursor plugin
- Connecter aux contrôles playback Zustand: play/pause, seek, volume

### 10. Plugin Spectrogram

- Installer `wavesurfer.js/dist/plugins/spectrogram`
- Créer composant `src/components/Visualization/Spectrogram.tsx`
- Configurer FFT 2048, colorMap custom (bleu foncé → cyan → blanc pour fréquences intenses)
- Ajouter labels fréquences, synchroniser avec waveform scrolling

### 11. Visualisations temps réel

- Créer composant `src/components/Visualization/FrequencyBars.tsx` avec Canvas API
- Utiliser `AnalyserNode.getByteFrequencyData()` dans `requestAnimationFrame` loop
- Afficher barres verticales style equalizer avec decay animation smooth
- Optimiser performance avec throttling (max 30 FPS) et `OffscreenCanvas` si dispo

### 12. Indicateurs paramétriques

- Créer widgets affichant valeurs actuelles: fréquence cutoff, pitch shift (Hz/semitones), gain
- Composant `src/components/Controls/ParameterDisplay.tsx` avec animations Framer Motion
- Real-time update via Zustand store subscription

---

## Phase 4: Interface Forensics (Semaines 7-9)

### 13. Écran d'authentification

- Créer `src/components/Auth/LoginScreen.tsx`
- Design: fond sombre `#0a0e27`, logo agence fictive, champ matricule avec effet glow
- Animation d'entrée: scanlines CSS, bruit VHS, typing effect pour texte "ACCÈS RESTREINT"
- Validation côté client, stocker session dans `sessionStorage`

### 14. Dashboard principal (Workspace)

- Créer `src/components/Workspace/Dashboard.tsx`
- Layout: grid fixe (pas de drag-and-drop) avec zones: player (40%), spectrogram (30%), controls (30%)
- Module "Dossier 84-V": `src/components/Workspace/CaseFile.tsx` avec photo d'archive, description crime, timer enquête
- Fond: dégradé sombre, borders cyan glow, police JetBrains Mono

### 15. Contrôles de filtrage

- Composant `src/components/Controls/FilterPanel.tsx`
- Sliders rotary style hardware: `react-input-knob` pour cutoff frequency (visualisation circulaire)
- Toggle buttons low-pass/high-pass avec LED indicators (vert = actif)
- Preset buttons: "Remove AI Mask", "Clarify Voice", "Deep Analysis"
- Debouncing (150ms) pour éviter surcharge processing

### 16. Module pitch/demodulation

- Créer `src/components/Controls/PitchControl.tsx`
- Rotary knob -12 à +12 semitones, affichage Hz/cent
- Bouton "Auto-Detect Pitch" (analyse via API externe ou locale avec `ml5.js`)
- Visual feedback: forme d'onde change couleur selon shift appliqué

### 17. Système de comparaison suspects

- Créer `src/components/Suspects/SuspectGrid.tsx`
- Grid de portraits (photos équipe stand) avec noms, rôles
- Zone notes cliquable: modal pour saisir observations par suspect
- Audio comparison button: rejoue segment voix restaurée en boucle
- Bouton "IDENTIFICATION POSITIVE" protégé (confirmation dialog)

### 18. Écran de résolution

- Composant `src/components/Debrief/ResultScreen.tsx`
- Succès: animation match spectral (overlay 2 spectrogrammes), message "ARRESTATION CONFIRMÉE"
- Échec: message du Corbeau (audio taunt), invitation retry
- Génération certificat PDF/image via `html2canvas` avec QR code vers site projet

### 19. Animations & polish visuel

- Installer `framer-motion@11`
- Transitions entre screens: fade + slide, durée 400ms avec easing custom
- Boutons: hover glow effect (box-shadow cyan), active state avec scale
- Scanlines overlay: pseudo-element CSS avec animation scroll infinie
- Loading states: spinner custom style "processing data..." avec dots animation

---

## Phase 5: Fonctionnement Offline (Semaines 10-11)

### 20. Progressive Web App (PWA)

- Installer `vite-plugin-pwa`
- Créer `public/manifest.json`: nom app, icônes, theme color, display standalone
- Configurer `vite.config.ts`: `registerType: 'autoUpdate'`, `workbox` strategies
- Générer icônes PWA multi-résolutions (192x192, 512x512) dans `public/icons/`

### 21. Service Workers pour cache

- Stratégie: cache-first pour assets (JS, CSS, fonts, images)
- Network-first avec fallback cache pour audio files
- Précache fichiers critiques au premier chargement
- Implémenter update notification: toast "Nouvelle version disponible"

### 22. Gestion offline complète

- Détecter connexion avec `navigator.onLine`
- Afficher badge offline dans UI (coin haut droit)
- Tester: Chrome DevTools → Application → Service Workers, mode offline
- Fallback pour assets externes: police Google Fonts → locale

---

## Phase 6: Optimisations & Performance (Semaines 12-13)

### 23. Code splitting & lazy loading

- Lazy load routes: `const Workspace = lazy(() => import('./components/Workspace/Dashboard'))`
- Split audio engine: charger Tone.js uniquement dans workspace
- Suspense boundaries avec loading fallbacks custom
- Analyser bundle: `npm run build` → vérifier chunks < 200KB

### 24. Memoization & optimisations React

- Wrapper composants lourds avec `React.memo`: Waveform, Spectrogram
- `useMemo` pour calculs FFT data transformations
- `useCallback` pour handlers passés aux children
- React DevTools Profiler: identifier re-renders inutiles

### 25. Web Workers pour traitement

- Créer `src/workers/spectrogramWorker.ts`
- Offload calculs FFT complexes, normalisation données audio
- Communication via `postMessage` avec typed interfaces
- Fallback synchrone si Worker pas supporté (vieux browsers)

### 26. Optimisations audio

- Réduire FFT size si lag: 2048 → 1024 pour machines lentes
- Throttle spectrogram redraws: max 30 FPS avec `requestAnimationFrame`
- Désactiver effets inutilisés: disconnect audio nodes inactifs
- Test performance: Chrome DevTools → Performance, enregistrer session 5 min

### 27. Compression assets

- Images: convertir PNG → WebP (80% quality) avec `sharp` ou `squoosh`
- Audio: vérifier compression MP3 (128kbps optimal pour voix)
- Fonts: subset Google Fonts (Latin uniquement), load async
- Build prod: `vite build` avec minification + tree-shaking

---

## Phase 7: Tests & Debugging (Semaines 14-15)

### 28. Tests navigateurs cross-platform

- Chrome/Edge (Chromium): baseline, devrait tout supporter
- Firefox: tester Web Audio API, vérifier performances spectrogram
- Safari desktop: tester AudioContext resume on interaction, restrictions autoplay
- Safari iOS/iPad: critique pour stand mobile, tester touch controls, audio iOS quirks
- Créer checklist `BROWSER_TESTING.md` avec items à valider

### 29. Tests unitaires audio engine

- Setup Vitest dans `vite.config.ts`
- Tester `src/services/audioEngine.ts`: initialization, filter application, pitch shift
- Mock AudioContext avec `web-audio-test-api`
- Tests `src/services/audioEngine.test.ts`: coverage > 80%

### 30. Tests intégration UI

- Installer `@testing-library/react`
- Tester workflows: auth → workspace → suspect selection → debrief
- Tester interactions: slider change → audio parameter update → visual feedback
- Tests A11y basics: keyboard navigation, ARIA labels

### 31. Testing utilisateur (playtest)

- Inviter 3-5 personnes tester flow complet 5 min
- Observer: blocages UI, incompréhensions, temps réel par étape
- Collecter feedback: formulaire post-test (`feedback.md`)
- Itérer sur UX: simplifier contrôles si confusion, ajouter hints

### 32. Debugging & edge cases

- Tester gestion erreurs: audio file loading fail, corrupted file, browser unsupported
- Implémenter error boundaries React dans `src/components/ErrorBoundary.tsx`
- Logs console: remplacer `console.log` par logger custom (désactivable en prod)
- Monitoring: intégrer Sentry lite ou custom error tracking

---

## Phase 8: Polish Final & Déploiement (Semaines 16+)

### 33. Sound design & assets audio

- Enregistrer sons UI: beeps confirmation, alerts, hover effects
- Background ambiance subtile: hum serveur, ventilation lab (volume bas)
- Transition sounds: swoosh entre écrans
- Utiliser `Tone.Sampler` ou `Howler.js` pour playback léger

### 34. Micro-animations & juice

- Framer Motion variants: buttons pulse on hover, panels slide-in with stagger
- Waveform glow pulse quand audio playing
- Spectrogram scan line animation (vertical line traversant)
- Success animation: particle explosion ou glitch effect sur identification
- Fail animation: écran shake, red flash overlay

### 35. Tooltips & onboarding

- Installer `react-tooltip` ou custom component
- Ajouter hints sur premiers controls: "Ajustez ce filtre pour clarifier la voix"
- Tour guidé optionnel au premier lancement via `react-joyride`
- Skip button visible pour utilisateurs expérimentés

### 36. Accessibilité (A11y)

- Audit Lighthouse: viser score > 90
- ARIA labels sur contrôles audio, sliders
- Keyboard navigation complète: Tab order logique, Enter/Space actions
- Contrast ratio: vérifier texte blanc sur fonds bleus (min 4.5:1)
- Screen reader test basique (NVDA/JAWS)

### 37. Documentation technique

- Créer `README.md`: setup instructions, architecture overview, stack tech
- Documenter services: JSDoc comments dans `audioEngine.ts`
- Créer `ARCHITECTURE.md`: flow diagrams, composants tree, data flow
- Guide déploiement: `DEPLOYMENT.md` avec instructions build/serve offline

### 38. Build production & optimisation finale

- `npm run build` → analyser output (dist folder)
- Vérifier chunks sizes: main < 300KB, vendor < 500KB
- Gzip compression: vérifier server config ou CDN
- Tester build local: `npm run preview`, valider offline mode
- Lighthouse audit: Performance, Accessibility, Best Practices, SEO

### 39. Déploiement stand physique

- Setup machine stand: Raspberry Pi ou laptop dédié
- Script auto-start: lancer browser en kiosk mode (F11) au boot
- Config: désactiver screensaver, sleep mode
- Servir local: `npx serve dist` ou Nginx lite
- Backup plan: USB key avec build static, instructions fallback
- Tester full flow in situ: écran tactile (si applicable), speakers qualité

### 40. Monitoring & maintenance

- Logger analytics basiques: localStorage pour stats (temps par étape, taux succès)
- Exporter données fin journée pour analyse
- Checklist maintenance: vérifier daily au stand (audio OK, browser pas crash)
- Plan update: comment déployer hotfix si bug découvert

---

## Vérification & Tests

### Tests techniques

- Audio playback fluide sans latence (< 50ms response sliders)
- Filtres audibles: LP cutoff 1000Hz doit étouffer aigus, HP 300Hz retirer basses
- Pitch shift ±5 semitones sans artefacts majeurs
- Spectrogram update real-time (< 100ms delay)
- A/B comparison instantané (seamless switch)

### Tests cross-browser

- Chrome/Edge: ✓ Full support attendu
- Firefox: ✓ Valider spectrogram performance
- Safari desktop: ✓ AudioContext resume fix appliqué
- Safari iOS: ✓ Autoplay restrictions contournées (user tap required)

### Tests offline

- Déconnexion réseau → app reste fonctionnelle
- Service Worker cache assets correctement
- Audio files chargés depuis cache

### Tests UX

- Flow complet 5 min réalisable sans blocage
- Identification suspect intuitive
- Feedback visuel clair à chaque action
- Aucune erreur console en usage normal

### Commandes vérification

```bash
# Build & preview
npm run build && npm run preview

# Tests unitaires
npm run test

# Lighthouse audit
npm run build && npx lighthouse http://localhost:4173 --view

# Bundle analysis
npm run build -- --mode analyze
```

### Checklist pré-déploiement

- [ ] Audio test files présents et optimisés
- [ ] PWA manifest configuré avec icônes
- [ ] Service Worker enregistré et fonctionnel
- [ ] Tests navigateurs majeurs passés
- [ ] Performance Lighthouse > 90
- [ ] Offline mode validé
- [ ] Documentation complète (`README.md`, `ARCHITECTURE.md`)
- [ ] Backup build sur USB
- [ ] Machine stand configurée (kiosk mode, auto-start)

---

## Décisions Techniques

### Stack technique

**React + TypeScript (vs Vanilla JS)**

- Justifié par complexité UI multi-modules, state management, maintenabilité long terme
- Votre expertise permet d'exploiter pleinement

**Tone.js (vs Web Audio API pur)**

- Abstractions haut niveau accélèrent dev (filters, pitch shift built-in)
- Qualité suffisante pour projet
- Fallback Web Audio API si limitations

**Wavesurfer.js (vs Canvas custom)**

- Mature, plugin spectrogram intégré, gain temps énorme
- Canvas custom uniquement si besoins performance extrêmes

**Zustand (vs Redux)**

- Plus léger, API simple, moins boilerplate pour projet solo
- Redux overkill ici

**TailwindCSS (vs CSS-in-JS)**

- Rapid prototyping, dark theme facile, bundle optimisé avec purge
- Styled-components alternative si préférence

### Architecture

**Service Layer pattern**

- Sépare logique audio (pure JS) de UI (React)
- Testable indépendamment
- Réutilisable

**PWA + Service Workers**

- Requis pour offline stand physique
- Bonus: installable, performances accrues

### Priorisation features (si retard)

**MVP minimum**

- Playback audio
- Filtres low/high-pass
- Waveform basic
- Suspect selection
- Débrief simple

**Nice-to-have**

- Pitch shift avancé
- Spectrogram haute qualité
- Animations fancy
- Sound design
- Onboarding

**Future**

- ML pitch detection auto
- Comparaison vocale algorithmique (pas manuel)

### Risques identifiés

1. **Safari iOS audio restrictions**
   - Mitigation = tester tôt, fallback play button explicite

2. **Performance spectrogram**
   - Mitigation = throttling, Web Worker, réduction FFT size

3. **Qualité pitch shift**
   - Mitigation = tester Tone.js early, backup plan Soundtouchjs

4. **Timeline dérive**
   - Mitigation = MVP défini, features annexes optionnelles

---

## Stack Recommandé - Résumé

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "tone": "^15.0.0",
    "wavesurfer.js": "^7.0.0",
    "zustand": "^4.5.0",
    "framer-motion": "^11.0.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "typescript": "^5.3.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "tailwindcss": "^3.4.0",
    "vitest": "^1.2.0",
    "@testing-library/react": "^14.0.0",
    "vite-plugin-pwa": "^0.19.0"
  }
}
```

---

## Timeline Visuelle

```
Semaines 1-2   : 🔧 Fondations (React, Vite, Audio Engine, Zustand, Router)
Semaines 3-4   : 🎵 Audio Core (Filtres, Pitch Shift, A/B Comparison)
Semaines 5-6   : 📊 Visualisations (Wavesurfer, Spectrogram, Frequency Bars)
Semaines 7-9   : 🖥️ UI Forensics (Auth, Dashboard, Controls, Suspects, Debrief)
Semaines 10-11 : 📡 Offline Mode (PWA, Service Workers, Cache Strategy)
Semaines 12-13 : ⚡ Performance (Code Splitting, Memoization, Workers, Assets)
Semaines 14-15 : 🧪 Tests (Cross-browser, Unit Tests, UI Tests, Debugging)
Semaines 16+   : ✨ Polish (Sound Design, Animations, A11y, Documentation, Deploy)
```

---

## Notes de Développement

### Conventions de code

- **Composants**: PascalCase (`AudioPlayer.tsx`)
- **Hooks**: camelCase avec préfixe `use` (`useAudioControls.ts`)
- **Services**: camelCase (`audioEngine.ts`)
- **Types**: PascalCase avec suffixe approprié (`AudioState`, `FilterConfig`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_PITCH_SHIFT`)

### Structure de fichiers

```
src/
├── components/          # Composants React
│   ├── Auth/           # Écran authentification
│   ├── Workspace/      # Dashboard principal
│   ├── AudioPlayer/    # Lecteur audio + waveform
│   ├── Visualization/  # Spectrogram, frequency bars
│   ├── Controls/       # Filtres, pitch, paramètres
│   ├── Suspects/       # Grille suspects + comparaison
│   ├── Debrief/        # Écran résultats
│   └── Layout/         # Layout général, error boundary
├── hooks/              # Custom hooks
│   ├── useAudioContext.ts
│   ├── useAudioControls.ts
│   ├── useFilterControls.ts
│   └── useAnalysisProgress.ts
├── services/           # Logique métier
│   ├── audioEngine.ts  # Service audio principal
│   └── audioAnalysis.ts # Analyse FFT, pitch detection
├── stores/             # State management Zustand
│   └── audioStore.ts
├── types/              # TypeScript types/interfaces
│   ├── audio.ts
│   ├── suspects.ts
│   └── navigation.ts
├── assets/             # Assets statiques
│   ├── audioManifest.ts
│   └── images/
├── styles/             # Styles globaux
│   └── globals.css
├── workers/            # Web Workers
│   └── spectrogramWorker.ts
├── App.tsx             # Root component
└── main.tsx            # Entry point

public/
├── audio/              # Fichiers audio
├── icons/              # PWA icons
└── manifest.json       # PWA manifest
```

### Git workflow suggéré

- `main`: branch production, toujours stable
- `develop`: branch développement actif
- `feature/*`: branches features individuelles
- Commits conventionnels: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`

### Ressources utiles

- [Web Audio API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Tone.js Documentation](https://tonejs.github.io/)
- [Wavesurfer.js Examples](https://wavesurfer-js.org/examples/)
- [React + TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TailwindCSS Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [Framer Motion API](https://www.framer.com/motion/)

---

Cette roadmap est un document vivant - n'hésitez pas à l'adapter selon vos découvertes et contraintes pendant le développement. Bon code! 🚀
