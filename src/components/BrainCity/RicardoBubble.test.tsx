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
