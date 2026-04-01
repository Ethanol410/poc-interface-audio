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
