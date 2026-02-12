# L'Écho du Corbeau - Dossier 84-V

Application web immersive de criminalistique audio avec interface de police scientifique, traitement du signal en temps réel, et mécaniques d'enquête hybrides.

## 🎯 Stack Technique

- **Frontend**: React 18 + TypeScript 5
- **Build**: Vite 5
- **Styling**: TailwindCSS 3 + Framer Motion 11
- **Audio**: Web Audio API + Tone.js 15 + Wavesurfer.js 7
- **State**: Zustand 4
- **Router**: React Router 6
- **PWA**: Service Workers (offline support)

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Build production
npm run build

# Preview build
npm run preview
```

## 📁 Structure du Projet

```
src/
├── components/          # Composants React
│   ├── Auth/           # Authentification
│   ├── Workspace/      # Dashboard principal
│   ├── Suspects/       # Grille suspects
│   ├── Debrief/        # Écran résultats
│   └── Layout/         # Layout général
├── hooks/              # Custom hooks
├── services/           # Logique métier (audioEngine)
├── stores/             # State management Zustand
├── types/              # TypeScript types
└── styles/             # Styles globaux
```

## 🎵 Features Audio

- ✅ Playback audio avec Web Audio API
- ✅ Filtres low-pass/high-pass en temps réel
- ✅ Pitch shifting (-12 à +12 semitones)
- ✅ Analyse spectrale (FFT)
- ✅ Mode comparaison A/B

## 🎨 Design

- Interface style forensics (bleu cyan, fond sombre)
- Animations Framer Motion
- Effets CRT/scanlines
- Police monospace (JetBrains Mono)

## 📱 Support Offline

L'application fonctionne complètement offline grâce aux Service Workers et PWA.

## 🔧 Développement

### Phase actuelle: Phase 1 - Fondations ✅

- [x] Setup React + TypeScript + Vite
- [x] Architecture audio (audioEngine service)
- [x] State management (Zustand)
- [x] Router & navigation
- [x] Login screen

### Phases suivantes

- Phase 2: Traitement Audio Core
- Phase 3: Visualisations Audio
- Phase 4: Interface Forensics complète
- Phase 5: Fonctionnement Offline (PWA)
- Phase 6: Optimisations & Performance
- Phase 7: Tests & Debugging
- Phase 8: Polish Final & Déploiement

## 📝 Scripts

- `npm run dev` - Lancer serveur de développement
- `npm run build` - Build production
- `npm run preview` - Preview build
- `npm run lint` - Linter ESLint
- `npm run format` - Formatter avec Prettier
- `npm run test` - Tests unitaires (Vitest)

## 🌐 Navigateurs supportés

- Chrome/Edge (Chromium) ✅
- Firefox ✅
- Safari desktop ✅
- Safari iOS/iPad ⚠️ (restrictions audio)

## 📄 Licence

Projet éducatif - Tous droits réservés

## 👥 Auteur

Développé dans le cadre d'une installation interactive immersive.
