/**
 * Stream Deck+ mapping configuration — buttons (8) and dials/encoders (4).
 * Two pages: Page A (filters) and Page B (advanced controls).
 * Data-driven: change these to reconfigure the hardware controls.
 */

export type ButtonAction =
  | 'toggle-play'
  | 'toggle-reverse'
  | 'toggle-lowpass'
  | 'toggle-highpass'
  | 'toggle-bandpass'
  | 'toggle-notch'
  | 'toggle-compressor'
  | 'toggle-comparison'
  | 'reset-all-filters'
  | 'apply-preset-clear'
  | 'apply-preset-masque'
  | 'apply-preset-analyse'
  | 'switch-page';

export type DialAction =
  | 'set-volume'
  | 'set-lowpass-freq'
  | 'set-highpass-freq'
  | 'set-pitch'
  | 'set-bandpass-freq'
  | 'set-notch-freq'
  | 'set-speed';

export type DialPushAction =
  | 'mute-toggle'
  | 'toggle-lowpass'
  | 'toggle-highpass'
  | 'reset-pitch'
  | 'toggle-bandpass'
  | 'toggle-notch'
  | 'reset-speed';

export interface ButtonMapping {
  index: number;
  action: ButtonAction;
  label: string;
  icon: string;
  colorOn: string;  // hex
  colorOff: string; // hex
}

export interface DialMapping {
  index: number;
  action: DialAction;
  pushAction: DialPushAction;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
}

// ─── Page A — Filtres (défaut) ─────────────────────────────────────────────

export const PAGE_A_BUTTONS: ButtonMapping[] = [
  { index: 0, action: 'toggle-play',       label: 'LECTURE', icon: '▶',  colorOn: '#00ff88', colorOff: '#1a1a2e' },
  { index: 1, action: 'toggle-reverse',    label: 'INVERSE', icon: '◀◀', colorOn: '#ff8800', colorOff: '#1a1a2e' },
  { index: 2, action: 'toggle-lowpass',    label: 'GRAVES',  icon: '🔉', colorOn: '#00d4ff', colorOff: '#1a1a2e' },
  { index: 3, action: 'toggle-highpass',   label: 'AIGUS',   icon: '🔈', colorOn: '#4ade80', colorOff: '#1a1a2e' },
  { index: 4, action: 'toggle-bandpass',   label: 'VOIX',    icon: '🎤', colorOn: '#fbbf24', colorOff: '#1a1a2e' },
  { index: 5, action: 'toggle-notch',      label: 'BUZZ',    icon: '⚡', colorOn: '#f87171', colorOff: '#1a1a2e' },
  { index: 6, action: 'toggle-compressor', label: 'MURMURE', icon: '📢', colorOn: '#c084fc', colorOff: '#1a1a2e' },
  { index: 7, action: 'switch-page',       label: 'AVANCÉ',  icon: '▼',  colorOn: '#4a7090', colorOff: '#162535' },
];

export const PAGE_A_DIALS: DialMapping[] = [
  { index: 0, action: 'set-volume',        pushAction: 'mute-toggle',    label: 'VOLUME',  min: 0,   max: 1,     step: 0.02, unit: '' },
  { index: 1, action: 'set-lowpass-freq',  pushAction: 'toggle-lowpass', label: 'GRAVES',  min: 200, max: 20000, step: 100,  unit: 'Hz' },
  { index: 2, action: 'set-highpass-freq', pushAction: 'toggle-highpass',label: 'AIGUS',   min: 20,  max: 2000,  step: 10,   unit: 'Hz' },
  { index: 3, action: 'set-pitch',         pushAction: 'reset-pitch',    label: 'TONALIT', min: -12, max: 12,    step: 1,    unit: 'st' },
];

// ─── Page B — Contrôles avancés ────────────────────────────────────────────

export const PAGE_B_BUTTONS: ButtonMapping[] = [
  { index: 0, action: 'toggle-play',          label: 'LECTURE',  icon: '▶',  colorOn: '#00ff88', colorOff: '#1a1a2e' },
  { index: 1, action: 'toggle-comparison',    label: 'COMPAR',   icon: '⚖',  colorOn: '#22d3ee', colorOff: '#0d2030' },
  { index: 2, action: 'reset-all-filters',    label: 'RESET',    icon: '♻',  colorOn: '#f87171', colorOff: '#0d2030' },
  { index: 3, action: 'apply-preset-clear',   label: 'BRUT',     icon: '○',  colorOn: '#94a3b8', colorOff: '#0d2030' },
  { index: 4, action: 'apply-preset-masque',  label: 'MASQUE',   icon: '🔍', colorOn: '#818cf8', colorOff: '#0d2030' },
  { index: 5, action: 'apply-preset-analyse', label: 'ANALYSE',  icon: '🔬', colorOn: '#34d399', colorOff: '#0d2030' },
  { index: 6, action: 'toggle-reverse',       label: 'INVERSE',  icon: '◀◀', colorOn: '#ff8800', colorOff: '#0d2030' },
  { index: 7, action: 'switch-page',          label: 'FILTRES',  icon: '▲',  colorOn: '#4a7090', colorOff: '#162535' },
];

export const PAGE_B_DIALS: DialMapping[] = [
  { index: 0, action: 'set-volume',        pushAction: 'mute-toggle',    label: 'VOLUME',   min: 0,    max: 1,    step: 0.02, unit: '' },
  { index: 1, action: 'set-bandpass-freq', pushAction: 'toggle-bandpass',label: 'VOIX Hz',  min: 200,  max: 8000, step: 50,   unit: 'Hz' },
  { index: 2, action: 'set-notch-freq',    pushAction: 'toggle-notch',   label: 'BUZZ Hz',  min: 50,   max: 500,  step: 5,    unit: 'Hz' },
  { index: 3, action: 'set-speed',         pushAction: 'reset-speed',    label: 'VITESSE',  min: 0.25, max: 2,    step: 0.05, unit: 'x' },
];
