# Ricardo Companion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Ricardo Pouleto from a static hint bubble into a fully reactive investigation companion — reacting to every player action in real-time, guiding the story, and triggering dramatic pop-ups for key moments.

**Architecture:** A central `useRicardo()` hook observes the Zustand store and computes Ricardo's state (message, emotion, event flag) using a priority system. Two components consume this state: the enriched `RicardoBubble` (daily companion) and the new `RicardoEventModal` (dramatic pop-ups). All Ricardo logic lives in the hook — components are purely presentational.

**Tech Stack:** React, Zustand, Framer Motion, Vitest, @testing-library/react

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/data/scenarios.ts` | Modify | Add `ricardoLines`, `proximity` to `ClueDefinition` and `ScenarioData` |
| `src/hooks/useRicardo.ts` | Create | Central Ricardo intelligence hook |
| `src/hooks/useRicardo.test.ts` | Create | Tests for priority system |
| `src/components/BrainCity/RicardoBubble.tsx` | Modify | Add `emotion` prop + emotion-based images |
| `src/components/BrainCity/RicardoBubble.test.tsx` | Modify | Tests for emotion rendering |
| `src/components/BrainCity/RicardoEventModal.tsx` | Create | Dramatic pop-up component |
| `src/components/BrainCity/RicardoEventModal.test.tsx` | Create | Tests for modal behaviour |
| `src/components/Workspace/Dashboard.tsx` | Modify | Wire `useRicardo`, mount `RicardoEventModal` |
| `src/components/AudioPlayer/AudioSetup.tsx` | Modify | Add Ricardo briefing block |
| `src/components/Suspects/SuspectGrid.tsx` | Modify | Ricardo bar + hover suspect comments |

---

## Task 1: Extend `scenarios.ts` — types + Brain City data

**Files:**
- Modify: `src/data/scenarios.ts`

- [ ] **Step 1: Add `proximity` to `ClueDefinition` and `ricardoLines` + `RicardoLines` to `ScenarioData`**

Open `src/data/scenarios.ts`. Add after the existing `ClueDefinition` interface:

```ts
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
```

Update `ClueDefinition` to add optional `proximity`:

```ts
export interface ClueDefinition {
  id: string;
  label: string;
  hint: string;
  ricardoHint?: string;
  proximity?: (s: {
    lowPassFilter: { enabled: boolean; frequency: number };
    highPassFilter: { enabled: boolean; frequency: number };
    pitchShift: { semitones: number };
    isReversed: boolean;
    bandPassFilter: { enabled: boolean; frequency: number };
    notchFilter: { enabled: boolean; frequency: number };
    compressor: { enabled: boolean };
    playbackSpeed: number;
  }) => number;
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
```

Update `ScenarioData` to add optional `ricardoLines`:

```ts
export interface ScenarioData {
  // ...existing fields...
  ricardoLines?: RicardoLines;
}
```

- [ ] **Step 2: Add `ricardoLines` to the Brain City scenario constant**

Find the `BRAIN_CITY` constant and add `ricardoLines` before the closing `}`:

```ts
  ricardoLines: {
    setup: "Salut l'équipe ! On a un gros problème à Brain City. Un enregistrement compromis par Larry… et un agresseur qui court toujours dans les rues ! Je compte sur vous pour l'analyser. Prêts à mener l'enquête ?",
    play: "Ouvre bien tes oreilles, l'enregistrement commence ! Il y a des sons bizarres là-dedans…",
    filters: {
      lowPass: "J'entends quelque chose de grave et sourd… des bruits de chantier peut-être ?",
      highPass: "Ah, les graves disparaissent ! La voix ressort beaucoup mieux maintenant…",
      bandPass: "On se concentre sur les médiums… j'entends comme un sifflement étrange !",
      notch: "Ce buzz électrique agaçant… le filtre coupe-bande devrait l'éliminer !",
      compressor: "Le compresseur amplifie les sons faibles… chut, j'entends des chuchotements !",
      reverse: "L'audio à l'envers ! Larry a peut-être caché un message secret là-dedans…",
    },
    hot: "Chaud chaud ! Bouge encore un peu ce curseur, on approche quelque chose !",
    veryHot: "TRÈS CHAUD !! Encore un tout petit peu… on y est presque !!",
    suspectComments: {
      'suspect-bc-2': "BrrBrr Patapim… ce sifflement asthmatique et cette voix grave dans l'enregistrement… Cot-cot, j'ai un très mauvais pressentiment sur celui-là !",
      'suspect-bc-3': "Chimpanzani Banana ? Il était en train de manger des bananes… mais son profil vocal ne correspond pas du tout.",
      'suspect-bc-4': "Tralalero Tralala ? Il faisait du jogging avec ses Nike… sa voix est bien trop douce comparée à l'enregistrement.",
      'suspect-bc-5': "Tung Tung Tung ? Il balayait le trottoir toute la matinée… aucun indice sonore ne pointe vers lui.",
    },
    allCluesFound: "INCROYABLE ! On a trouvé tous les indices ! Je suis certain de savoir qui c'est. Vas-y, accuse-le !",
    correctSuspect: "BRAVO ! Je savais qu'on y arriverait ensemble ! Cot-cot-COT ! Brain City est sauvée grâce à toi ! 🎉",
    wrongSuspect: "Oh non… ce n'est pas lui. J'aurais dû insister davantage sur les indices sonores. On recommence ?",
  },
```

- [ ] **Step 3: Add `proximity` functions to each Brain City clue**

For each clue in `BRAIN_CITY.clueTriggers`, add the `proximity` function below `ricardoHint`. Replace the 8 clue objects with:

```ts
    {
      id: 'cles-chantier',
      label: 'Cliquetis de clés détecté',
      hint: 'Low-pass entre 300–2 000 Hz',
      ricardoHint: "Active le filtre passe-bas et règle-le vers 1000 Hz — j'entends comme des clés de chantier !",
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
      label: "Voix de l'agresseur isolée",
      hint: 'High-pass entre 80–400 Hz',
      ricardoHint: "Active le filtre passe-haut vers 200 Hz — il faut couper les graves pour isoler la voix !",
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
      hint: 'Band-pass entre 400–1 500 Hz',
      ricardoHint: "Essaie le filtre passe-bande vers 800 Hz — il y a un drôle de sifflement caché là-dedans !",
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
      hint: 'Notch entre 40–80 Hz',
      ricardoHint: "Utilise le filtre coupe-bande (notch) vers 60 Hz — il y a un buzz électrique qui cache des bruits !",
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
      hint: 'Pitch entre -6 et -2 ST',
      ricardoHint: "Baisse le pitch de 3 ou 4 crans — la voix a été rendue trop aiguë pour cacher l'identité de l'agresseur !",
      proximity: (s) => {
        const p = s.pitchShift.semitones;
        if (p >= -6 && p <= -2) return 1;
        if (p > -2) return Math.max(0, 1 - (p + 2) / 6);
        return Math.max(0, 1 - (-6 - p) / 6);
      },
      check: (s) => s.pitchShift.semitones >= -6 && s.pitchShift.semitones <= -2,
    },
    {
      id: 'message-larry',
      label: 'Message de Larry décodé',
      hint: 'Reverse activé',
      ricardoHint: "Clique sur le bouton Inverser — Larry a caché un message à l'envers dans l'enregistrement !",
      proximity: (s) => (s.isReversed ? 1 : 0),
      check: (s) => s.isReversed,
    },
    {
      id: 'chuchotement-agr',
      label: 'Menaces amplifiées',
      hint: 'Compresseur activé',
      ricardoHint: "Active le compresseur — il y a des chuchotements trop faibles pour être entendus normalement !",
      proximity: (s) => (s.compressor.enabled ? 1 : 0),
      check: (s) => s.compressor.enabled,
    },
    {
      id: 'ralenti-agr',
      label: 'Accent industriel confirmé',
      hint: 'Vitesse ≤ 0.75×',
      ricardoHint: "Mets la vitesse à 0.7 — l'accent du quartier industriel ressort bien mieux au ralenti !",
      proximity: (s) => {
        if (s.playbackSpeed <= 0.75) return 1;
        return Math.max(0, 1 - (s.playbackSpeed - 0.75) / 0.5);
      },
      check: (s) => s.playbackSpeed <= 0.75,
    },
```

- [ ] **Step 4: Verify build passes**

```bash
npm run build
```

Expected: `✓ built in X.XXs` with no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/data/scenarios.ts
git commit -m "feat: add ricardoLines, proximity and RicardoLines type to scenarios"
```

---

## Task 2: Create `useRicardo` hook

**Files:**
- Create: `src/hooks/useRicardo.ts`
- Create: `src/hooks/useRicardo.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/hooks/useRicardo.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRicardo } from './useRicardo';
import { useAudioStore } from '@/stores/audioStore';

describe('useRicardo', () => {
  beforeEach(() => {
    localStorage.removeItem('audio-storage');
    useAudioStore.getState().reset();
    useAudioStore.getState().setScenario('braincity');
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns neutral emotion and first hint when idle', () => {
    const { result } = renderHook(() => useRicardo());
    expect(result.current.emotion).toBe('neutral');
    expect(result.current.isEvent).toBe(false);
    expect(result.current.message).toContain('passe-bas');
  });

  it('returns thinking emotion when a filter is activated', () => {
    const { result } = renderHook(() => useRicardo());
    act(() => {
      useAudioStore.getState().setLowPassFilter({ enabled: true, frequency: 1000 });
    });
    expect(result.current.emotion).toBe('thinking');
    expect(result.current.message).toContain('chantier');
  });

  it('returns excited emotion when proximity > 0.6', () => {
    const { result } = renderHook(() => useRicardo());
    // pitch at 0 is distant from [-6,-2], then approach it
    act(() => {
      useAudioStore.getState().setPitchShift({ semitones: -1 });
    });
    // proximity = 1 - ((-1+2)/6) = 1 - 0.167 = 0.83 → very hot
    expect(result.current.emotion).toBe('excited');
    expect(result.current.message).toContain('CHAUD');
  });

  it('returns triumphant isEvent when a clue is discovered', async () => {
    const { result } = renderHook(() => useRicardo());
    act(() => {
      useAudioStore.getState().addClue('cles-chantier');
    });
    expect(result.current.emotion).toBe('triumphant');
    expect(result.current.isEvent).toBe(true);
    expect(result.current.eventTitle).toBe('INDICE TROUVÉ !');
  });

  it('event clears after 2500ms', async () => {
    const { result } = renderHook(() => useRicardo());
    act(() => {
      useAudioStore.getState().addClue('cles-chantier');
    });
    expect(result.current.isEvent).toBe(true);
    act(() => {
      vi.advanceTimersByTime(2500);
    });
    expect(result.current.isEvent).toBe(false);
  });

  it('timer panicking takes priority over hint', () => {
    const { result } = renderHook(() => useRicardo(25));
    expect(result.current.emotion).toBe('panicking');
    expect(result.current.isEvent).toBe(true);
  });

  it('does not panic when timeLeft is null', () => {
    const { result } = renderHook(() => useRicardo(null));
    expect(result.current.emotion).toBe('neutral');
  });

  it('returns chant sound and triumphant when all clues found', () => {
    const { result } = renderHook(() => useRicardo());
    const allClues = ['cles-chantier', 'voix-agr', 'sifflement', 'buzz-elec', 'pitch-agr', 'message-larry', 'chuchotement-agr', 'ralenti-agr'];
    act(() => {
      allClues.forEach(id => useAudioStore.getState().addClue(id));
    });
    // Let the event timer expire
    act(() => { vi.advanceTimersByTime(2500); });
    expect(result.current.emotion).toBe('triumphant');
    expect(result.current.soundKey).toBe('chant');
    expect(result.current.message).toContain('tous les indices');
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm run test -- useRicardo
```

Expected: errors about missing module `./useRicardo`.

- [ ] **Step 3: Create `src/hooks/useRicardo.ts`**

```ts
import { useState, useEffect, useRef } from 'react';
import { useAudioStore } from '@/stores/audioStore';
import { getScenario } from '@/data/scenarios';

export type RicardoEmotion = 'neutral' | 'excited' | 'thinking' | 'panicking' | 'triumphant' | 'scared';
export type RicardoSound = 'bouche' | 'chant' | 'apeure' | 'agace';

export interface RicardoState {
  message: string;
  emotion: RicardoEmotion;
  isEvent: boolean;
  soundKey: RicardoSound;
  eventTitle?: string;
  dismissEvent: () => void;
}

const FILTER_KEYS = ['lowPass', 'highPass', 'bandPass', 'notch', 'compressor', 'reverse'] as const;
type FilterKey = typeof FILTER_KEYS[number];

export function useRicardo(timeLeft?: number | null): RicardoState {
  const store = useAudioStore();
  const {
    scenario: scenarioId,
    discoveredClues,
    isPlaying,
    lowPassFilter,
    highPassFilter,
    bandPassFilter,
    notchFilter,
    compressor,
    isReversed,
  } = store;

  const scenario = getScenario(scenarioId);
  const { clueTriggers, ricardoLines } = scenario;

  // ── Event: new clue discovered ──────────────────────────────────
  const [eventClue, setEventClue] = useState<string | null>(null);
  const prevClueCount = useRef(discoveredClues.length);

  useEffect(() => {
    if (discoveredClues.length > prevClueCount.current) {
      const newId = discoveredClues[discoveredClues.length - 1];
      const def = clueTriggers.find((c) => c.id === newId);
      setEventClue(def?.label ?? newId);
      prevClueCount.current = discoveredClues.length;
      const t = setTimeout(() => setEventClue(null), 2500);
      return () => clearTimeout(t);
    }
    prevClueCount.current = discoveredClues.length;
  }, [discoveredClues.length, clueTriggers, discoveredClues]);

  // ── Last activated filter ────────────────────────────────────────
  const prevFilters = useRef<Record<FilterKey, boolean>>({
    lowPass: false, highPass: false, bandPass: false,
    notch: false, compressor: false, reverse: false,
  });
  const [lastFilter, setLastFilter] = useState<FilterKey | null>(null);
  const filterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const current: Record<FilterKey, boolean> = {
      lowPass: lowPassFilter.enabled,
      highPass: highPassFilter.enabled,
      bandPass: bandPassFilter.enabled,
      notch: notchFilter.enabled,
      compressor: compressor.enabled,
      reverse: isReversed,
    };
    for (const key of FILTER_KEYS) {
      if (current[key] && !prevFilters.current[key]) {
        setLastFilter(key);
        if (filterTimerRef.current) clearTimeout(filterTimerRef.current);
        filterTimerRef.current = setTimeout(() => setLastFilter(null), 5000);
        break;
      }
    }
    prevFilters.current = current;
  }, [lowPassFilter.enabled, highPassFilter.enabled, bandPassFilter.enabled, notchFilter.enabled, compressor.enabled, isReversed]);

  // ── Compute state ────────────────────────────────────────────────
  const clueCount = discoveredClues.length;
  const totalClues = clueTriggers.length;
  const undiscovered = clueTriggers.filter((c) => !discoveredClues.includes(c.id));

  const dismiss = () => setEventClue(null);

  // Priority 1: Timer critical (< 30s)
  if (timeLeft !== null && timeLeft !== undefined && timeLeft <= 30 && timeLeft > 0) {
    return {
      message: `Il reste seulement ${timeLeft} secondes ! Vite, trouve le coupable !`,
      emotion: 'panicking',
      isEvent: timeLeft <= 10,
      soundKey: 'agace',
      eventTitle: `⏰ PLUS QUE ${timeLeft}s !`,
      dismissEvent: dismiss,
    };
  }

  // Priority 2: New clue event
  if (eventClue) {
    return {
      message: `⭐ Excellent ! On vient de trouver : « ${eventClue} » ! Cot-cot !`,
      emotion: 'triumphant',
      isEvent: true,
      soundKey: 'chant',
      eventTitle: 'INDICE TROUVÉ !',
      dismissEvent: dismiss,
    };
  }

  // Priority 3: All clues found
  if (clueCount === totalClues) {
    return {
      message: ricardoLines?.allCluesFound ?? `Tous les ${totalClues} indices trouvés ! Accuse quelqu'un !`,
      emotion: 'triumphant',
      isEvent: false,
      soundKey: 'chant',
      dismissEvent: dismiss,
    };
  }

  // Priority 4 & 5: Hot/Very hot signal
  let maxProximity = 0;
  for (const clue of undiscovered) {
    if (clue.proximity) {
      const p = clue.proximity(store);
      if (p > maxProximity) maxProximity = p;
    }
  }

  if (maxProximity >= 0.85) {
    return {
      message: ricardoLines?.veryHot ?? 'TRÈS CHAUD !! Encore un tout petit peu…',
      emotion: 'excited',
      isEvent: false,
      soundKey: 'agace',
      dismissEvent: dismiss,
    };
  }

  if (maxProximity >= 0.6) {
    return {
      message: ricardoLines?.hot ?? "Chaud ! Tu t'approches de quelque chose !",
      emotion: 'excited',
      isEvent: false,
      soundKey: 'agace',
      dismissEvent: dismiss,
    };
  }

  // Priority 6: Filter comment (5s window after activation)
  if (lastFilter && ricardoLines?.filters[lastFilter]) {
    return {
      message: ricardoLines.filters[lastFilter],
      emotion: 'thinking',
      isEvent: false,
      soundKey: 'bouche',
      dismissEvent: dismiss,
    };
  }

  // Priority 7: Play started (no clues yet)
  if (isPlaying && clueCount === 0 && ricardoLines?.play) {
    return {
      message: ricardoLines.play,
      emotion: 'neutral',
      isEvent: false,
      soundKey: 'bouche',
      dismissEvent: dismiss,
    };
  }

  // Priority 8: Idle — next hint
  const nextClue = undiscovered[0];
  if (clueCount === 0) {
    return {
      message: nextClue?.ricardoHint ?? '🎵 Écoute bien et explore les filtres !',
      emotion: 'neutral',
      isEvent: false,
      soundKey: 'bouche',
      dismissEvent: dismiss,
    };
  }

  return {
    message: nextClue?.ricardoHint
      ? `${clueCount}/${totalClues} indices ! 👉 ${nextClue.ricardoHint}`
      : `Super ! ${clueCount} indices trouvés sur ${totalClues} !`,
    emotion: 'neutral',
    isEvent: false,
    soundKey: 'bouche',
    dismissEvent: dismiss,
  };
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm run test -- useRicardo
```

Expected: all 8 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useRicardo.ts src/hooks/useRicardo.test.ts
git commit -m "feat: add useRicardo hook with priority system"
```

---

## Task 3: Enrich `RicardoBubble` with emotion support

**Files:**
- Modify: `src/components/BrainCity/RicardoBubble.tsx`
- Modify: `src/components/BrainCity/RicardoBubble.test.tsx` (currently `RexBubble.test.tsx` — rename if needed)

- [ ] **Step 1: Write failing tests**

Create/replace `src/components/BrainCity/RicardoBubble.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RicardoBubble from './RicardoBubble';

// Mock HTMLMediaElement.play
window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);

describe('RicardoBubble', () => {
  it('renders the message', () => {
    render(<RicardoBubble message="Test message" />);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('renders the Ricardo image', () => {
    render(<RicardoBubble message="Hello" emotion="neutral" />);
    const img = screen.getByAltText('Ricardo Pouleto');
    expect(img).toBeInTheDocument();
    expect(img.getAttribute('src')).toContain('neutral');
  });

  it('falls back to sticker image on error', () => {
    render(<RicardoBubble message="Hello" emotion="excited" />);
    const img = screen.getByAltText('Ricardo Pouleto');
    fireEvent.error(img);
    expect(img.getAttribute('src')).toContain('sticker');
  });

  it('shows excited badge when emotion is excited', () => {
    render(<RicardoBubble message="Hot!" emotion="excited" />);
    expect(screen.getByText('🔥')).toBeInTheDocument();
  });

  it('shows thinking badge when emotion is thinking', () => {
    render(<RicardoBubble message="Hmm" emotion="thinking" />);
    expect(screen.getByText('💭')).toBeInTheDocument();
  });

  it('shows warning badge when emotion is panicking', () => {
    render(<RicardoBubble message="VITE!" emotion="panicking" />);
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm run test -- RicardoBubble
```

Expected: failures about missing `emotion` prop handling.

- [ ] **Step 3: Rewrite `src/components/BrainCity/RicardoBubble.tsx`**

```tsx
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { RicardoEmotion, RicardoSound } from '@/hooks/useRicardo';

interface RicardoBubbleProps {
  message: string;
  emotion?: RicardoEmotion;
  soundOnMessage?: RicardoSound;
}

const SOUNDS: Record<RicardoSound, string> = {
  bouche: '/audio/pouleBouche.wav',
  agace: '/audio/pouleAgace.wav',
  apeure: '/audio/pouleApeure.wav',
  chant: '/audio/chantPoule.wav',
};

const IMAGE_MAP: Record<RicardoEmotion, string> = {
  neutral: '/images/inspecteur/Ricardo_Pouleto_neutral.png',
  excited: '/images/inspecteur/Ricardo_Pouleto_excited.png',
  thinking: '/images/inspecteur/Ricardo_Pouleto_thinking.png',
  panicking: '/images/inspecteur/Ricardo_Pouleto_panicking.png',
  triumphant: '/images/inspecteur/Ricardo_Pouleto_triumphant.png',
  scared: '/images/inspecteur/Ricardo_Pouleto_scared.png',
};

const FALLBACK_IMAGE = '/images/inspecteur/Ricardo_Pouleto_sticker.png';

const EMOTION_BADGE: Partial<Record<RicardoEmotion, string>> = {
  thinking: '💭',
  excited: '🔥',
  panicking: '⚠️',
  triumphant: '⭐',
  scared: '😨',
};

const EMOTION_BORDER: Record<RicardoEmotion, string> = {
  neutral: 'border-gray-100',
  excited: 'border-yellow-300',
  thinking: 'border-purple-200',
  panicking: 'border-red-300',
  triumphant: 'border-green-300',
  scared: 'border-red-200',
};

const playSound = (key: RicardoSound) => {
  const audio = new Audio(SOUNDS[key]);
  audio.volume = 0.6;
  audio.play().catch(() => {});
};

const RicardoBubble = ({ message, emotion = 'neutral', soundOnMessage = 'bouche' }: RicardoBubbleProps) => {
  const prevMessage = useRef<string>('');
  const [imgSrc, setImgSrc] = useState(IMAGE_MAP[emotion]);

  // Update image when emotion changes
  useEffect(() => {
    setImgSrc(IMAGE_MAP[emotion]);
  }, [emotion]);

  // Auto-play only for non-bouche sounds
  useEffect(() => {
    if (message !== prevMessage.current) {
      prevMessage.current = message;
      if (soundOnMessage !== 'bouche') {
        playSound(soundOnMessage);
      }
    }
  }, [message, soundOnMessage]);

  const badge = EMOTION_BADGE[emotion];
  const isPanicking = emotion === 'panicking';

  return (
    <div className={`flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm border-2 ${EMOTION_BORDER[emotion]}`}>
      <div className="relative flex-shrink-0">
        <motion.img
          src={imgSrc}
          alt="Ricardo Pouleto"
          className="w-14 h-14 cursor-pointer object-contain"
          onError={() => setImgSrc(FALLBACK_IMAGE)}
          onClick={() => playSound('bouche')}
          whileHover={{ scale: 1.15, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          animate={isPanicking ? { x: [-2, 2, -2, 2, 0] } : { y: [0, -3, 0] }}
          transition={
            isPanicking
              ? { duration: 0.3, repeat: Infinity }
              : { duration: 2.5, repeat: Infinity, repeatDelay: 2 }
          }
        />
        {badge && (
          <span className="absolute -top-1 -right-1 text-sm leading-none">{badge}</span>
        )}
      </div>
      <div className="bg-braincity-bubble rounded-xl px-3 py-2 text-sm font-semibold text-gray-800 leading-snug">
        {message}
      </div>
    </div>
  );
};

export default RicardoBubble;
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm run test -- RicardoBubble
```

Expected: all 6 tests pass.

- [ ] **Step 5: Verify build**

```bash
npm run build
```

Expected: `✓ built in X.XXs`.

- [ ] **Step 6: Commit**

```bash
git add src/components/BrainCity/RicardoBubble.tsx src/components/BrainCity/RicardoBubble.test.tsx
git commit -m "feat: add emotion support to RicardoBubble with image map and badges"
```

---

## Task 4: Create `RicardoEventModal`

**Files:**
- Create: `src/components/BrainCity/RicardoEventModal.tsx`
- Create: `src/components/BrainCity/RicardoEventModal.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/BrainCity/RicardoEventModal.test.tsx`:

```tsx
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import RicardoEventModal from './RicardoEventModal';

window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);

describe('RicardoEventModal', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders title and message', () => {
    render(
      <RicardoEventModal
        emotion="triumphant"
        title="INDICE TROUVÉ !"
        message="Cliquetis de clés détecté"
        onDismiss={vi.fn()}
      />
    );
    expect(screen.getByText('INDICE TROUVÉ !')).toBeInTheDocument();
    expect(screen.getByText('Cliquetis de clés détecté')).toBeInTheDocument();
  });

  it('renders star progress when clueProgress is provided', () => {
    render(
      <RicardoEventModal
        emotion="triumphant"
        title="INDICE TROUVÉ !"
        message="Test"
        clueProgress={{ found: 3, total: 8 }}
        onDismiss={vi.fn()}
      />
    );
    // 3 filled stars + 5 empty
    const stars = screen.getAllByText(/[⭐☆]/);
    expect(stars.length).toBeGreaterThan(0);
  });

  it('calls onDismiss when clicked', () => {
    const onDismiss = vi.fn();
    render(
      <RicardoEventModal
        emotion="triumphant"
        title="TEST"
        message="Test"
        onDismiss={onDismiss}
      />
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('auto-dismisses after 2500ms', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(
      <RicardoEventModal
        emotion="panicking"
        title="⏰"
        message="Vite!"
        onDismiss={onDismiss}
      />
    );
    act(() => { vi.advanceTimersByTime(2500); });
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm run test -- RicardoEventModal
```

Expected: errors about missing module.

- [ ] **Step 3: Create `src/components/BrainCity/RicardoEventModal.tsx`**

```tsx
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { RicardoEmotion } from '@/hooks/useRicardo';

interface RicardoEventModalProps {
  emotion: RicardoEmotion;
  title: string;
  message: string;
  clueProgress?: { found: number; total: number };
  onDismiss: () => void;
}

const GRADIENT: Partial<Record<RicardoEmotion, string>> = {
  triumphant: 'from-emerald-400 to-blue-500',
  panicking: 'from-red-500 to-red-700',
  scared: 'from-gray-500 to-red-400',
};

const IMAGE_MAP: Partial<Record<RicardoEmotion, string>> = {
  triumphant: '/images/inspecteur/Ricardo_Pouleto_triumphant.png',
  panicking: '/images/inspecteur/Ricardo_Pouleto_panicking.png',
  scared: '/images/inspecteur/Ricardo_Pouleto_scared.png',
};

const FALLBACK = '/images/inspecteur/Ricardo_Pouleto_sticker.png';

const RicardoEventModal = ({
  emotion,
  title,
  message,
  clueProgress,
  onDismiss,
}: RicardoEventModalProps) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 2500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const gradient = GRADIENT[emotion] ?? 'from-blue-400 to-purple-500';
  const imgSrc = IMAGE_MAP[emotion] ?? FALLBACK;

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.button
        type="button"
        className={`bg-gradient-to-br ${gradient} rounded-3xl px-8 py-6 flex flex-col items-center gap-3 shadow-2xl pointer-events-auto cursor-pointer border-4 border-white/30`}
        initial={{ scale: 0.6, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.6, y: 40 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onClick={onDismiss}
      >
        <motion.img
          src={imgSrc}
          alt="Ricardo"
          className="w-20 h-20 object-contain"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK; }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        />
        <div className="text-center">
          <p className="text-white font-black text-xl tracking-wide drop-shadow">{title}</p>
          <p className="text-white/90 font-semibold text-sm mt-1">{message}</p>
        </div>
        {clueProgress && (
          <div className="flex gap-1">
            {Array.from({ length: clueProgress.total }, (_, i) => (
              <span key={i} className="text-lg leading-none">
                {i < clueProgress.found ? '⭐' : '☆'}
              </span>
            ))}
          </div>
        )}
      </motion.button>
    </motion.div>
  );
};

export default RicardoEventModal;
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm run test -- RicardoEventModal
```

Expected: all 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/BrainCity/RicardoEventModal.tsx src/components/BrainCity/RicardoEventModal.test.tsx
git commit -m "feat: add RicardoEventModal component with auto-dismiss"
```

---

## Task 5: Wire `Dashboard` to `useRicardo`

**Files:**
- Modify: `src/components/Workspace/Dashboard.tsx`

- [ ] **Step 1: Update imports**

Replace the top of `Dashboard.tsx`. Change:

```ts
import { useEffect, useMemo, useCallback, memo, useState, useRef } from 'react';
```

to:

```ts
import { useEffect, useCallback, memo, useState, useRef } from 'react';
```

Add at the end of the import block:

```ts
import { AnimatePresence } from 'framer-motion';
import { useRicardo } from '@/hooks/useRicardo';
import RicardoEventModal from '@/components/BrainCity/RicardoEventModal';
```

(`AnimatePresence` is already imported — keep the existing import, just add the two new ones.)

- [ ] **Step 2: Replace the old Ricardo message logic**

Find and delete the entire block in `Dashboard.tsx`:

```ts
  const [celebratedClue, setCelebratedClue] = useState<string | null>(null);
  const prevClueCount = useRef(0);
```

and the `useEffect` that sets `celebratedClue`, and the `nextUnfoundClue` constant, and the `{ ricardoMessage, ricardoSound }` block.

Replace them all with a single line:

```ts
  const ricardo = useRicardo(missionTimerEnabled ? timeLeft : null);
```

- [ ] **Step 3: Update `RicardoBubble` usage**

Find:

```tsx
<RicardoBubble message={ricardoMessage} soundOnMessage={ricardoSound} />
```

Replace with:

```tsx
<RicardoBubble
  message={ricardo.message}
  emotion={ricardo.emotion}
  soundOnMessage={ricardo.soundKey}
/>
```

- [ ] **Step 4: Mount `RicardoEventModal` inside `AnimatePresence`**

Find the `{/* Timer expired overlay */}` block. Just before it, add:

```tsx
        {/* Ricardo event modal */}
        <AnimatePresence>
          {isBrainCity && ricardo.isEvent && (
            <RicardoEventModal
              emotion={ricardo.emotion}
              title={ricardo.eventTitle ?? ''}
              message={ricardo.message}
              clueProgress={{ found: clueCount, total: totalClues }}
              onDismiss={ricardo.dismissEvent}
            />
          )}
        </AnimatePresence>
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```

Expected: `✓ built in X.XXs` with no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/Workspace/Dashboard.tsx
git commit -m "feat: wire Dashboard to useRicardo hook and mount RicardoEventModal"
```

---

## Task 6: Add Ricardo briefing to `AudioSetup`

**Files:**
- Modify: `src/components/AudioPlayer/AudioSetup.tsx`

- [ ] **Step 1: Add import**

At the top of `AudioSetup.tsx`, add:

```ts
import RicardoBubble from '@/components/BrainCity/RicardoBubble';
import { SCENARIOS } from '@/data/scenarios';
```

(`SCENARIOS` is already imported — skip if duplicate.)

- [ ] **Step 2: Add Ricardo briefing block in the scenario step**

Inside `AudioSetup`, find the JSX for the scenario selection step (look for `step === 'scenario'`). Find where the scenario title/description is rendered and add the following block immediately after the scenario title — but only when `selectedScenario === 'braincity'`:

```tsx
{selectedScenario === 'braincity' && (
  <div className="mt-4">
    <RicardoBubble
      message={SCENARIOS.braincity.ricardoLines?.setup ?? ''}
      emotion="neutral"
    />
  </div>
)}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: `✓ built in X.XXs`.

- [ ] **Step 4: Commit**

```bash
git add src/components/AudioPlayer/AudioSetup.tsx
git commit -m "feat: add Ricardo briefing block to AudioSetup for Brain City"
```

---

## Task 7: Update `SuspectGrid` with Ricardo hover comments

**Files:**
- Modify: `src/components/Suspects/SuspectGrid.tsx`

- [ ] **Step 1: Add imports and state**

In `SuspectGrid.tsx`, add to the import block:

```ts
import { getScenario } from '@/data/scenarios';
```

(`getScenario` may already be imported — check before adding.)

Inside the `SuspectGrid` component, add after the existing state declarations:

```ts
  const { scenario: scenarioId } = useAudioStore();
  const scenario = getScenario(scenarioId);
  const [hoveredSuspectId, setHoveredSuspectId] = useState<string | null>(null);

  const ricardoSuspectMessage = (() => {
    if (!hoveredSuspectId) return '🎧 Survole un suspect pour avoir mon avis — compare avec l\'enregistrement !';
    return scenario.ricardoLines?.suspectComments[hoveredSuspectId]
      ?? '🎧 Écoute sa voix et compare avec l\'enregistrement !';
  })();

  const ricardoSuspectEmotion = hoveredSuspectId === scenario.guiltyId ? 'excited' : 'thinking';
```

- [ ] **Step 2: Update the `RicardoBubble` usage in `SuspectGrid`**

Find the existing Brain City Ricardo bubble:

```tsx
<RicardoBubble message="🎧 Clique sur ▶ pour écouter chaque voix — compare avec l'enregistrement !" />
```

Replace with:

```tsx
<RicardoBubble
  message={ricardoSuspectMessage}
  emotion={hoveredSuspectId ? ricardoSuspectEmotion : 'neutral'}
/>
```

- [ ] **Step 3: Add hover handlers to each suspect card**

Find the suspect card's outer `motion.div` (the one that maps over suspects). It will look like:

```tsx
<motion.div
  key={suspect.id}
  className={`...`}
  ...
>
```

Add `onMouseEnter` and `onMouseLeave` to that div:

```tsx
<motion.div
  key={suspect.id}
  className={`...`}
  onMouseEnter={() => setHoveredSuspectId(suspect.id)}
  onMouseLeave={() => setHoveredSuspectId(null)}
  ...
>
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: `✓ built in X.XXs`.

- [ ] **Step 5: Run all tests**

```bash
npm run test
```

Expected: all tests pass.

- [ ] **Step 6: Final commit**

```bash
git add src/components/Suspects/SuspectGrid.tsx
git commit -m "feat: add Ricardo hover comments to SuspectGrid"
```

---

---

## Task 8: Update `ResultScreen` with emotion

**Files:**
- Modify: `src/components/Debrief/ResultScreen.tsx`

- [ ] **Step 1: Add `emotion` prop to the `RicardoBubble` in ResultScreen**

In `ResultScreen.tsx`, find the two `RicardoBubble` usages. They currently look like:

```tsx
<RicardoBubble message={scenario.ricardoLines?.correctSuspect ?? scenario.successTitle} soundOnMessage="chant" />
```

and

```tsx
<RicardoBubble message={scenario.ricardoLines?.wrongSuspect ?? scenario.failureMessage} soundOnMessage="apeure" />
```

If these patterns don't exist yet (the original code uses `soundOnMessage` without `ricardoLines`), update both to use the new `ricardoLines` messages and add `emotion`:

For the **correct suspect** branch, add `emotion="triumphant"` and use `ricardoLines.correctSuspect`:

```tsx
<RicardoBubble
  message={scenario.ricardoLines?.correctSuspect ?? scenario.successTitle}
  emotion="triumphant"
  soundOnMessage="chant"
/>
```

For the **wrong suspect** branch, add `emotion="scared"` and use `ricardoLines.wrongSuspect`:

```tsx
<RicardoBubble
  message={scenario.ricardoLines?.wrongSuspect ?? scenario.failureMessage}
  emotion="scared"
  soundOnMessage="apeure"
/>
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: `✓ built in X.XXs`.

- [ ] **Step 3: Run all tests**

```bash
npm run test
```

Expected: all tests pass.

- [ ] **Step 4: Final commit**

```bash
git add src/components/Debrief/ResultScreen.tsx
git commit -m "feat: add emotion props to ResultScreen RicardoBubble"
```

---

## Images to prepare

Before the feature goes live, place these 6 files in `/public/images/inspecteur/`:

| Filename | Emotion | When shown |
|----------|---------|-----------|
| `Ricardo_Pouleto_neutral.png` | Calm | Idle, hints, play |
| `Ricardo_Pouleto_thinking.png` | Concentrated | Filter activated |
| `Ricardo_Pouleto_excited.png` | Excited | Hot signal, proximity |
| `Ricardo_Pouleto_panicking.png` | Panicking | Timer < 30s |
| `Ricardo_Pouleto_triumphant.png` | Triumphant | Clue found, victory |
| `Ricardo_Pouleto_scared.png` | Scared | Wrong suspect |

> The existing `Ricardo_Pouleto_sticker.png` is the fallback for any missing image — the app works without the new images, it just won't show the right expression.
