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
