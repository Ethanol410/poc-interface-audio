/**
 * Stream Deck+ mapping configuration — buttons (8) and dials/encoders (4).
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
  | 'cycle-preset';

export type DialAction =
  | 'set-volume'
  | 'set-lowpass-freq'
  | 'set-highpass-freq'
  | 'set-pitch';

export type DialPushAction =
  | 'mute-toggle'
  | 'toggle-lowpass'
  | 'toggle-highpass'
  | 'reset-pitch';

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

export const BUTTON_MAPPINGS: ButtonMapping[] = [
  { index: 0, action: 'toggle-play',       label: 'LECTURE',  icon: '▶',  colorOn: '#00ff88', colorOff: '#1a1a2e' },
  { index: 1, action: 'toggle-reverse',    label: 'INVERSE',  icon: '◀◀', colorOn: '#ff8800', colorOff: '#1a1a2e' },
  { index: 2, action: 'toggle-lowpass',    label: 'GRAVES',   icon: '🔉', colorOn: '#00d4ff', colorOff: '#1a1a2e' },
  { index: 3, action: 'toggle-highpass',   label: 'AIGUS',    icon: '🔈', colorOn: '#4ade80', colorOff: '#1a1a2e' },
  { index: 4, action: 'toggle-bandpass',   label: 'VOIX',     icon: '🎤', colorOn: '#fbbf24', colorOff: '#1a1a2e' },
  { index: 5, action: 'toggle-notch',      label: 'BUZZ',     icon: '⚡', colorOn: '#f87171', colorOff: '#1a1a2e' },
  { index: 6, action: 'toggle-compressor', label: 'MURMURE',  icon: '📢', colorOn: '#c084fc', colorOff: '#1a1a2e' },
  { index: 7, action: 'cycle-preset',      label: 'PRESET',   icon: '↺',  colorOn: '#818cf8', colorOff: '#33335a' },
];

export const DIAL_MAPPINGS: DialMapping[] = [
  { index: 0, action: 'set-volume',       pushAction: 'mute-toggle',    label: 'VOLUME',   min: 0,   max: 1,     step: 0.02, unit: '' },
  { index: 1, action: 'set-lowpass-freq', pushAction: 'toggle-lowpass', label: 'GRAVES',   min: 200, max: 20000, step: 100,  unit: 'Hz' },
  { index: 2, action: 'set-highpass-freq',pushAction: 'toggle-highpass',label: 'AIGUS',    min: 20,  max: 2000,  step: 10,   unit: 'Hz' },
  { index: 3, action: 'set-pitch',        pushAction: 'reset-pitch',    label: 'TONALIT',  min: -12, max: 12,    step: 1,    unit: 'st' },
];

export const PRESET_CYCLE: Array<'clear' | 'remove-mask' | 'deep-analysis'> = [
  'clear',
  'remove-mask',
  'deep-analysis',
];
