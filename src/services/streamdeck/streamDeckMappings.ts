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
  { index: 0, action: 'toggle-play',       label: 'PLAY',  icon: '▶',   colorOn: '#00ff88', colorOff: '#1a1a2e' },
  { index: 1, action: 'toggle-reverse',    label: 'REV',   icon: '◀◀', colorOn: '#ff8800', colorOff: '#1a1a2e' },
  { index: 2, action: 'toggle-lowpass',    label: 'LPF',   icon: 'LP',  colorOn: '#00d4ff', colorOff: '#1a1a2e' },
  { index: 3, action: 'toggle-highpass',   label: 'HPF',   icon: 'HP',  colorOn: '#00d4ff', colorOff: '#1a1a2e' },
  { index: 4, action: 'toggle-bandpass',   label: 'BPF',   icon: 'BP',  colorOn: '#00d4ff', colorOff: '#1a1a2e' },
  { index: 5, action: 'toggle-notch',      label: 'NOTCH', icon: 'NF',  colorOn: '#ff4444', colorOff: '#1a1a2e' },
  { index: 6, action: 'toggle-compressor', label: 'COMP',  icon: 'CMP', colorOn: '#ffff00', colorOff: '#1a1a2e' },
  { index: 7, action: 'cycle-preset',      label: 'PRESET',icon: 'PRE', colorOn: '#dd00ff', colorOff: '#33335a' },
];

export const DIAL_MAPPINGS: DialMapping[] = [
  { index: 0, action: 'set-volume',       pushAction: 'mute-toggle',    label: 'VOL',   min: 0,   max: 1,     step: 0.02, unit: '' },
  { index: 1, action: 'set-lowpass-freq', pushAction: 'toggle-lowpass', label: 'LPF',   min: 200, max: 20000, step: 100,  unit: 'Hz' },
  { index: 2, action: 'set-highpass-freq',pushAction: 'toggle-highpass',label: 'HPF',   min: 20,  max: 2000,  step: 10,   unit: 'Hz' },
  { index: 3, action: 'set-pitch',        pushAction: 'reset-pitch',    label: 'PITCH', min: -12, max: 12,    step: 1,    unit: 'st' },
];

export const PRESET_CYCLE: Array<'clear' | 'remove-mask' | 'deep-analysis'> = [
  'clear',
  'remove-mask',
  'deep-analysis',
];
