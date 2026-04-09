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
    // pitch at -1 → proximity = 1 - ((-1+2)/6) = 1 - 0.167 = 0.83 → very hot
    act(() => {
      useAudioStore.getState().setPitchShift({ semitones: -1 });
    });
    expect(result.current.emotion).toBe('excited');
    expect(result.current.message).toContain('CHAUD');
  });

  it('returns triumphant isEvent when a clue is discovered', () => {
    const { result } = renderHook(() => useRicardo());
    act(() => {
      useAudioStore.getState().addClue('cles-chantier');
    });
    expect(result.current.emotion).toBe('triumphant');
    expect(result.current.isEvent).toBe(true);
    expect(result.current.eventTitle).toBe('INDICE TROUVÉ !');
  });

  it('event clears after 2500ms', () => {
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
    expect(result.current.message).toContain('tous les indices');
  });
});
