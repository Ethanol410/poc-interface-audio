/**
 * Stream Deck+ Service — WebHID singleton orchestrator.
 * Manages connection, event routing, and LCD display sync.
 */

import type { StreamDeckWeb } from '@elgato-stream-deck/webhid';
import { requestFreshStreamDeck, openNextStreamDeck } from './streamDeckConnector';
import type {
  StreamDeckButtonControlDefinition,
  StreamDeckEncoderControlDefinition,
  StreamDeckLcdSegmentControlDefinition,
} from '@elgato-stream-deck/core';
import { useAudioStore } from '@/stores/audioStore';
import { BUTTON_MAPPINGS, DIAL_MAPPINGS } from './streamDeckMappings';
import { dispatchButtonAction, dispatchDialAction, dispatchDialPushAction } from './streamDeckCommands';
import { renderButtonKey, renderDialStrip, clearAllButtons } from './streamDeckDisplay';

type ServiceListener = () => void;

class StreamDeckService {
  private static instance: StreamDeckService;
  private deck: StreamDeckWeb | null = null;
  private unsubscribeStore: (() => void) | null = null;
  private listeners = new Map<string, Set<ServiceListener>>();

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

  // ─── Connection ────────────────────────────────────────────────────────────

  /**
   * Show the browser WebHID device picker and connect to the selected device.
   */
  public async requestAndConnect(): Promise<void> {
    const deck = await requestFreshStreamDeck();
    await this.attachDeck(deck);
  }

  /**
   * Try to silently reconnect to a previously authorized device (no picker).
   */
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
    this.emit('disconnected');
  }

  // ─── Internal ──────────────────────────────────────────────────────────────

  private async attachDeck(deck: StreamDeckWeb): Promise<void> {
    this.deck = deck;

    // Cache LCD segment definition (Stream Deck+ has one)
    const lcdControl = deck.CONTROLS.find((c) => c.type === 'lcd-segment');
    this.lcdSegment = lcdControl
      ? (lcdControl as StreamDeckLcdSegmentControlDefinition)
      : null;

    this.registerEvents(deck);

    // Subscribe to Zustand store for LCD sync + auto-disconnect on game end
    this.unsubscribeStore = useAudioStore.subscribe((state, prevState) => {
      if (prevState.audioUrls && !state.audioUrls) {
        this.disconnect();
        return;
      }
      this.syncDisplaysDebounced();
    });

    // Initial draw
    await this.syncAllDisplays();
    this.emit('connected');
  }

  private registerEvents(deck: StreamDeckWeb): void {
    deck.on('down', (control) => {
      if (control.type === 'button') {
        const btn = control as StreamDeckButtonControlDefinition;
        const mapping = BUTTON_MAPPINGS.find((m) => m.index === btn.index);
        if (mapping) dispatchButtonAction(mapping.action);
      } else if (control.type === 'encoder') {
        const enc = control as StreamDeckEncoderControlDefinition;
        const mapping = DIAL_MAPPINGS.find((m) => m.index === enc.index);
        if (mapping) dispatchDialPushAction(mapping.pushAction);
      }
    });

    deck.on('rotate', (control, amount) => {
      const enc = control as StreamDeckEncoderControlDefinition;
      const mapping = DIAL_MAPPINGS.find((m) => m.index === enc.index);
      if (!mapping) return;
      const accel = this.getAcceleration(enc.index);
      dispatchDialAction(mapping.action, amount * accel, mapping.step);
    });

    deck.on('error', (err) => {
      console.error('StreamDeck error:', err);
      this.disconnect();
    });
  }

  private getAcceleration(encoderIndex: number): number {
    const now = Date.now();
    const delta = now - (this.lastRotateTime[encoderIndex] ?? 0);
    this.lastRotateTime[encoderIndex] = now;
    if (delta < 30) return 9;
    if (delta < 80) return 3;
    return 1;
  }

  // Debounce display sync to avoid flooding USB
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

    // Buttons
    const buttonStates: Record<string, boolean> = {
      'toggle-play':       state.isPlaying,
      'toggle-reverse':    state.isReversed,
      'toggle-lowpass':    state.lowPassFilter.enabled,
      'toggle-highpass':   state.highPassFilter.enabled,
      'toggle-bandpass':   state.bandPassFilter.enabled,
      'toggle-notch':      state.notchFilter.enabled,
      'toggle-compressor': state.compressor.enabled,
      'cycle-preset':      false,
    };

    for (const mapping of BUTTON_MAPPINGS) {
      await renderButtonKey(
        this.deck,
        mapping.index,
        mapping.label,
        mapping.icon,
        buttonStates[mapping.action] ?? false,
        mapping.colorOn,
        mapping.colorOff,
      );
    }

    // Encoder LCD strips (only if device has LCD segment)
    if (this.lcdSegment) {
      const lcdId = this.lcdSegment.id;
      const dialValues = [
        { value: state.volume,                   active: state.volume > 0 },
        { value: state.lowPassFilter.frequency,  active: state.lowPassFilter.enabled },
        { value: state.highPassFilter.frequency, active: state.highPassFilter.enabled },
        { value: state.pitchShift.semitones,     active: state.pitchShift.semitones !== 0 },
      ];

      for (const mapping of DIAL_MAPPINGS) {
        const { value, active } = dialValues[mapping.index];
        await renderDialStrip(
          this.deck,
          mapping.index,
          lcdId,
          mapping.label,
          value,
          mapping.min,
          mapping.max,
          mapping.unit,
          active,
        );
      }
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
