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
