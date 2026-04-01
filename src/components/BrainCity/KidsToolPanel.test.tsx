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
    localStorage.removeItem('audio-storage');
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
