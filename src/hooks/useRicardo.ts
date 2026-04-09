import { useState, useEffect, useRef } from 'react';
import { useAudioStore } from '@/stores/audioStore';
import { getScenario } from '@/data/scenarios';

export type RicardoEmotion = 'neutral' | 'excited' | 'thinking' | 'panicking' | 'triumphant' | 'scared';

export interface RicardoState {
  message: string;
  emotion: RicardoEmotion;
  isEvent: boolean;
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
      isEvent: true,
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
      dismissEvent: dismiss,
    };
  }

  // Priority 4 & 5: Hot/Very hot signal
  let maxProximity = 0;
  for (const clue of undiscovered) {
    if (clue.proximity && !clue.check(store)) {
      const p = clue.proximity(store);
      if (p > maxProximity) maxProximity = p;
    }
  }

  if (maxProximity >= 0.8) {
    return {
      message: ricardoLines?.veryHot ?? 'TRÈS CHAUD !! Encore un tout petit peu…',
      emotion: 'excited',
      isEvent: false,
      dismissEvent: dismiss,
    };
  }

  if (maxProximity >= 0.6) {
    return {
      message: ricardoLines?.hot ?? "Chaud ! Tu t'approches de quelque chose !",
      emotion: 'excited',
      isEvent: false,
      dismissEvent: dismiss,
    };
  }

  // Priority 6: Filter comment (5s window after activation)
  if (lastFilter && ricardoLines?.filters[lastFilter]) {
    return {
      message: ricardoLines.filters[lastFilter],
      emotion: 'thinking',
      isEvent: false,
      dismissEvent: dismiss,
    };
  }

  // Priority 7: Play started (no clues yet)
  if (isPlaying && clueCount === 0 && ricardoLines?.play) {
    return {
      message: ricardoLines.play,
      emotion: 'neutral',
      isEvent: false,
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
      dismissEvent: dismiss,
    };
  }

  return {
    message: nextClue?.ricardoHint
      ? `${clueCount}/${totalClues} indices ! 👉 ${nextClue.ricardoHint}`
      : `Super ! ${clueCount} indices trouvés sur ${totalClues} !`,
    emotion: 'neutral',
    isEvent: false,
    dismissEvent: dismiss,
  };
}
