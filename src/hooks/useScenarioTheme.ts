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
