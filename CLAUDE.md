# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server (localhost:3000, auto-opens)
npm run build     # tsc + Vite production build → dist/
npm run preview   # Preview production build locally
npm run lint      # ESLint with 0 warnings allowed
npm run format    # Prettier
npm run test      # Vitest unit tests
```

## Architecture Overview

**L'Écho du Corbeau** is an interactive forensic audio investigation game. Players load a degraded audio recording, apply signal processing filters to uncover clues, then identify a guilty suspect among four candidates.

### Route Flow

```
/setup → / (login) → /workspace (dashboard) → /suspects → /debrief
```

`RequireAudio` guard in `App.tsx` blocks access to gameplay routes unless `audioUrls` is set in the store.

### Two Core Systems

**1. Audio Processing Pipeline (`src/services/audioEngine.ts`)**

Singleton managing a Web Audio API chain:
```
Source → LPF → HPF → BandPass → Notch → Compressor → Gain → Analyser → Output
```
- WaveSurfer.js handles playback UI; `AudioEngine` attaches to its `HTMLMediaElement` via `connectMediaElement()`
- Disabled filters bypass by setting extreme cutoffs (not disconnected from graph)
- Emits lifecycle events (`initialized`, `connected`, `play`, `pause`, `filterChange`) for decoupled component updates
- Pitch shift is implemented via `playbackRate` (affects both pitch and speed — known HTML5 limitation)

**2. Scenario-Driven Clue System (`src/data/scenarios.ts`)**

Each scenario defines `clueTriggers: ClueDefinition[]` where each clue has a `check()` function that reads store state. Dashboard polls all triggers on every state update and auto-discovers clues. Two scenarios: `corbeau` and `braincity`.

### State Management

Single Zustand store (`src/stores/audioStore.ts`) with persistence middleware:
- **Persisted**: volume, filter presets, pitch shift, playback speed
- **Transient**: audioUrls, clues discovered, mission timer, playback state

Components read store directly via `useAudioStore()`. No computed selectors — components combine slices manually.

### Key Files

| File | Role |
|------|------|
| `src/stores/audioStore.ts` | Single source of truth for all app state |
| `src/services/audioEngine.ts` | Web Audio API singleton |
| `src/data/scenarios.ts` | Narrative data, suspect lists, clue definitions |
| `src/components/Workspace/Dashboard.tsx` | Main gameplay screen |
| `src/utils/audioGenerator.ts` | Synthesizes test audio Blobs via Web Audio API (no pre-recorded files needed) |
| `src/hooks/useAudioControls.ts` | Initializes engine, exposes play/pause/seek/load callbacks |

### Styling & Animation

- Tailwind CSS with a "forensic terminal" dark aesthetic
- Framer Motion `AnimatePresence mode="wait"` for route transitions; `staggerChildren` for multi-element reveals
- Global scanlines overlay and CRT effects in `AppLayout`

### TypeScript Strictness

`noUnusedLocals`, `noUnusedParameters` are enabled and ESLint allows 0 warnings. All types are explicitly defined in `src/types/`. No `any` tolerance.

### PWA

Vite PWA plugin with `registerType: 'autoUpdate'`. Workbox caches all assets (JS, CSS, audio, fonts). Offline indicator in `AppLayout`.
