/**
 * Stream Deck+ Service — WebHID singleton orchestrator.
 * Manages connection, event routing, and LCD display sync.
 * Two pages: Page A (filters) and Page B (advanced controls).
 */

import type { StreamDeckWeb } from '@elgato-stream-deck/webhid';
import { requestFreshStreamDeck, openNextStreamDeck } from './streamDeckConnector';
import type {
  StreamDeckButtonControlDefinition,
  StreamDeckEncoderControlDefinition,
  StreamDeckLcdSegmentControlDefinition,
} from '@elgato-stream-deck/core';
import { useAudioStore } from '@/stores/audioStore';
import {
  PAGE_A_BUTTONS,
  PAGE_A_DIALS,
  PAGE_B_BUTTONS,
  PAGE_B_DIALS,
} from './streamDeckMappings';
import type { DialAction } from './streamDeckMappings';
import { dispatchButtonAction, dispatchDialAction, dispatchDialPushAction } from './streamDeckCommands';
import { renderButtonKey, renderDialStrip, clearAllButtons } from './streamDeckDisplay';

type ServiceListener = () => void;

class StreamDeckService {
  private static instance: StreamDeckService;
  private deck: StreamDeckWeb | null = null;
  private unsubscribeStore: (() => void) | null = null;
  private listeners = new Map<string, Set<ServiceListener>>();

  // Current page: 'A' = filters, 'B' = advanced
  private currentPage: 'A' | 'B' = 'A';

  // Per-encoder last event timestamp for acceleration
  private lastRotateTime: number[] = [0, 0, 0, 0];

  // Cached LCD segment info
  private lcdSegment: StreamDeckLcdSegmentControlDefinition | null = null;

  private constructor() {}

  public static getInstance(): StreamDeckService {
    if (!StreamDeckService.instance) {
      StreamDeckService.instance = new StreamDeckService();
    }
    return StreamDeckService.instance;
  }

  public get isConnected(): boolean {
    return this.deck !== null;
  }

  public get page(): 'A' | 'B' {
    return this.currentPage;
  }

  // ─── Connection ────────────────────────────────────────────────────────────

  public async requestAndConnect(): Promise<void> {
    const deck = await requestFreshStreamDeck();
    await this.attachDeck(deck);
  }

  public async tryAutoConnect(): Promise<void> {
    const deck = await openNextStreamDeck();
    if (deck) await this.attachDeck(deck);
  }

  public disconnect(): void {
    if (!this.deck) return;
    this.unsubscribeStore?.();
    this.unsubscribeStore = null;
    clearAllButtons(this.deck).catch(() => {});
    this.deck.close().catch(() => {});
    this.deck = null;
    this.lcdSegment = null;
    this.currentPage = 'A';
    this.emit('disconnected');
  }

  // ─── Internal ──────────────────────────────────────────────────────────────

  private async attachDeck(deck: StreamDeckWeb): Promise<void> {
    this.deck = deck;

    const lcdControl = deck.CONTROLS.find((c) => c.type === 'lcd-segment');
    this.lcdSegment = lcdControl
      ? (lcdControl as StreamDeckLcdSegmentControlDefinition)
      : null;

    this.registerEvents(deck);

    this.unsubscribeStore = useAudioStore.subscribe((state, prevState) => {
      if (prevState.audioUrls && !state.audioUrls) {
        this.disconnect();
        return;
      }
      // If scenario switched to braincity while on page B, go back to page A
      if (state.scenario === 'braincity' && this.currentPage === 'B') {
        this.currentPage = 'A';
        this.emit('pageChange');
      }
      this.syncDisplaysDebounced();
    });

    await this.syncAllDisplays();
    this.emit('connected');
  }

  private registerEvents(deck: StreamDeckWeb): void {
    deck.on('down', (control) => {
      if (control.type === 'button') {
        const btn = control as StreamDeckButtonControlDefinition;
        const buttons = this.currentPage === 'A' ? PAGE_A_BUTTONS : PAGE_B_BUTTONS;
        const mapping = buttons.find((m) => m.index === btn.index);
        if (!mapping) return;

        if (mapping.action === 'switch-page') {
          const scenario = useAudioStore.getState().scenario;
          if (scenario === 'braincity') return; // No page B for Brain City
          this.currentPage = this.currentPage === 'A' ? 'B' : 'A';
          this.emit('pageChange');
          this.syncAllDisplays().catch(() => {});
        } else {
          dispatchButtonAction(mapping.action);
        }
      } else if (control.type === 'encoder') {
        const enc = control as StreamDeckEncoderControlDefinition;
        const mapping = this.getCurrentDials().find((m) => m.index === enc.index);
        if (mapping) dispatchDialPushAction(mapping.pushAction);
      }
    });

    deck.on('rotate', (control, amount) => {
      const enc = control as StreamDeckEncoderControlDefinition;
      const mapping = this.getCurrentDials().find((m) => m.index === enc.index);
      if (!mapping) return;
      const accel = this.getAcceleration(enc.index);
      dispatchDialAction(mapping.action, amount * accel, mapping.step);
    });

    deck.on('error', (err) => {
      console.error('StreamDeck error:', err);
      this.disconnect();
    });
  }

  /**
   * Returns the active dial mappings for the current page + scenario.
   * BrainCity Page A: dial 3 becomes VITESSE (speed) instead of TONALIT (pitch).
   */
  private getCurrentDials() {
    const baseDials = this.currentPage === 'A' ? PAGE_A_DIALS : PAGE_B_DIALS;
    const scenario = useAudioStore.getState().scenario;

    if (scenario === 'braincity' && this.currentPage === 'A') {
      return baseDials.map((d) =>
        d.index === 3
          ? { ...d, action: 'set-speed' as const, pushAction: 'reset-speed' as const, label: 'TORTUE', min: 0.25, max: 2, step: 0.05, unit: 'x' }
          : d,
      );
    }

    return baseDials;
  }

  private getAcceleration(encoderIndex: number): number {
    const now = Date.now();
    const delta = now - (this.lastRotateTime[encoderIndex] ?? 0);
    this.lastRotateTime[encoderIndex] = now;
    if (delta < 30) return 9;
    if (delta < 80) return 3;
    return 1;
  }

  private syncTimer: ReturnType<typeof setTimeout> | null = null;
  private syncDisplaysDebounced(): void {
    if (this.syncTimer) clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => {
      this.syncAllDisplays().catch(() => {});
    }, 50);
  }

  private async syncAllDisplays(): Promise<void> {
    if (!this.deck) return;
    const state = useAudioStore.getState();

    const isBrainCity = state.scenario === 'braincity';
    const buttons = this.currentPage === 'A' ? PAGE_A_BUTTONS : PAGE_B_BUTTONS;
    const dials = this.getCurrentDials();

    // BrainCity label overrides (Page A only)
    const brainCityButtonOverrides: Record<string, { label: string; icon: string; colorOn: string }> = {
      'toggle-lowpass':    { label: 'ELEPH',  icon: '🐘', colorOn: '#118AB2' },
      'toggle-highpass':   { label: 'ABEILL', icon: '🐝', colorOn: '#FFD166' },
      'toggle-bandpass':   { label: 'ROBOT',  icon: '🤖', colorOn: '#5e4db2' },
      'toggle-notch':      { label: 'BALAI',  icon: '🧹', colorOn: '#06D6A0' },
      'toggle-compressor': { label: 'LOUPE',  icon: '🔎', colorOn: '#EF476F' },
      'toggle-reverse':    { label: 'REVERS', icon: '🔄', colorOn: '#ee77b4' },
      'toggle-play':       { label: 'PLAY',   icon: '▶',  colorOn: '#06D6A0' },
    };

    const buttonStates: Record<string, boolean> = {
      'toggle-play':         state.isPlaying,
      'toggle-reverse':      state.isReversed,
      'toggle-lowpass':      state.lowPassFilter.enabled,
      'toggle-highpass':     state.highPassFilter.enabled,
      'toggle-bandpass':     state.bandPassFilter.enabled,
      'toggle-notch':        state.notchFilter.enabled,
      'toggle-compressor':   state.compressor.enabled,
      'toggle-comparison':   state.isComparisonMode,
      'reset-all-filters':   false,
      'apply-preset-clear':  false,
      'apply-preset-masque': false,
      'apply-preset-analyse':false,
      'switch-page':         false,
    };

    for (const mapping of buttons) {
      // Brain City has no page B: hide the switch-page button entirely
      if (isBrainCity && mapping.action === 'switch-page') {
        await renderButtonKey(this.deck, mapping.index, '', '', false, '#000000', '#000000');
        continue;
      }
      const useOverride = isBrainCity && this.currentPage === 'A';
      const override = useOverride ? brainCityButtonOverrides[mapping.action] : null;
      await renderButtonKey(
        this.deck,
        mapping.index,
        override ? override.label : mapping.label,
        override ? override.icon : mapping.icon,
        buttonStates[mapping.action] ?? false,
        override ? override.colorOn : mapping.colorOn,
        mapping.colorOff,
      );
    }

    if (!this.lcdSegment) return;

    const lcdId = this.lcdSegment.id;

    const dialValueMap: Record<DialAction, { value: number; active: boolean }> = {
      'set-volume':        { value: state.volume,                   active: state.volume > 0 },
      'set-lowpass-freq':  { value: state.lowPassFilter.frequency,  active: state.lowPassFilter.enabled },
      'set-highpass-freq': { value: state.highPassFilter.frequency, active: state.highPassFilter.enabled },
      'set-pitch':         { value: state.pitchShift.semitones,     active: state.pitchShift.semitones !== 0 },
      'set-bandpass-freq': { value: state.bandPassFilter.frequency, active: state.bandPassFilter.enabled },
      'set-notch-freq':    { value: state.notchFilter.frequency,    active: state.notchFilter.enabled },
      'set-speed':         { value: state.playbackSpeed,            active: state.playbackSpeed !== 1 },
    };

    // BrainCity dial label overrides (Page A only)
    // BrainCity label overrides for dials (index 3 handled by getCurrentDials())
    const brainCityDialLabels: Record<number, string> = isBrainCity && this.currentPage === 'A'
      ? { 0: 'VOLUME', 1: 'FILTRE', 2: 'FILTRE' }
      : {};

    for (const mapping of dials) {
      const { value, active } = dialValueMap[mapping.action];
      const label = brainCityDialLabels[mapping.index] ?? mapping.label;
      const colorActive = isBrainCity && this.currentPage === 'A' && mapping.index === 3
        ? '#06D6A0'
        : undefined;

      await renderDialStrip(
        this.deck,
        mapping.index,
        lcdId,
        label,
        value,
        mapping.min,
        mapping.max,
        mapping.unit,
        active,
        colorActive,
      );
    }
  }

  // ─── Simple event emitter ──────────────────────────────────────────────────

  public on(event: string, fn: ServiceListener): void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(fn);
  }

  public off(event: string, fn: ServiceListener): void {
    this.listeners.get(event)?.delete(fn);
  }

  private emit(event: string): void {
    this.listeners.get(event)?.forEach((fn) => fn());
  }
}

export const streamDeckService = StreamDeckService.getInstance();
