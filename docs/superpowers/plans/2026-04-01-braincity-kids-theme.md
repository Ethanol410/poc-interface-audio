# Brain City Kids Theme — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a child-friendly (7–13 ans) visual theme for the `braincity` scenario, applied automatically on Login, Dashboard, Suspects, and Debrief screens — without touching the adult `corbeau` theme or any audio logic.

**Architecture:** A `useScenarioTheme` hook reads `scenarioId` from the Zustand store and returns `isBrainCity: boolean`. Each affected component uses this flag to swap classes/content. New components `RexBubble` and `KidsToolPanel` are created for the kids-only UI pieces.

**Tech Stack:** React 18, TypeScript, Tailwind CSS 3, Framer Motion, Zustand, Vitest + @testing-library/react

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `tailwind.config.js` | Modify | Add `braincity.*` color palette |
| `vite.config.ts` | Modify | Add Vitest `test` block with jsdom |
| `src/test/setup.ts` | Create | Vitest global setup (mock Web Audio API) |
| `src/hooks/useScenarioTheme.ts` | Create | Returns `{ isBrainCity, scenarioId }` |
| `src/hooks/useScenarioTheme.test.ts` | Create | Unit tests for the hook |
| `src/components/BrainCity/RexBubble.tsx` | Create | Mascot + contextual speech bubble |
| `src/components/BrainCity/RexBubble.test.tsx` | Create | Render tests for RexBubble |
| `src/components/BrainCity/KidsToolPanel.tsx` | Create | 4 image-based filter buttons for kids |
| `src/components/BrainCity/KidsToolPanel.test.tsx` | Create | Toggle behavior tests |
| `src/components/Layout/AppLayout.tsx` | Modify | Conditional background (no scanlines for braincity) |
| `src/components/Auth/LoginScreen.tsx` | Modify | Kids login UI when `isBrainCity` |
| `src/components/Workspace/Dashboard.tsx` | Modify | Kids dashboard layout when `isBrainCity` |
| `src/components/Suspects/SuspectGrid.tsx` | Modify | Kids suspect cards when `isBrainCity` |
| `src/components/Debrief/ResultScreen.tsx` | Modify | Kids debrief layout when `isBrainCity` |

---

## Task 1: Vitest setup + Tailwind palette + `useScenarioTheme` hook

**Files:**
- Modify: `vite.config.ts`
- Create: `src/test/setup.ts`
- Modify: `tailwind.config.js`
- Create: `src/hooks/useScenarioTheme.ts`
- Create: `src/hooks/useScenarioTheme.test.ts`

- [ ] **Step 1: Install test dependencies**

```bash
npm install --save-dev @testing-library/jest-dom @testing-library/user-event jsdom
```

Expected output: packages added to `node_modules`, `package.json` updated.

- [ ] **Step 2: Add Vitest config block to `vite.config.ts`**

Add the `test` block after the existing `build` block (before the closing `}`):

```typescript
// Add this import at the top of vite.config.ts:
/// <reference types="vitest" />

// Add inside defineConfig({...}):
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
```

The full top of the file should become:
```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite';
// ... rest unchanged
```

- [ ] **Step 3: Create `src/test/setup.ts`**

```typescript
import '@testing-library/jest-dom';

// Mock Web Audio API (not available in jsdom)
class MockAudioContext {
  createBiquadFilter() {
    return { type: '', frequency: { value: 0 }, Q: { value: 0 }, connect: () => {} };
  }
  createGain() { return { gain: { value: 0 }, connect: () => {} }; }
  createDynamicsCompressor() {
    return { threshold: { value: 0 }, ratio: { value: 0 }, connect: () => {} };
  }
  createAnalyser() { return { fftSize: 0, connect: () => {} }; }
  createMediaElementSource() { return { connect: () => {} }; }
  get destination() { return {}; }
}

Object.defineProperty(window, 'AudioContext', { writable: true, value: MockAudioContext });
Object.defineProperty(window, 'webkitAudioContext', { writable: true, value: MockAudioContext });
```

- [ ] **Step 4: Add `braincity` colors to `tailwind.config.js`**

Replace the `colors` block:

```javascript
colors: {
  forensics: {
    bg: '#0a0e27',
    'bg-light': '#141a3a',
    cyan: '#00d4ff',
    'cyan-dark': '#0099cc',
    green: '#00ff88',
    red: '#ff3366',
    orange: '#ff9933',
  },
  braincity: {
    bg: '#e0f2fe',
    'bg-end': '#f0fdf4',
    primary: '#0ea5e9',
    secondary: '#84cc16',
    accent: '#f97316',
    violet: '#9333ea',
    pink: '#f472b6',
    card: '#ffffff',
    bubble: '#fef9c3',
    success: '#16a34a',
    warning: '#ca8a04',
  },
},
```

- [ ] **Step 5: Write the failing test for `useScenarioTheme`**

Create `src/hooks/useScenarioTheme.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScenarioTheme } from './useScenarioTheme';
import { useAudioStore } from '@/stores/audioStore';

describe('useScenarioTheme', () => {
  beforeEach(() => {
    useAudioStore.getState().reset();
  });

  it('returns isBrainCity=false for corbeau scenario', () => {
    useAudioStore.getState().setScenario('corbeau');
    const { result } = renderHook(() => useScenarioTheme());
    expect(result.current.isBrainCity).toBe(false);
    expect(result.current.scenarioId).toBe('corbeau');
  });

  it('returns isBrainCity=true for braincity scenario', () => {
    useAudioStore.getState().setScenario('braincity');
    const { result } = renderHook(() => useScenarioTheme());
    expect(result.current.isBrainCity).toBe(true);
    expect(result.current.scenarioId).toBe('braincity');
  });

  it('updates reactively when scenario changes', () => {
    useAudioStore.getState().setScenario('corbeau');
    const { result } = renderHook(() => useScenarioTheme());
    expect(result.current.isBrainCity).toBe(false);

    act(() => {
      useAudioStore.getState().setScenario('braincity');
    });

    expect(result.current.isBrainCity).toBe(true);
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

```bash
npm test -- --run src/hooks/useScenarioTheme.test.ts
```

Expected: FAIL with `Cannot find module './useScenarioTheme'`

- [ ] **Step 7: Create `src/hooks/useScenarioTheme.ts`**

```typescript
import { useAudioStore } from '@/stores/audioStore';
import type { ScenarioId } from '@/data/scenarios';

interface ScenarioTheme {
  isBrainCity: boolean;
  scenarioId: ScenarioId;
}

export function useScenarioTheme(): ScenarioTheme {
  const scenarioId = useAudioStore((state) => state.scenario);
  return {
    isBrainCity: scenarioId === 'braincity',
    scenarioId,
  };
}
```

- [ ] **Step 8: Run test to verify it passes**

```bash
npm test -- --run src/hooks/useScenarioTheme.test.ts
```

Expected: PASS (3 tests)

- [ ] **Step 9: Commit**

```bash
git add vite.config.ts src/test/setup.ts tailwind.config.js src/hooks/useScenarioTheme.ts src/hooks/useScenarioTheme.test.ts package.json package-lock.json
git commit -m "feat: add braincity theme palette, vitest setup, and useScenarioTheme hook"
```

---

## Task 2: `RexBubble` component

**Files:**
- Create: `src/components/BrainCity/RexBubble.tsx`
- Create: `src/components/BrainCity/RexBubble.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/BrainCity/RexBubble.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RexBubble from './RexBubble';

describe('RexBubble', () => {
  it('renders the dog emoji', () => {
    render(<RexBubble message="Bonjour !" />);
    expect(screen.getByText('🐕')).toBeInTheDocument();
  });

  it('renders the message text', () => {
    render(<RexBubble message="On va résoudre cette enquête !" />);
    expect(screen.getByText('On va résoudre cette enquête !')).toBeInTheDocument();
  });

  it('renders with a different message', () => {
    render(<RexBubble message="Ouaf ! Nouvel indice trouvé !" />);
    expect(screen.getByText('Ouaf ! Nouvel indice trouvé !')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --run src/components/BrainCity/RexBubble.test.tsx
```

Expected: FAIL with `Cannot find module './RexBubble'`

- [ ] **Step 3: Create `src/components/BrainCity/RexBubble.tsx`**

```tsx
interface RexBubbleProps {
  message: string;
}

const RexBubble = ({ message }: RexBubbleProps) => (
  <div className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm">
    <span className="text-2xl flex-shrink-0" aria-hidden="true">🐕</span>
    <div className="bg-braincity-bubble rounded-xl px-3 py-2 text-sm font-semibold text-gray-800 leading-snug">
      {message}
    </div>
  </div>
);

export default RexBubble;
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- --run src/components/BrainCity/RexBubble.test.tsx
```

Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/BrainCity/RexBubble.tsx src/components/BrainCity/RexBubble.test.tsx
git commit -m "feat: add RexBubble mascot component for Brain City kids theme"
```

---

## Task 3: `KidsToolPanel` component

**Files:**
- Create: `src/components/BrainCity/KidsToolPanel.tsx`
- Create: `src/components/BrainCity/KidsToolPanel.test.tsx`

The panel has 4 main tool buttons (Low-Pass, High-Pass, Notch, Compressor) plus a collapsible "⚙️ Options avancées" section (Band-Pass, Pitch, Speed, Reverse) for animators.

- [ ] **Step 1: Write the failing tests**

Create `src/components/BrainCity/KidsToolPanel.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import KidsToolPanel from './KidsToolPanel';
import { useAudioStore } from '@/stores/audioStore';

// Mock audioEngine — it uses Web Audio API which isn't available in tests
vi.mock('@/services/audioEngine', () => ({
  audioEngine: {
    applyLowPassFilter: vi.fn(),
    applyHighPassFilter: vi.fn(),
    applyNotchFilter: vi.fn(),
    applyCompressor: vi.fn(),
    applyBandPassFilter: vi.fn(),
    setPlaybackSpeed: vi.fn(),
    setPitchShift: vi.fn(),
    setReverse: vi.fn(),
  },
}));

describe('KidsToolPanel', () => {
  beforeEach(() => {
    useAudioStore.getState().reset();
  });

  it('renders all 4 main tool buttons', () => {
    render(<KidsToolPanel />);
    expect(screen.getByText('Sons graves')).toBeInTheDocument();
    expect(screen.getByText('Sons aigus')).toBeInTheDocument();
    expect(screen.getByText('Nettoyer')).toBeInTheDocument();
    expect(screen.getByText('Amplifier')).toBeInTheDocument();
  });

  it('toggles low-pass filter when "Sons graves" is clicked', () => {
    render(<KidsToolPanel />);
    const btn = screen.getByText('Sons graves').closest('button')!;
    expect(useAudioStore.getState().lowPassFilter.enabled).toBe(false);
    fireEvent.click(btn);
    expect(useAudioStore.getState().lowPassFilter.enabled).toBe(true);
    fireEvent.click(btn);
    expect(useAudioStore.getState().lowPassFilter.enabled).toBe(false);
  });

  it('toggles high-pass filter when "Sons aigus" is clicked', () => {
    render(<KidsToolPanel />);
    const btn = screen.getByText('Sons aigus').closest('button')!;
    fireEvent.click(btn);
    expect(useAudioStore.getState().highPassFilter.enabled).toBe(true);
  });

  it('toggles notch filter when "Nettoyer" is clicked', () => {
    render(<KidsToolPanel />);
    const btn = screen.getByText('Nettoyer').closest('button')!;
    fireEvent.click(btn);
    expect(useAudioStore.getState().notchFilter.enabled).toBe(true);
  });

  it('toggles compressor when "Amplifier" is clicked', () => {
    render(<KidsToolPanel />);
    const btn = screen.getByText('Amplifier').closest('button')!;
    fireEvent.click(btn);
    expect(useAudioStore.getState().compressor.enabled).toBe(true);
  });

  it('shows advanced options when toggle is clicked', () => {
    render(<KidsToolPanel />);
    expect(screen.queryByText('Changer la voix')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('⚙️ Options avancées'));
    expect(screen.getByText('Changer la voix')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --run src/components/BrainCity/KidsToolPanel.test.tsx
```

Expected: FAIL with `Cannot find module './KidsToolPanel'`

- [ ] **Step 3: Create `src/components/BrainCity/KidsToolPanel.tsx`**

```tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioStore } from '@/stores/audioStore';
import { audioEngine } from '@/services/audioEngine';
import { useFilterControls } from '@/hooks/useFilterControls';

interface ToolButtonProps {
  emoji: string;
  label: string;
  description: string;
  active: boolean;
  color: string;
  activeBg: string;
  onClick: () => void;
}

const ToolButton = ({ emoji, label, description, active, color, activeBg, onClick }: ToolButtonProps) => (
  <button
    onClick={onClick}
    className={`rounded-xl p-3 text-center transition-all border-2 ${
      active
        ? `${activeBg} border-current shadow-md`
        : 'bg-white border-dashed border-gray-200 hover:border-gray-300'
    }`}
  >
    <div className="text-2xl mb-1">{emoji}</div>
    <div className={`text-xs font-bold ${active ? color : 'text-gray-700'}`}>{label}</div>
    <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">{description}</div>
  </button>
);

const KidsToolPanel = () => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    isReversed, toggleReverse,
    notchFilter, setNotchFilter,
    compressor, setCompressor,
    bandPassFilter, setBandPassFilter,
    playbackSpeed, setPlaybackSpeed,
    pitchShift, setPitchShift,
  } = useAudioStore();

  const { lowPassFilter, highPassFilter, updateLowPassFilter, updateHighPassFilter } = useFilterControls();

  const handleLowPass = () => {
    updateLowPassFilter({ enabled: !lowPassFilter.enabled });
  };

  const handleHighPass = () => {
    updateHighPassFilter({ enabled: !highPassFilter.enabled });
  };

  const handleNotch = () => {
    const next = { ...notchFilter, enabled: !notchFilter.enabled };
    setNotchFilter({ enabled: next.enabled });
    audioEngine.applyNotchFilter(next);
  };

  const handleCompressor = () => {
    const next = { ...compressor, enabled: !compressor.enabled };
    setCompressor({ enabled: next.enabled });
    audioEngine.applyCompressor(next);
  };

  const handleBandPass = () => {
    const next = { ...bandPassFilter, enabled: !bandPassFilter.enabled };
    setBandPassFilter({ enabled: next.enabled });
    audioEngine.applyBandPassFilter(next);
  };

  const handleSpeed = (e: React.ChangeEvent<HTMLInputElement>) => {
    const speed = parseFloat(e.target.value);
    setPlaybackSpeed(speed);
    audioEngine.setPlaybackSpeed(speed);
  };

  const handlePitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const semitones = parseFloat(e.target.value);
    setPitchShift({ semitones, enabled: semitones !== 0 });
  };

  const handleReverse = () => {
    toggleReverse();
    audioEngine.setReverse(!isReversed);
  };

  return (
    <div className="space-y-4">
      <div className="text-xs font-bold text-braincity-primary mb-2">🔧 Tes outils de détective</div>

      <div className="grid grid-cols-2 gap-3">
        <ToolButton
          emoji="🔊"
          label="Sons graves"
          description="Filtre les bruits forts"
          active={lowPassFilter.enabled}
          color="text-braincity-primary"
          activeBg="bg-sky-50"
          onClick={handleLowPass}
        />
        <ToolButton
          emoji="🎵"
          label="Sons aigus"
          description="Nettoie les sifflements"
          active={highPassFilter.enabled}
          color="text-braincity-success"
          activeBg="bg-green-50"
          onClick={handleHighPass}
        />
        <ToolButton
          emoji="⚡"
          label="Nettoyer"
          description="Enlève le buzz électrique"
          active={notchFilter.enabled}
          color="text-braincity-warning"
          activeBg="bg-yellow-50"
          onClick={handleNotch}
        />
        <ToolButton
          emoji="🔎"
          label="Amplifier"
          description="Rends la voix plus forte"
          active={compressor.enabled}
          color="text-braincity-violet"
          activeBg="bg-purple-50"
          onClick={handleCompressor}
        />
      </div>

      {/* Advanced toggle */}
      <button
        onClick={() => setShowAdvanced((v) => !v)}
        className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
      >
        ⚙️ Options avancées {showAdvanced ? '▲' : '▼'}
      </button>

      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
          >
            {/* Band-pass */}
            <div>
              <button
                onClick={handleBandPass}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                  bandPassFilter.enabled
                    ? 'bg-pink-50 border-pink-300 text-braincity-pink'
                    : 'bg-white border-gray-200 text-gray-500'
                }`}
              >
                🎤 Changer la voix {bandPassFilter.enabled ? '(activé)' : ''}
              </button>
            </div>

            {/* Pitch */}
            <div>
              <div className="text-xs text-gray-500 mb-1 font-semibold">🎭 Changer la tonalité</div>
              <input
                type="range"
                min="-12"
                max="12"
                step="1"
                value={pitchShift.semitones}
                onChange={handlePitch}
                className="w-full accent-braincity-primary"
              />
              <div className="text-center text-xs text-gray-400">
                {pitchShift.semitones > 0 ? `+${pitchShift.semitones}` : pitchShift.semitones} demi-tons
              </div>
            </div>

            {/* Speed */}
            <div>
              <div className="text-xs text-gray-500 mb-1 font-semibold">⏩ Vitesse</div>
              <input
                type="range"
                min="0.25"
                max="2"
                step="0.25"
                value={playbackSpeed}
                onChange={handleSpeed}
                className="w-full accent-braincity-primary"
              />
              <div className="text-center text-xs text-gray-400">{playbackSpeed}×</div>
            </div>

            {/* Reverse */}
            <button
              onClick={handleReverse}
              className={`w-full px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                isReversed
                  ? 'bg-orange-50 border-orange-300 text-braincity-accent'
                  : 'bg-white border-gray-200 text-gray-500'
              }`}
            >
              🔄 Inverser le son {isReversed ? '(activé)' : ''}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KidsToolPanel;
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --run src/components/BrainCity/KidsToolPanel.test.tsx
```

Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/BrainCity/KidsToolPanel.tsx src/components/BrainCity/KidsToolPanel.test.tsx
git commit -m "feat: add KidsToolPanel with 4 image-based filter buttons for Brain City"
```

---

## Task 4: `AppLayout` — kids background

**Files:**
- Modify: `src/components/Layout/AppLayout.tsx`

- [ ] **Step 1: Read the current file**

Read `src/components/Layout/AppLayout.tsx` (already done in plan research — 54 lines).

- [ ] **Step 2: Apply the conditional background**

Replace the outer `<div>` className and the scanlines `<div>`:

```tsx
// Add import at top:
import { useScenarioTheme } from '@/hooks/useScenarioTheme';

// Inside AppLayout(), add after existing hooks:
const { isBrainCity } = useScenarioTheme();

// Replace:
//   <div className="min-h-screen bg-forensics-bg relative overflow-hidden">
//     {/* Scanlines overlay */}
//     <div className="scanlines" />
// With:
<div
  className={`min-h-screen relative overflow-hidden ${
    isBrainCity
      ? 'bg-gradient-to-br from-braincity-bg to-braincity-bg-end'
      : 'bg-forensics-bg'
  }`}
>
  {!isBrainCity && <div className="scanlines" />}
```

- [ ] **Step 3: Run lint to verify no TS errors**

```bash
npm run lint
```

Expected: no errors, 0 warnings

- [ ] **Step 4: Commit**

```bash
git add src/components/Layout/AppLayout.tsx
git commit -m "feat: apply Brain City kids gradient background in AppLayout"
```

---

## Task 5: `LoginScreen` kids theme

**Files:**
- Modify: `src/components/Auth/LoginScreen.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/Auth/LoginScreen.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginScreen from './LoginScreen';
import { useAudioStore } from '@/stores/audioStore';

const renderLogin = () =>
  render(
    <MemoryRouter>
      <LoginScreen />
    </MemoryRouter>
  );

describe('LoginScreen — theme switching', () => {
  beforeEach(() => {
    useAudioStore.getState().reset();
  });

  it('shows adult theme for corbeau scenario', () => {
    useAudioStore.getState().setScenario('corbeau');
    renderLogin();
    expect(screen.getByText(/ACCÈS RESTREINT/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/matricule agent/i)).toBeInTheDocument();
  });

  it('shows kids theme for braincity scenario', () => {
    useAudioStore.getState().setScenario('braincity');
    renderLogin();
    expect(screen.getByText(/BRAIN CITY/i)).toBeInTheDocument();
    expect(screen.getByText(/Ton prénom d'agent/i)).toBeInTheDocument();
    expect(screen.getByText(/COMMENCER L'ENQUÊTE/i)).toBeInTheDocument();
    expect(screen.queryByText(/ACCÈS RESTREINT/i)).not.toBeInTheDocument();
  });

  it('shows Rex mascot in braincity theme', () => {
    useAudioStore.getState().setScenario('braincity');
    renderLogin();
    expect(screen.getByText('🐕')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --run src/components/Auth/LoginScreen.test.tsx
```

Expected: FAIL — adult theme tests pass but kids theme tests fail (elements not found).

- [ ] **Step 3: Modify `src/components/Auth/LoginScreen.tsx`**

Replace the entire file content:

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAudioStore } from '@/stores/audioStore';
import { getScenario } from '@/data/scenarios';
import { useScenarioTheme } from '@/hooks/useScenarioTheme';
import RexBubble from '@/components/BrainCity/RexBubble';

const LoginScreen = () => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { scenario: scenarioId } = useAudioStore();
  const { isBrainCity } = useScenarioTheme();
  const scenario = getScenario(scenarioId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (name.length >= 2) {
      sessionStorage.setItem('agent-matricule', name);
      setTimeout(() => navigate('/workspace'), 1500);
    }
  };

  if (isBrainCity) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
           style={{ background: 'linear-gradient(160deg, #b8e8ff 0%, #e8f8ff 40%, #d4f5e0 100%)' }}>
        {/* Decorative clouds */}
        <div className="absolute top-4 left-6 w-16 h-5 bg-white/70 rounded-full" />
        <div className="absolute top-2 left-14 w-10 h-4 bg-white/60 rounded-full" />
        <div className="absolute top-5 right-10 w-12 h-4 bg-white/60 rounded-full" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm relative z-10"
        >
          {/* Rex */}
          <div className="text-center mb-4">
            <motion.div
              className="text-7xl"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              🐕
            </motion.div>
          </div>

          {/* Rex bubble */}
          <div className="mb-4">
            <RexBubble message="Salut ! Je suis Rex 🐾 On va résoudre cette enquête ensemble !" />
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-black text-braincity-primary">BRAIN CITY 🏙️</h1>
            <p className="text-sm text-gray-500 font-semibold mt-1">Mission : Trouve l'agresseur !</p>
          </div>

          {/* Form */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-lg"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="agent-name"
                  className="block text-braincity-primary text-sm font-bold mb-2"
                >
                  👤 Ton prénom d'agent !
                </label>
                <input
                  id="agent-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-sky-50 border-2 border-sky-200 text-gray-800 px-4 py-3 rounded-xl focus:outline-none focus:border-braincity-primary transition-all"
                  placeholder="Ex : Léa, Maxime…"
                  required
                  minLength={2}
                  disabled={isLoading}
                />
              </div>

              <motion.button
                type="submit"
                className="w-full font-black py-3 rounded-2xl text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm tracking-wide"
                style={{ background: isLoading ? '#94a3b8' : 'linear-gradient(90deg, #22d3ee, #84cc16)' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
              >
                {isLoading ? 'Connexion…' : '🚀 COMMENCER L\'ENQUÊTE !'}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Adult theme (corbeau) — unchanged
  return (
    <div className="min-h-screen bg-forensics-bg flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.h1
            className="text-4xl font-bold text-forensics-cyan mb-2 font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {scenario.subtitle.split('—')[0].trim()}
          </motion.h1>
          <motion.p
            className="text-red-500 text-sm font-mono uppercase tracking-wider"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.7, 1] }}
            transition={{ delay: 0.4, duration: 1 }}
          >
            ⚠ ACCÈS RESTREINT ⚠
          </motion.p>
        </div>

        <motion.div
          className="bg-forensics-bg-light border-2 border-forensics-cyan p-8 rounded-lg glow-cyan"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="matricule"
                className="block text-forensics-cyan text-sm font-mono mb-2 uppercase"
              >
                Matricule Agent
              </label>
              <input
                id="matricule"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-forensics-bg border border-forensics-cyan-dark text-white px-4 py-3 rounded font-mono focus:outline-none focus:border-forensics-cyan focus:glow-cyan transition-all"
                placeholder="Entrez votre matricule"
                required
                minLength={4}
                disabled={isLoading}
              />
            </div>

            <motion.button
              type="submit"
              className="w-full bg-forensics-cyan text-forensics-bg font-mono font-bold py-3 rounded uppercase tracking-wider hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
            >
              {isLoading ? 'VÉRIFICATION...' : 'ACCÉDER AU DOSSIER'}
            </motion.button>
          </form>

          <motion.p
            className="mt-6 text-gray-400 text-xs font-mono text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.6 }}
          >
            {scenario.subtitle.split('—')[1]?.trim() ?? 'Division Criminalistique Audio'}
          </motion.p>
        </motion.div>

        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-gray-500 text-sm font-mono">
            Mission : {scenario.missionBrief.mission}
            <br />
            Preuve : {scenario.missionBrief.evidence}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginScreen;
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --run src/components/Auth/LoginScreen.test.tsx
```

Expected: PASS (3 tests)

- [ ] **Step 5: Run lint**

```bash
npm run lint
```

Expected: 0 errors, 0 warnings

- [ ] **Step 6: Commit**

```bash
git add src/components/Auth/LoginScreen.tsx src/components/Auth/LoginScreen.test.tsx
git commit -m "feat: apply Brain City kids theme to LoginScreen"
```

---

## Task 6: `Dashboard` kids theme

**Files:**
- Modify: `src/components/Workspace/Dashboard.tsx`

Changes: kids header (Rex + stars), simplified mission brief, colored waveform section with Reverse button, `KidsToolPanel` instead of tabs, star-based clue tracker. The A/B comparison button is hidden for braincity.

- [ ] **Step 1: Add imports to `Dashboard.tsx`**

Add at the top of the imports block:

```tsx
import { useScenarioTheme } from '@/hooks/useScenarioTheme';
import RexBubble from '@/components/BrainCity/RexBubble';
import KidsToolPanel from '@/components/BrainCity/KidsToolPanel';
```

- [ ] **Step 2: Add `isBrainCity` to the component body**

After `const scenario = getScenario(scenarioId);` add:

```tsx
const { isBrainCity } = useScenarioTheme();
```

- [ ] **Step 3: Add Rex message logic**

After the `isBrainCity` line, add:

```tsx
const rexMessage = (() => {
  if (clueCount === 0) return '🎵 Écoute bien cet enregistrement — il y a un bruit bizarre caché dedans !';
  if (clueCount < 4) return `Ouaf ! J'ai trouvé ${clueCount} indice${clueCount > 1 ? 's' : ''} ! Continue à explorer les outils ! 🔍`;
  if (clueCount < totalClues) return `Super travail ! ${clueCount} indices trouvés ! Tu te rapproches du coupable ! 🐾`;
  return `Incroyable ! Tu as trouvé tous les indices ! Tu es prêt à accuser quelqu'un ? 🏆`;
})();
```

- [ ] **Step 4: Replace the header section**

Replace the entire `{/* ── HEADER ── */}` `<motion.header>` block (lines 115–173) with:

```tsx
{/* ── HEADER ── */}
<motion.header
  className={`flex items-center justify-between rounded-lg px-5 py-3 ${
    isBrainCity
      ? 'bg-white shadow-sm border border-sky-100'
      : 'bg-forensics-bg-light border border-forensics-cyan-dark'
  }`}
  initial={{ opacity: 0, y: -16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
>
  {isBrainCity ? (
    <>
      <div className="flex items-center gap-3">
        <span className="text-3xl">🐕</span>
        <div>
          <h1 className="text-xl font-black text-braincity-primary leading-none">BRAIN CITY 🏙️</h1>
          <p className="text-gray-400 text-xs font-semibold mt-0.5">Mission : Trouve l'agresseur !</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="text-braincity-primary font-bold text-base leading-none">
            {formattedCurrentTime}
          </div>
          <div className="text-gray-400 text-[10px] mt-0.5 font-semibold">PISTE</div>
        </div>
        {missionTimerEnabled && timeLeft !== null && (
          <div className="text-center">
            <div className={`font-bold text-base leading-none ${timerColor}`}>
              {formatTime(timeLeft)}
            </div>
            <div className="text-gray-400 text-[10px] mt-0.5 font-semibold">MISSION</div>
          </div>
        )}
        {/* Star-based clue progress */}
        <div className="flex gap-1">
          {clueTriggers.map(({ id }) => (
            <motion.span
              key={id}
              className="text-lg leading-none"
              animate={discoveredClues.includes(id) ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {discoveredClues.includes(id) ? '⭐' : '☆'}
            </motion.span>
          ))}
        </div>
        <motion.button
          onClick={handleContinueToSuspects}
          className="px-4 py-2 font-black rounded-2xl text-white text-sm"
          style={{ background: 'linear-gradient(90deg, #22d3ee, #84cc16)' }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          🎯 J'accuse !
        </motion.button>
      </div>
    </>
  ) : (
    <>
      <div>
        <h1 className="text-2xl font-bold text-forensics-cyan font-mono leading-none">
          {scenario.title.toUpperCase()}
        </h1>
        <p className="text-gray-500 font-mono text-xs mt-0.5">{scenario.subtitle}</p>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-forensics-cyan font-mono text-lg font-bold leading-none">
            {formattedCurrentTime} / {formattedDuration}
          </div>
          <div className="text-gray-600 font-mono text-[10px] mt-0.5">PISTE</div>
        </div>
        {missionTimerEnabled && timeLeft !== null && (
          <div className="text-center">
            <div className={`font-mono text-lg font-bold leading-none ${timerColor}`}>
              {formatTime(timeLeft)}
            </div>
            <div className="text-gray-600 font-mono text-[10px] mt-0.5">MISSION</div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {clueTriggers.map(({ id }) => (
              <div
                key={id}
                className={`w-2 h-2 rounded-full transition-all ${
                  discoveredClues.includes(id) ? 'bg-forensics-green' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-mono text-gray-400">
            {clueCount}/{totalClues} indices
          </span>
        </div>
        <motion.button
          onClick={handleContinueToSuspects}
          className="px-5 py-2 bg-forensics-green text-forensics-bg font-mono font-bold rounded uppercase tracking-wider text-sm hover:bg-white transition-colors"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          → Identifier le Suspect
        </motion.button>
      </div>
    </>
  )}
</motion.header>
```

- [ ] **Step 5: Replace the Mission brief block**

Replace the `{/* Mission brief */}` `<motion.div>` block with:

```tsx
{/* Mission brief */}
<motion.div
  className={`rounded-lg px-5 py-3 ${
    isBrainCity
      ? 'bg-white shadow-sm border border-sky-100'
      : 'bg-forensics-bg-light border border-forensics-cyan-dark'
  }`}
  initial={{ opacity: 0, x: -16 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: 0.1 }}
>
  {isBrainCity ? (
    <RexBubble message={rexMessage} />
  ) : (
    <div className="flex items-start gap-6 flex-wrap">
      <div className="flex items-center gap-2 text-sm font-mono">
        <span className="text-forensics-green text-xs">▸ CRIME</span>
        <span className="text-gray-300">{scenario.missionBrief.crime}</span>
      </div>
      <div className="flex items-center gap-2 text-sm font-mono">
        <span className="text-forensics-green text-xs">▸ PREUVE</span>
        <span className="text-gray-300">{scenario.missionBrief.evidence}</span>
      </div>
      <div className="flex items-center gap-2 text-sm font-mono">
        <span className="text-forensics-green text-xs">▸ MISSION</span>
        <span className="text-gray-300">{scenario.missionBrief.mission}</span>
      </div>
      <div className="flex items-center gap-2 text-sm font-mono ml-auto">
        <span className="px-2 py-0.5 bg-red-500/20 border border-red-500 rounded text-red-400 text-xs animate-pulse">
          🚨 URGENT
        </span>
      </div>
    </div>
  )}
</motion.div>
```

- [ ] **Step 6: Add Reverse button + conditional styling to Waveform block**

Replace the `{/* Waveform */}` `<motion.div>` block with:

```tsx
{/* Waveform */}
<motion.div
  className={`rounded-lg p-4 ${
    isBrainCity
      ? 'bg-white shadow-sm border border-sky-100'
      : 'bg-forensics-bg-light border border-forensics-cyan-dark'
  }`}
  initial={{ opacity: 0, x: -16 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: 0.2 }}
>
  <div className="flex items-center justify-between mb-3">
    {isBrainCity ? (
      <h3 className="text-sm font-bold text-braincity-primary">
        🎧 L'enregistrement mystère {isReversed && <span className="text-braincity-accent ml-2">🔄 INVERSÉ</span>}
      </h3>
    ) : (
      <h3 className="text-sm font-bold text-forensics-cyan font-mono tracking-wider">
        FORME D'ONDE {isReversed && <span className="text-forensics-orange ml-2">◀◀ INVERSÉE</span>}
      </h3>
    )}
    <div className="flex items-center gap-3">
      {isBrainCity ? (
        <motion.button
          onClick={() => { store.toggleReverse(); audioEngine.setReverse(!isReversed); }}
          className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition-all border-2 ${
            isReversed
              ? 'bg-orange-50 border-braincity-accent text-braincity-accent'
              : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
          }`}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          🔄 Inverser
        </motion.button>
      ) : (
        <>
          <button
            onClick={toggleComparison}
            className={`px-3 py-1 font-mono text-xs font-bold rounded border transition-all ${
              isComparisonMode
                ? 'bg-forensics-orange/20 border-forensics-orange text-forensics-orange'
                : 'bg-forensics-bg border-forensics-cyan-dark text-forensics-cyan hover:border-forensics-cyan'
            }`}
          >
            {isComparisonMode ? 'A/B: BYPASS' : 'A/B: FILTRES'}
          </button>
          <span className="text-gray-600 font-mono text-xs">Cliquez pour lire / pause</span>
        </>
      )}
    </div>
  </div>
  <Waveform audioUrl={activeAudioUrl} />
</motion.div>
```

Note: add `import { audioEngine } from '@/services/audioEngine';` at the top of the file if not already imported.

- [ ] **Step 7: Add conditional styling to Spectrogram and FrequencyBars sections**

Replace the `{/* Spectrogram */}` block:

```tsx
{/* Spectrogram */}
<motion.div
  className={`rounded-lg p-4 ${
    isBrainCity
      ? 'bg-white shadow-sm border border-sky-100'
      : 'bg-forensics-bg-light border border-forensics-cyan-dark'
  }`}
  initial={{ opacity: 0, x: -16 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: 0.3 }}
>
  <h3 className={`text-sm font-bold mb-3 ${isBrainCity ? 'text-braincity-primary' : 'text-forensics-cyan font-mono tracking-wider'}`}>
    {isBrainCity ? '📊 Les sons en image' : 'SPECTROGRAMME'}
  </h3>
  <Spectrogram audioUrl={activeAudioUrl} />
</motion.div>
```

Replace the `{/* Frequency Bars */}` block:

```tsx
{/* Frequency Bars */}
<motion.div
  className={`rounded-lg p-4 ${
    isBrainCity
      ? 'bg-white shadow-sm border border-sky-100'
      : 'bg-forensics-bg-light border border-forensics-cyan-dark'
  }`}
  initial={{ opacity: 0, x: -16 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: 0.4 }}
>
  <h3 className={`text-sm font-bold mb-3 ${isBrainCity ? 'text-braincity-primary' : 'text-forensics-cyan font-mono tracking-wider'}`}>
    {isBrainCity ? '🎼 Les fréquences' : 'ANALYSE FRÉQUENTIELLE'}
  </h3>
  <FrequencyBars isPlaying={isPlaying} width={800} height={120} />
</motion.div>
```

- [ ] **Step 8: Replace the Guide panel**

Replace `{/* Guide */}` block in the right column:

```tsx
{/* Guide */}
<motion.div
  className={`rounded-lg p-4 ${
    isBrainCity
      ? 'bg-white shadow-sm border border-sky-100'
      : 'bg-forensics-bg-light border border-forensics-cyan-dark'
  }`}
  initial={{ opacity: 0, x: 16 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: 0.15 }}
>
  <h3 className={`text-sm font-bold mb-3 ${isBrainCity ? 'text-braincity-primary' : 'text-forensics-cyan font-mono tracking-wider'}`}>
    {isBrainCity ? '📋 Les étapes' : 'GUIDE D\'ANALYSE'}
  </h3>
  <ol className="space-y-2">
    {analysisSteps.map((text, i) => {
      const done = stepsDone[i];
      return (
        <li
          key={i}
          className={`flex items-start gap-3 text-xs transition-colors ${
            isBrainCity
              ? done ? 'text-braincity-success font-semibold' : 'text-gray-400'
              : done ? 'text-forensics-green font-mono' : 'text-gray-500 font-mono'
          }`}
        >
          <span
            className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              isBrainCity
                ? done
                  ? 'bg-braincity-success text-white'
                  : 'border-2 border-gray-200 text-gray-400'
                : done
                ? 'border-forensics-green bg-forensics-green/20 text-forensics-green border'
                : 'border border-gray-600 text-gray-600'
            }`}
          >
            {done ? '✓' : i + 1}
          </span>
          <span className="leading-5">{text}</span>
        </li>
      );
    })}
  </ol>
</motion.div>
```

- [ ] **Step 9: Replace the Tools panel (tabs → KidsToolPanel)**

Replace the `{/* Tools */}` `<motion.div>` block:

```tsx
{/* Tools */}
<motion.div
  className={`rounded-lg overflow-hidden ${
    isBrainCity
      ? 'bg-white shadow-sm border border-sky-100'
      : 'bg-forensics-bg-light border border-forensics-cyan-dark'
  }`}
  initial={{ opacity: 0, x: 16 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: 0.35 }}
>
  {isBrainCity ? (
    <div className="p-4">
      <KidsToolPanel />
    </div>
  ) : (
    <>
      <div className="flex border-b border-forensics-cyan-dark">
        {(
          [
            { key: 'filtres', label: 'FILTRES' },
            { key: 'pitch', label: 'PITCH' },
            { key: 'avance', label: 'PARAMÈTRES' },
          ] as { key: ToolTab; label: string }[]
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 py-2.5 text-xs font-mono font-bold tracking-wider transition-colors ${
              activeTab === key
                ? 'bg-forensics-cyan/10 text-forensics-cyan border-b-2 border-forensics-cyan'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="p-4 max-h-[520px] overflow-y-auto">
        {activeTab === 'filtres' && <FilterPanel />}
        {activeTab === 'pitch' && <PitchControl />}
        {activeTab === 'avance' && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-forensics-cyan font-mono tracking-wider">
              PARAMÈTRES ACTIFS
            </h4>
            <ParameterDisplay />
          </div>
        )}
      </div>
    </>
  )}
</motion.div>
```

- [ ] **Step 10: Replace the Clue Tracker panel**

Replace `{/* Clue Tracker */}` block:

```tsx
{/* Clue Tracker */}
<motion.div
  className={`rounded-lg p-4 ${
    isBrainCity
      ? 'bg-white shadow-sm border border-sky-100'
      : 'bg-forensics-bg-light border border-forensics-cyan-dark'
  }`}
  initial={{ opacity: 0, x: 16 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: 0.45 }}
>
  <div className="flex items-center justify-between mb-3">
    <h3 className={`text-sm font-bold ${isBrainCity ? 'text-braincity-primary' : 'text-forensics-cyan font-mono tracking-wider'}`}>
      {isBrainCity ? '⭐ Tes indices trouvés' : 'INDICES'}
    </h3>
    <span className={`text-xs ${isBrainCity ? 'text-gray-400 font-semibold' : 'text-gray-500 font-mono'}`}>
      {clueCount}/{totalClues}
    </span>
  </div>
  <div className="grid grid-cols-2 gap-2">
    {clueTriggers.map(({ id, label, hint }) => {
      const found = discoveredClues.includes(id);
      return (
        <motion.div
          key={id}
          className={`flex items-start gap-2 p-2 rounded-xl border text-[11px] transition-all ${
            isBrainCity
              ? found
                ? 'border-yellow-200 bg-yellow-50 text-yellow-700'
                : 'border-dashed border-gray-200 text-gray-300'
              : found
              ? 'border-forensics-green/40 bg-forensics-green/5 text-forensics-green font-mono'
              : 'border-gray-800 text-gray-700 font-mono'
          }`}
          animate={found && isBrainCity ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <span className="flex-shrink-0 mt-0.5">
            {isBrainCity ? (found ? '⭐' : '☆') : (found ? '✓' : '○')}
          </span>
          <div className="min-w-0">
            <div className="leading-tight">{found ? label : '???'}</div>
            {found && (
              <div className={`text-[10px] mt-0.5 ${isBrainCity ? 'text-yellow-500' : 'text-gray-500'}`}>
                {hint}
              </div>
            )}
          </div>
        </motion.div>
      );
    })}
  </div>
</motion.div>
```

- [ ] **Step 11: Update the Continue CTA**

Replace the final `{/* Continue CTA */}` block:

```tsx
{/* Continue CTA */}
<motion.div
  initial={{ opacity: 0, x: 16 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: 0.55 }}
>
  <button
    onClick={handleContinueToSuspects}
    className={`w-full font-bold py-4 rounded-2xl uppercase tracking-wider text-sm transition-colors ${
      isBrainCity
        ? 'text-white'
        : 'bg-forensics-green text-forensics-bg font-mono hover:bg-white'
    }`}
    style={isBrainCity ? { background: 'linear-gradient(90deg, #22d3ee, #84cc16)' } : {}}
  >
    {isBrainCity ? '🎯 J\'accuse !' : '→ Identifier le Suspect'}
  </button>
  <p className={`text-xs text-center mt-1.5 ${isBrainCity ? 'text-gray-400 font-semibold' : 'text-gray-600 font-mono'}`}>
    {isBrainCity ? 'Tu penses savoir qui c\'est ?' : 'Passez à la comparaison vocale'}
  </p>
</motion.div>
```

- [ ] **Step 12: Run lint**

```bash
npm run lint
```

Expected: 0 errors, 0 warnings

- [ ] **Step 13: Commit**

```bash
git add src/components/Workspace/Dashboard.tsx
git commit -m "feat: apply Brain City kids theme to Dashboard"
```

---

## Task 7: `SuspectGrid` kids theme

**Files:**
- Modify: `src/components/Suspects/SuspectGrid.tsx`

Changes: kids header + Rex bubble, emoji-based suspect cards (no photo), simplified buttons ("▶ Écouter sa voix", "🎯 C'est lui/elle !"), simpler confirmation dialog, no Notes button.

- [ ] **Step 1: Add imports**

Add at the top of `src/components/Suspects/SuspectGrid.tsx`:

```tsx
import { useScenarioTheme } from '@/hooks/useScenarioTheme';
import RexBubble from '@/components/BrainCity/RexBubble';
```

- [ ] **Step 2: Add a role→emoji helper and `isBrainCity` at the top of `SuspectGrid`**

After `const scenario = getScenario(scenarioId);` add:

```tsx
const { isBrainCity } = useScenarioTheme();

const roleEmoji: Record<string, string> = {
  'suspect-bc-1': '👷',
  'suspect-bc-2': '🧑‍🍳',
  'suspect-bc-3': '🧑‍🎓',
  'suspect-bc-4': '👩‍⚕️',
};

const cardGradient: Record<string, string> = {
  'suspect-bc-1': 'linear-gradient(135deg, #fed7aa, #fbbf24)',
  'suspect-bc-2': 'linear-gradient(135deg, #c7d2fe, #818cf8)',
  'suspect-bc-3': 'linear-gradient(135deg, #bbf7d0, #34d399)',
  'suspect-bc-4': 'linear-gradient(135deg, #fce7f3, #f472b6)',
};
```

- [ ] **Step 3: Replace the header block**

Replace `{/* Header */}` `<motion.header>` block:

```tsx
{/* Header */}
<motion.header
  className="mb-8"
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
>
  {isBrainCity ? (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-4xl">🐕</span>
        <div>
          <h1 className="text-3xl font-black text-braincity-primary">Qui a fait ça ? 🤔</h1>
          <p className="text-gray-400 font-semibold text-sm">{scenario.title}</p>
        </div>
      </div>
      <RexBubble message="🎧 Clique sur ▶ pour écouter chaque voix — compare avec l'enregistrement !" />
    </div>
  ) : (
    <>
      <h1 className="text-4xl font-bold text-forensics-cyan font-mono mb-1">
        IDENTIFICATION SUSPECT
      </h1>
      <p className="text-gray-400 font-mono text-sm">{scenario.title}</p>
    </>
  )}
</motion.header>
```

- [ ] **Step 4: Replace the Instructions block**

Replace `{/* Instructions */}` `<motion.div>` block:

```tsx
{!isBrainCity && (
  <motion.div
    className="bg-forensics-cyan/10 border border-forensics-cyan rounded-lg p-4 mb-8"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.2 }}
  >
    <p className="text-forensics-cyan font-mono text-sm">
      Écoutez attentivement chaque voix — les filtres actifs s'appliquent. Prenez des notes. Lorsque vous êtes certain, cliquez sur "IDENTIFIER".
    </p>
  </motion.div>
)}
```

- [ ] **Step 5: Replace the suspect card content**

Inside the `.map((suspect, index) => {` callback, replace the card JSX. The outer `<motion.div>` container stays, but replace everything inside:

```tsx
<motion.div
  key={suspect.id}
  className={`rounded-2xl overflow-hidden transition-all ${
    isBrainCity
      ? `bg-white shadow-md border-2 ${suspect.isIdentified ? 'border-braincity-success' : 'border-gray-100'} hover:shadow-lg`
      : `bg-forensics-bg-light border-2 rounded-lg ${
          suspect.isIdentified ? 'border-forensics-green' : 'border-forensics-cyan-dark'
        } hover:border-forensics-cyan`
  }`}
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.1 }}
>
  {/* Photo / emoji */}
  {isBrainCity ? (
    <div
      className="h-28 flex items-center justify-center text-5xl"
      style={{ background: cardGradient[suspect.id] ?? 'linear-gradient(135deg, #e2e8f0, #cbd5e1)' }}
    >
      {roleEmoji[suspect.id] ?? '🧑'}
      {suspect.isIdentified && (
        <div className="absolute inset-0 bg-braincity-success/20 flex items-center justify-center rounded-t-2xl">
          <span className="text-5xl">✅</span>
        </div>
      )}
    </div>
  ) : (
    <div className="relative aspect-square bg-gray-800">
      <img
        src={suspect.photoUrl}
        alt={suspect.name}
        className="w-full h-full object-cover opacity-80"
      />
      {suspect.isIdentified && (
        <div className="absolute inset-0 bg-forensics-green/20 flex items-center justify-center">
          <span className="text-6xl">✓</span>
        </div>
      )}
    </div>
  )}

  {/* Info */}
  <div className="p-4">
    <h3 className={`text-lg font-bold mb-0.5 ${isBrainCity ? 'text-gray-800' : 'text-forensics-cyan font-mono'}`}>
      {suspect.name}
    </h3>
    <p className={`text-sm mb-3 ${isBrainCity ? 'text-gray-500 font-medium' : 'text-gray-400 font-mono'}`}>
      {suspect.role}
    </p>

    {/* Match score */}
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className={isBrainCity ? 'text-gray-400 font-semibold' : 'text-gray-500 font-mono'}>
          {isBrainCity ? 'Ressemblance vocale' : 'CONCORDANCE VOCALE'}
        </span>
        <span className={`font-bold ${scenario.matchScores[suspect.id] >= 80 ? 'text-red-500' : isBrainCity ? 'text-gray-400' : 'text-gray-500 font-mono'}`}>
          {scenario.matchScores[suspect.id]}%
        </span>
      </div>
      <div className={`h-2 rounded-full overflow-hidden ${isBrainCity ? 'bg-gray-100' : 'bg-forensics-bg'}`}>
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${scenario.matchScores[suspect.id]}%`,
            background: scenario.matchScores[suspect.id] >= 80
              ? 'linear-gradient(90deg, #f97316, #ef4444)'
              : isBrainCity
              ? 'linear-gradient(90deg, #22d3ee, #84cc16)'
              : undefined,
          }}
          {...(!isBrainCity && {
            className: `h-full rounded-full transition-all duration-1000 ${
              scenario.matchScores[suspect.id] >= 80
                ? 'bg-forensics-red'
                : scenario.matchScores[suspect.id] >= 40
                ? 'bg-forensics-orange'
                : 'bg-forensics-cyan-dark'
            }`,
          })}
        />
      </div>
    </div>

    {/* Notes indicator — adult only */}
    {!isBrainCity && storedNote && (
      <div className="mb-3 p-2 bg-forensics-cyan/10 border border-forensics-cyan-dark rounded">
        <p className="text-xs text-gray-400 font-mono truncate">📝 {storedNote}</p>
      </div>
    )}

    {/* Actions */}
    <div className="space-y-2">
      <button
        onClick={() => handlePlayVoice(suspect)}
        disabled={!suspectAudioUrls[suspect.id]}
        className={`w-full px-3 py-2 font-bold text-sm rounded-xl transition-all border-2 ${
          isBrainCity
            ? playingId === suspect.id
              ? 'bg-braincity-primary text-white border-braincity-primary'
              : 'bg-sky-50 border-sky-200 text-braincity-primary hover:border-braincity-primary'
            : playingId === suspect.id
            ? 'bg-forensics-cyan text-forensics-bg border-forensics-cyan font-mono'
            : 'bg-forensics-bg border-forensics-cyan-dark text-forensics-cyan font-mono hover:border-forensics-cyan'
        } disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {playingId === suspect.id
          ? (isBrainCity ? '⏹ Stop' : '⏹ STOP VOIX')
          : (isBrainCity ? '▶ Écouter sa voix' : '▶ ÉCOUTER (FILTRES ON)')}
      </button>

      {!isBrainCity && (
        <button
          onClick={() => { setSelectedSuspect(suspect); setShowNotesModal(true); }}
          className="w-full px-3 py-2 bg-forensics-bg border border-forensics-cyan-dark text-forensics-cyan font-mono text-sm rounded hover:border-forensics-cyan transition-all"
        >
          NOTES
        </button>
      )}

      <button
        onClick={() => { setIdentifiedSuspect(suspect); setShowConfirmDialog(true); }}
        disabled={suspect.isIdentified}
        className={`w-full px-3 py-2 font-bold text-sm rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          isBrainCity
            ? 'text-white'
            : 'bg-forensics-green text-forensics-bg font-mono hover:bg-white'
        }`}
        style={isBrainCity ? { background: 'linear-gradient(90deg, #f97316, #ef4444)' } : {}}
      >
        {suspect.isIdentified
          ? (isBrainCity ? '✅ Accusé !' : '✓ IDENTIFIÉ')
          : (isBrainCity
            ? `🎯 C'est ${suspect.name.split(' ')[0]} !`
            : '🎯 IDENTIFIER')}
      </button>
    </div>
  </div>
</motion.div>
```

- [ ] **Step 6: Replace the confirmation dialog**

Replace the `{showConfirmDialog && identifiedSuspect && (` block in AnimatePresence:

```tsx
{showConfirmDialog && identifiedSuspect && (
  <motion.div
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className={`p-6 max-w-md w-full rounded-2xl ${
        isBrainCity
          ? 'bg-white shadow-2xl'
          : 'bg-forensics-bg-light border-2 border-red-500'
      }`}
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
    >
      {isBrainCity ? (
        <>
          <div className="text-center mb-4">
            <div className="text-5xl mb-2">🤔</div>
            <h3 className="text-xl font-black text-gray-800">
              Tu es sûr(e) que c'est {identifiedSuspect.name} ?
            </h3>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={confirmIdentification}
              className="flex-1 text-white font-black py-3 rounded-2xl"
              style={{ background: 'linear-gradient(90deg, #f97316, #ef4444)' }}
            >
              🎯 OUI, j'accuse !
            </button>
            <button
              onClick={() => setShowConfirmDialog(false)}
              className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-2xl hover:bg-gray-200 transition-colors"
            >
              Non, je cherche encore
            </button>
          </div>
        </>
      ) : (
        <>
          <h3 className="text-2xl font-bold text-red-500 font-mono mb-4">⚠️ CONFIRMATION</h3>
          <p className="text-white font-mono mb-6">
            Êtes-vous certain d'identifier{' '}
            <strong className="text-forensics-cyan">{identifiedSuspect.name}</strong> ?
          </p>
          <p className="text-gray-400 font-mono text-sm mb-6">
            Cette action est irréversible et déterminera le résultat de l'enquête.
          </p>
          <div className="flex gap-3">
            <button
              onClick={confirmIdentification}
              className="flex-1 bg-red-500 text-white font-mono font-bold py-3 rounded hover:bg-red-600 transition-colors"
            >
              CONFIRMER
            </button>
            <button
              onClick={() => setShowConfirmDialog(false)}
              className="flex-1 bg-gray-700 text-white font-mono font-bold py-3 rounded hover:bg-gray-600 transition-colors"
            >
              ANNULER
            </button>
          </div>
        </>
      )}
    </motion.div>
  </motion.div>
)}
```

- [ ] **Step 7: Update the Back button**

Replace the `{/* Back */}` block:

```tsx
<motion.div
  className="mt-8 text-center"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.5 }}
>
  <button
    onClick={() => navigate('/workspace')}
    className={`px-6 py-3 rounded-2xl font-bold transition-all ${
      isBrainCity
        ? 'bg-white border-2 border-sky-200 text-braincity-primary hover:bg-sky-50'
        : 'bg-forensics-bg-light border border-forensics-cyan text-forensics-cyan font-mono hover:bg-forensics-cyan hover:text-forensics-bg'
    }`}
  >
    {isBrainCity ? '← Retour à l\'analyse' : '← RETOUR À L\'ANALYSE'}
  </button>
</motion.div>
```

- [ ] **Step 8: Run lint**

```bash
npm run lint
```

Expected: 0 errors, 0 warnings

- [ ] **Step 9: Commit**

```bash
git add src/components/Suspects/SuspectGrid.tsx
git commit -m "feat: apply Brain City kids theme to SuspectGrid"
```

---

## Task 8: `ResultScreen` kids theme

**Files:**
- Modify: `src/components/Debrief/ResultScreen.tsx`

Changes: confetti emojis, Rex in victory/defeat, score as 4 colored tiles, "Imprimer mon diplôme" button, kids failure message with Rex hint.

- [ ] **Step 1: Add imports**

Add at the top of `src/components/Debrief/ResultScreen.tsx`:

```tsx
import { useScenarioTheme } from '@/hooks/useScenarioTheme';
import RexBubble from '@/components/BrainCity/RexBubble';
```

- [ ] **Step 2: Add `isBrainCity` to the component body**

After `const scenario = getScenario(scenarioId);` add:

```tsx
const { isBrainCity } = useScenarioTheme();
```

- [ ] **Step 3: Replace the analyzing animation**

Replace the `{!showResult && (` AnimatePresence block:

```tsx
<AnimatePresence>
  {!showResult && (
    <motion.div
      className="text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {isBrainCity ? (
        <>
          <motion.div
            className="text-7xl mb-4"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            🐕
          </motion.div>
          <h2 className="text-2xl font-black text-braincity-primary mt-4">
            Rex analyse ta réponse…
          </h2>
          <p className="text-gray-400 font-semibold mt-2">Comparaison des voix en cours !</p>
        </>
      ) : (
        <>
          <motion.div
            className="inline-block"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <span className="text-6xl">⚙</span>
          </motion.div>
          <h2 className="text-2xl font-bold text-forensics-cyan font-mono mt-6">
            ANALYSE VOCALE EN COURS...
          </h2>
          <p className="text-gray-400 font-mono mt-2">Comparaison des empreintes vocales</p>
          <div className="mt-8 flex items-center justify-center gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-8 bg-forensics-cyan rounded"
                animate={{ height: [32, 8, 32] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
        </>
      )}
    </motion.div>
  )}
</AnimatePresence>
```

- [ ] **Step 4: Replace the result section**

Replace the `{showResult && (` AnimatePresence block entirely:

```tsx
<AnimatePresence>
  {showResult && (
    <motion.div
      id="rapport-pdf"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {isBrainCity ? (
        /* ── KIDS RESULT ── */
        <>
          {/* Confetti */}
          {isCorrect && (
            <div className="text-center text-3xl tracking-widest">
              🎉🎊🎈🎊🎉
            </div>
          )}

          {/* Rex verdict */}
          <motion.div
            className="text-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <motion.div
              className="text-7xl mb-2"
              animate={isCorrect ? { rotate: [0, 10, -10, 0] } : { rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.5, repeat: isCorrect ? 0 : 3 }}
            >
              🐕
            </motion.div>
            <h1
              className="text-4xl font-black mb-2"
              style={{ color: isCorrect ? '#16a34a' : '#ea580c' }}
            >
              {isCorrect ? 'BRAVO ! 🎉' : 'Pas tout à fait… 🤔'}
            </h1>
            <p className="text-lg font-bold text-braincity-primary">
              {isCorrect ? 'Tu as trouvé le coupable !' : `Ce n'est pas le bon suspect !`}
            </p>
          </motion.div>

          {/* Rex message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <RexBubble
              message={
                isCorrect
                  ? scenario.successStory
                  : scenario.failureMessage
              }
            />
          </motion.div>

          {/* Score tiles */}
          {isCorrect && (
            <motion.div
              className="bg-white rounded-2xl p-5 shadow-sm border border-sky-100"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-sm font-black text-braincity-primary mb-4">📊 Ton score de détective</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-black text-braincity-success">
                    {discoveredClues.length}/{scenario.clueTriggers.length}
                  </div>
                  <div className="text-xs text-gray-400 font-semibold mt-0.5">Indices trouvés ⭐</div>
                </div>
                <div className="bg-sky-50 rounded-xl p-3 text-center">
                  <div className="text-2xl font-black text-braincity-primary">
                    {suspect ? scenario.matchScores[suspect.id] : 0}%
                  </div>
                  <div className="text-xs text-gray-400 font-semibold mt-0.5">Correspondance vocale 🎵</div>
                </div>
                {missionElapsed !== null && (
                  <div className="bg-yellow-50 rounded-xl p-3 text-center">
                    <div className="text-2xl font-black text-braincity-warning">
                      {formatTime(missionElapsed)}
                    </div>
                    <div className="text-xs text-gray-400 font-semibold mt-0.5">Temps de mission ⏱️</div>
                  </div>
                )}
                {isReversed && (
                  <div className="bg-purple-50 rounded-xl p-3 text-center">
                    <div className="text-2xl font-black text-braincity-violet">✅</div>
                    <div className="text-xs text-gray-400 font-semibold mt-0.5">Message décodé 🔄</div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            className="flex flex-col gap-3 print:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <button
              onClick={handleRestart}
              className="w-full py-3 text-white font-black rounded-2xl text-sm"
              style={{ background: 'linear-gradient(90deg, #22d3ee, #84cc16)' }}
            >
              {isCorrect ? '🏠 Retour à l\'accueil' : '🔄 Réessayer'}
            </button>
            {!isCorrect && (
              <button
                onClick={() => navigate('/suspects')}
                className="w-full py-3 bg-white border-2 border-sky-200 text-braincity-primary font-bold rounded-2xl hover:bg-sky-50 transition-colors text-sm"
              >
                ← Retour aux suspects
              </button>
            )}
            {isCorrect && (
              <button
                onClick={handleExportPDF}
                className="w-full py-3 bg-white border-2 border-sky-200 text-braincity-primary font-bold rounded-2xl hover:bg-sky-50 transition-colors text-sm print:hidden"
              >
                📄 Imprimer mon diplôme de détective
              </button>
            )}
          </motion.div>
        </>
      ) : (
        /* ── ADULT RESULT (unchanged) ── */
        <>
          {/* Verdict header */}
          <motion.div
            className="text-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <motion.div
              className="text-9xl mb-4"
              animate={isCorrect ? { rotate: [0, 10, -10, 0] } : { rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.5, repeat: isCorrect ? 0 : 3 }}
            >
              {isCorrect ? '✓' : '✗'}
            </motion.div>
            <h1
              className={`text-5xl font-bold font-mono mb-3 ${
                isCorrect ? 'text-forensics-green' : 'text-red-500'
              }`}
            >
              {isCorrect ? scenario.successTitle : scenario.failureTitle}
            </h1>
            <p className="text-xl text-gray-300 font-mono">
              {isCorrect
                ? `Identification positive : `
                : `${suspect.name} n'est pas coupable`}
              {isCorrect && (
                <span className="text-forensics-cyan">{suspect.name}</span>
              )}
            </p>
          </motion.div>

          {/* Analysis report */}
          <motion.div
            className={`border-2 rounded-lg p-6 ${
              isCorrect
                ? 'bg-forensics-green/10 border-forensics-green'
                : 'bg-red-500/10 border-red-500'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2
              className={`text-xl font-bold font-mono mb-4 ${
                isCorrect ? 'text-forensics-green' : 'text-red-500'
              }`}
            >
              📊 RAPPORT D'ANALYSE — {scenario.title}
            </h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Suspect identifié :</span>
                <span className={isCorrect ? 'text-forensics-green font-bold' : 'text-red-500 font-bold'}>
                  {suspect.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Match vocal :</span>
                <span className={isCorrect ? 'text-forensics-green font-bold' : 'text-red-500 font-bold'}>
                  {suspect ? scenario.matchScores[suspect.id] : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Signature spectrale :</span>
                <span className={isCorrect ? 'text-forensics-green font-bold' : 'text-red-500 font-bold'}>
                  {isCorrect ? 'POSITIVE' : 'NÉGATIVE'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Indices découverts :</span>
                <span className="text-forensics-cyan font-bold">
                  {discoveredClues.length}/{scenario.clueTriggers.length}
                </span>
              </div>
              {pitchShift.semitones !== 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Correction pitch :</span>
                  <span className="text-forensics-cyan font-bold">
                    {pitchShift.semitones > 0 ? '+' : ''}{pitchShift.semitones} ST
                  </span>
                </div>
              )}
              {lowPassFilter.enabled && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Filtre LP :</span>
                  <span className="text-forensics-cyan font-bold">{Math.round(lowPassFilter.frequency)} Hz</span>
                </div>
              )}
              {highPassFilter.enabled && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Filtre HP :</span>
                  <span className="text-forensics-cyan font-bold">{Math.round(highPassFilter.frequency)} Hz</span>
                </div>
              )}
              {isReversed && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Message inversé :</span>
                  <span className="text-forensics-orange font-bold">DÉCODÉ</span>
                </div>
              )}
              {missionElapsed !== null && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Temps de mission :</span>
                  <span className={`font-bold ${missionElapsed <= missionDuration ? 'text-forensics-green' : 'text-red-500'}`}>
                    {formatTime(missionElapsed)} / {formatTime(missionDuration)}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Narrative */}
          <motion.div
            className={`bg-forensics-bg-light border rounded-lg p-5 ${
              isCorrect ? 'border-forensics-cyan' : 'border-red-500'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3
              className={`text-lg font-bold font-mono mb-3 ${
                isCorrect ? 'text-forensics-cyan' : 'text-red-500'
              }`}
            >
              {isCorrect ? '🏆 MISSION ACCOMPLIE' : '📨 MESSAGE'}
            </h3>
            <p className="text-gray-300 font-mono text-sm italic">
              {isCorrect ? scenario.successStory : scenario.failureMessage}
            </p>
          </motion.div>

          {/* Actions */}
          <motion.div
            className="flex gap-4 justify-center flex-wrap print:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <button
              onClick={handleRestart}
              className="px-8 py-3 bg-forensics-cyan text-forensics-bg font-mono font-bold rounded-lg hover:bg-white transition-all"
            >
              {isCorrect ? '🏠 RETOUR ACCUEIL' : '🔄 RÉESSAYER'}
            </button>
            {!isCorrect && (
              <button
                onClick={() => navigate('/suspects')}
                className="px-8 py-3 bg-forensics-bg-light border-2 border-forensics-cyan text-forensics-cyan font-mono font-bold rounded-lg hover:bg-forensics-cyan hover:text-forensics-bg transition-all"
              >
                ← RETOUR SUSPECTS
              </button>
            )}
            <button
              onClick={handleExportPDF}
              className="px-8 py-3 bg-forensics-bg-light border-2 border-forensics-orange text-forensics-orange font-mono font-bold rounded-lg hover:bg-forensics-orange hover:text-forensics-bg transition-all"
            >
              📄 EXPORTER PDF
            </button>
          </motion.div>
        </>
      )}
    </motion.div>
  )}
</AnimatePresence>
```

- [ ] **Step 5: Run lint**

```bash
npm run lint
```

Expected: 0 errors, 0 warnings

- [ ] **Step 6: Run all tests**

```bash
npm test -- --run
```

Expected: all tests pass

- [ ] **Step 7: Build check**

```bash
npm run build
```

Expected: build succeeds with no TypeScript errors

- [ ] **Step 8: Commit**

```bash
git add src/components/Debrief/ResultScreen.tsx
git commit -m "feat: apply Brain City kids theme to ResultScreen"
```

---

## Self-Review

### Spec coverage check

| Spec requirement | Task |
|-----------------|------|
| Login: Rex, nuages, gradient bleu ciel, champ arrondi "Ton prénom d'agent" | Task 5 |
| Login: Bouton "🚀 COMMENCER L'ENQUÊTE !" gradient | Task 5 |
| Dashboard: Rex header + bulle contextuelle | Task 6 |
| Dashboard: Étoiles ⭐ au lieu des points pour indices | Task 6 |
| Dashboard: "🎯 J'accuse !" au lieu de "→ Identifier" | Task 6 |
| Dashboard: 4 boutons imagés (Sons graves, Sons aigus, Nettoyer, Amplifier) | Task 3 + Task 6 |
| Dashboard: Waveform colorée + bouton Inverser | Task 6 |
| Suspects: Rex + "Qui a fait ça ?" | Task 7 |
| Suspects: Emoji en fond coloré au lieu de photo | Task 7 |
| Suspects: "▶ Écouter sa voix" / "🎯 C'est lui !" | Task 7 |
| Suspects: Dialog simplifié "Tu es sûr(e) ?" | Task 7 |
| Suspects: Suppression champ Notes | Task 7 |
| Debrief victoire: Confettis + Rex + BRAVO | Task 8 |
| Debrief victoire: 4 tuiles score colorées | Task 8 |
| Debrief victoire: "Imprimer mon diplôme de détective" | Task 8 |
| Debrief échec: Rex avec indice, "Pas tout à fait…" | Task 8 |
| AppLayout: Pas de scanlines, fond gradient braincity | Task 4 |
| Corbeau theme: inchangé dans tous les écrans | All tasks (isBrainCity guard) |

### Type consistency check

- `useScenarioTheme()` returns `{ isBrainCity: boolean, scenarioId: ScenarioId }` — used consistently in all components
- `RexBubble` props: `{ message: string }` — used consistently
- `KidsToolPanel` has no props — uses store directly via hooks
- `roleEmoji` and `cardGradient` keyed on `suspect.id` strings — match `'suspect-bc-1'` etc. from scenarios data

### Placeholder scan

No TBDs, TODOs, or incomplete steps found. All code blocks are complete.
