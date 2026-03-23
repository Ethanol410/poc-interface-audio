/**
 * Stream Deck Suspect Service — deuxième Stream Deck dédié aux suspects.
 * Affiche les photos + noms sur les boutons LCD, joue la voix au clic.
 */

import type { StreamDeckWeb } from '@elgato-stream-deck/webhid';
import { requestFreshStreamDeck, openNextStreamDeck } from './streamDeckConnector';
import type {
  StreamDeckButtonControlDefinition,
  StreamDeckLcdSegmentControlDefinition,
} from '@elgato-stream-deck/core';
import { useAudioStore } from '@/stores/audioStore';
import { getScenario } from '@/data/scenarios';
import {
  renderSuspectKey,
  renderStopKey,
  renderEmptyKey,
  renderSuspectStrips,
} from './streamDeckSuspectDisplay';
import type { SuspectRenderData } from './streamDeckSuspectDisplay';

const SUSPECT_BUTTON_INDICES = [0, 1, 2, 3] as const;
const STOP_BUTTON_INDEX = 4;
const EMPTY_BUTTON_INDICES = [5, 6, 7] as const;

// Maps button index → audioUrls key
const SUSPECT_AUDIO_KEYS = ['suspect1', 'suspect2', 'suspect3', 'suspect4'] as const;
type SuspectKey = (typeof SUSPECT_AUDIO_KEYS)[number];

type ServiceListener = () => void;

class StreamDeckSuspectService {
  private static instance: StreamDeckSuspectService;

  private deck: StreamDeckWeb | null = null;
  private unsubscribeStore: (() => void) | null = null;
  private player: HTMLAudioElement | null = null;
  private playingSuspectIndex = -1; // -1 = none
  private photoCache = new Map<string, ImageBitmap>();
  private lcdSegment: StreamDeckLcdSegmentControlDefinition | null = null;
  private listeners = new Map<string, Set<ServiceListener>>();
  private syncTimer: ReturnType<typeof setTimeout> | null = null;

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
      // Mise à jour en temps réel du pitch vocal
      if (state.suspectVoicePitch !== prevState.suspectVoicePitch && this.player) {
        this.player.playbackRate = state.suspectVoicePitch;
      }
      this.syncDebounced();
    });

    // Pre-fetch suspect photos before first draw
    await this.prefetchPhotos();
    await this.syncAllDisplays();
    this.emit('connected');
  }

  private registerEvents(deck: StreamDeckWeb): void {
    deck.on('down', (control) => {
      if (control.type !== 'button') return;
      const btn = control as StreamDeckButtonControlDefinition;

      if ((SUSPECT_BUTTON_INDICES as readonly number[]).includes(btn.index)) {
        this.toggleSuspect(btn.index);
      } else if (btn.index === STOP_BUTTON_INDEX) {
        this.stopSuspect();
        useAudioStore.getState().setSuspectPopupIndex(null);
      }
    });

    deck.on('error', () => {
      this.disconnect();
    });
  }

  public toggleSuspect(suspectButtonIndex: number): void {
    const store = useAudioStore.getState();
    // Toujours ouvrir le popup sur ce suspect
    store.setSuspectPopupIndex(suspectButtonIndex);

    if (this.playingSuspectIndex === suspectButtonIndex) {
      this.stopSuspect(/* silent */ false, /* keepPopup */ true);
      return;
    }

    const key: SuspectKey = SUSPECT_AUDIO_KEYS[suspectButtonIndex];
    const url = store.audioUrls?.[key];
    if (!url) return;

    this.stopSuspect(/* silent */ true, /* keepPopup */ true);

    this.player = new Audio(url);
    this.player.volume = store.volume;
    this.player.playbackRate = store.suspectVoicePitch;
    this.playingSuspectIndex = suspectButtonIndex;
    store.setSuspectPlayingIndex(suspectButtonIndex);

    this.player.onended = () => {
      this.playingSuspectIndex = -1;
      useAudioStore.getState().setSuspectPlayingIndex(-1);
      this.syncDebounced();
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

    // Suspect buttons (top row: 0-3)
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

    // Stop button (index 4)
    await renderStopKey(this.deck, STOP_BUTTON_INDEX, this.playingSuspectIndex >= 0);

    // Empty buttons (5-7)
    for (const idx of EMPTY_BUTTON_INDICES) {
      await renderEmptyKey(this.deck, idx);
    }

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
      await renderSuspectStrips(this.deck, this.lcdSegment.id, stripData);
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
