/**
 * Stream Deck Suspect Service — deuxième Stream Deck dédié aux suspects.
 * Buttons 0-3: play suspect audio + popup.
 * Button 4: stop.
 * Button 5: loop toggle.
 * Button 6: slow mode toggle (0.75x voice pitch).
 * Button 7: reset voice pitch to 1.0.
 * Dial 0: global volume (push = mute).
 * Dial 1: suspect voice pitch (push = reset to 1.0).
 */

import type { StreamDeckWeb } from '@elgato-stream-deck/webhid';
import { requestFreshStreamDeck, openNextStreamDeck } from './streamDeckConnector';
import type {
  StreamDeckButtonControlDefinition,
  StreamDeckEncoderControlDefinition,
  StreamDeckLcdSegmentControlDefinition,
} from '@elgato-stream-deck/core';
import { useAudioStore } from '@/stores/audioStore';
import { imperativeSetVolume } from '@/services/filterActions';
import { getScenario } from '@/data/scenarios';
import {
  renderSuspectKey,
  renderStopKey,
  renderEmptyKey,
  renderLoopKey,
  renderSlowKey,
  renderResetPitchKey,
  renderSuspectStrips,
} from './streamDeckSuspectDisplay';
import type { SuspectRenderData } from './streamDeckSuspectDisplay';

const SUSPECT_BUTTON_INDICES = [0, 1, 2, 3] as const;
const STOP_BUTTON_INDEX = 4;
const LOOP_BUTTON_INDEX = 5;
const SLOW_BUTTON_INDEX = 6;
const RESET_PITCH_BUTTON_INDEX = 7;

const SUSPECT_AUDIO_KEYS = ['suspect1', 'suspect2', 'suspect3', 'suspect4'] as const;
type SuspectKey = (typeof SUSPECT_AUDIO_KEYS)[number];

const SLOW_PITCH_RATE = 0.75;

type ServiceListener = () => void;

class StreamDeckSuspectService {
  private static instance: StreamDeckSuspectService;

  private deck: StreamDeckWeb | null = null;
  private unsubscribeStore: (() => void) | null = null;
  private player: HTMLAudioElement | null = null;
  private playingSuspectIndex = -1;
  private isLooping = false;
  private isSlowMode = false;
  private photoCache = new Map<string, ImageBitmap>();
  private lcdSegment: StreamDeckLcdSegmentControlDefinition | null = null;
  private listeners = new Map<string, Set<ServiceListener>>();
  private syncTimer: ReturnType<typeof setTimeout> | null = null;

  // Acceleration for dial rotation
  private lastRotateTime: number[] = [0, 0, 0, 0];
  private isMuted = false;
  private savedVolumeBeforeMute = 0.8;

  private constructor() {}

  public static getInstance(): StreamDeckSuspectService {
    if (!StreamDeckSuspectService.instance) {
      StreamDeckSuspectService.instance = new StreamDeckSuspectService();
    }
    return StreamDeckSuspectService.instance;
  }

  public get isConnected(): boolean {
    return this.deck !== null;
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
    this.stopSuspect();
    this.unsubscribeStore?.();
    this.unsubscribeStore = null;
    this.clearAllKeys().catch(() => {});
    this.deck.close().catch(() => {});
    this.deck = null;
    this.lcdSegment = null;
    this.isLooping = false;
    this.isSlowMode = false;
    this.emit('disconnected');
  }

  // ─── Internal ──────────────────────────────────────────────────────────────

  private async attachDeck(deck: StreamDeckWeb): Promise<void> {
    this.deck = deck;
    this.lcdSegment =
      (deck.CONTROLS.find((c) => c.type === 'lcd-segment') as
        | StreamDeckLcdSegmentControlDefinition
        | undefined) ?? null;

    this.registerEvents(deck);

    this.unsubscribeStore = useAudioStore.subscribe((state, prevState) => {
      if (prevState.audioUrls && !state.audioUrls) {
        this.disconnect();
        return;
      }
      if (state.suspectVoicePitch !== prevState.suspectVoicePitch && this.player) {
        this.player.playbackRate = state.suspectVoicePitch;
      }
      this.syncDebounced();
    });

    await this.prefetchPhotos();
    await this.syncAllDisplays();
    this.emit('connected');
  }

  private registerEvents(deck: StreamDeckWeb): void {
    deck.on('down', (control) => {
      if (control.type === 'button') {
        const btn = control as StreamDeckButtonControlDefinition;
        if ((SUSPECT_BUTTON_INDICES as readonly number[]).includes(btn.index)) {
          this.toggleSuspect(btn.index);
        } else if (btn.index === STOP_BUTTON_INDEX) {
          this.stopSuspect();
          useAudioStore.getState().setSuspectPopupIndex(null);
        } else if (btn.index === LOOP_BUTTON_INDEX) {
          this.toggleLoop();
        } else if (btn.index === SLOW_BUTTON_INDEX) {
          this.toggleSlowMode();
        } else if (btn.index === RESET_PITCH_BUTTON_INDEX) {
          this.resetPitch();
        }
      } else if (control.type === 'encoder') {
        const enc = control as StreamDeckEncoderControlDefinition;
        if (enc.index === 0) {
          this.handleVolumeMuteToggle();
        } else if (enc.index === 1) {
          this.resetPitch();
        }
      }
    });

    deck.on('rotate', (control, amount) => {
      const enc = control as StreamDeckEncoderControlDefinition;
      const accel = this.getAcceleration(enc.index);
      if (enc.index === 0) {
        const state = useAudioStore.getState();
        const newVol = Math.max(0, Math.min(1, state.volume + amount * accel * 0.02));
        imperativeSetVolume(newVol);
      } else if (enc.index === 1) {
        const state = useAudioStore.getState();
        const newPitch = Math.max(0.5, Math.min(2.0, state.suspectVoicePitch + amount * accel * 0.05));
        state.setSuspectVoicePitch(newPitch);
      }
    });

    deck.on('error', () => {
      this.disconnect();
    });
  }

  private getAcceleration(encoderIndex: number): number {
    const now = Date.now();
    const delta = now - (this.lastRotateTime[encoderIndex] ?? 0);
    this.lastRotateTime[encoderIndex] = now;
    if (delta < 30) return 4;
    if (delta < 80) return 2;
    return 1;
  }

  private handleVolumeMuteToggle(): void {
    const state = useAudioStore.getState();
    if (this.isMuted) {
      imperativeSetVolume(this.savedVolumeBeforeMute);
      this.isMuted = false;
    } else {
      this.savedVolumeBeforeMute = state.volume;
      imperativeSetVolume(0);
      this.isMuted = true;
    }
  }

  private toggleLoop(): void {
    this.isLooping = !this.isLooping;
    if (this.player) {
      this.player.loop = this.isLooping;
    }
    this.syncDebounced();
  }

  private toggleSlowMode(): void {
    this.isSlowMode = !this.isSlowMode;
    const state = useAudioStore.getState();
    const newPitch = this.isSlowMode ? SLOW_PITCH_RATE : 1.0;
    state.setSuspectVoicePitch(newPitch);
    this.syncDebounced();
  }

  private resetPitch(): void {
    this.isSlowMode = false;
    useAudioStore.getState().setSuspectVoicePitch(1.0);
    this.syncDebounced();
  }

  public toggleSuspect(suspectButtonIndex: number): void {
    const store = useAudioStore.getState();
    store.setSuspectPopupIndex(suspectButtonIndex);

    if (this.playingSuspectIndex === suspectButtonIndex) {
      this.stopSuspect(false, true);
      return;
    }

    const key: SuspectKey = SUSPECT_AUDIO_KEYS[suspectButtonIndex];
    const url = store.audioUrls?.[key];
    if (!url) return;

    this.stopSuspect(true, true);

    this.player = new Audio(url);
    this.player.volume = store.volume;
    this.player.playbackRate = store.suspectVoicePitch;
    this.player.loop = this.isLooping;
    this.playingSuspectIndex = suspectButtonIndex;
    store.setSuspectPlayingIndex(suspectButtonIndex);

    this.player.onended = () => {
      if (!this.isLooping) {
        this.playingSuspectIndex = -1;
        useAudioStore.getState().setSuspectPlayingIndex(-1);
        this.syncDebounced();
      }
    };

    this.player.play().catch(() => {
      this.playingSuspectIndex = -1;
      useAudioStore.getState().setSuspectPlayingIndex(-1);
    });

    this.syncDebounced();
  }

  public stopSuspect(silent = false, keepPopup = false): void {
    if (this.player) {
      this.player.pause();
      this.player.src = '';
      this.player = null;
    }
    this.playingSuspectIndex = -1;
    useAudioStore.getState().setSuspectPlayingIndex(-1);
    if (!keepPopup) useAudioStore.getState().setSuspectPopupIndex(null);
    if (!silent) this.syncDebounced();
  }

  // ─── Display ───────────────────────────────────────────────────────────────

  private async prefetchPhotos(): Promise<void> {
    const state = useAudioStore.getState();
    const suspects = getScenario(state.scenario).suspects;
    await Promise.allSettled(
      suspects.map(async (s) => {
        if (s.photoUrl && !this.photoCache.has(s.photoUrl)) {
          const blob = await fetch(s.photoUrl).then((r) => r.blob());
          this.photoCache.set(s.photoUrl, await createImageBitmap(blob));
        }
      }),
    );
  }

  private syncDebounced(): void {
    if (this.syncTimer) clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => {
      this.syncAllDisplays().catch(() => {});
    }, 50);
  }

  private async syncAllDisplays(): Promise<void> {
    if (!this.deck) return;
    const state = useAudioStore.getState();
    const suspects = getScenario(state.scenario).suspects;

    // Suspect buttons (0-3)
    for (let i = 0; i < SUSPECT_BUTTON_INDICES.length; i++) {
      const suspect = suspects[i];
      if (suspect) {
        const data: SuspectRenderData = {
          name: suspect.name,
          role: suspect.role,
          notes: suspect.notes,
          photoUrl: suspect.photoUrl,
        };
        await renderSuspectKey(this.deck, i, data, this.playingSuspectIndex === i, this.photoCache);
      } else {
        await renderEmptyKey(this.deck, i);
      }
    }

    // Stop (4)
    await renderStopKey(this.deck, STOP_BUTTON_INDEX, this.playingSuspectIndex >= 0);

    // Loop (5)
    await renderLoopKey(this.deck, LOOP_BUTTON_INDEX, this.isLooping);

    // Slow (6)
    await renderSlowKey(this.deck, SLOW_BUTTON_INDEX, this.isSlowMode);

    // Reset pitch (7)
    await renderResetPitchKey(this.deck, RESET_PITCH_BUTTON_INDEX, state.suspectVoicePitch !== 1.0);

    // LCD strips
    if (this.lcdSegment) {
      const playingSuspect =
        this.playingSuspectIndex >= 0 ? suspects[this.playingSuspectIndex] : null;
      const stripData: SuspectRenderData | null = playingSuspect
        ? {
            name: playingSuspect.name,
            role: playingSuspect.role,
            notes: playingSuspect.notes,
            photoUrl: playingSuspect.photoUrl,
          }
        : null;
      await renderSuspectStrips(
        this.deck,
        this.lcdSegment.id,
        stripData,
        state.suspectVoicePitch,
        state.volume,
        this.isLooping,
      );
    }
  }

  private async clearAllKeys(): Promise<void> {
    if (!this.deck) return;
    const count = this.deck.CONTROLS.filter((c) => c.type === 'button').length;
    for (let i = 0; i < count; i++) {
      await this.deck.fillKeyColor(i, 0, 0, 0);
    }
  }

  // ─── Event emitter ─────────────────────────────────────────────────────────

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

export const streamDeckSuspectService = StreamDeckSuspectService.getInstance();
