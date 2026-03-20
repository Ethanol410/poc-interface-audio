/**
 * React hook for Stream Deck+ connection state.
 */

import { useState, useEffect, useCallback } from 'react';
import { streamDeckService } from '@/services/streamdeck/StreamDeckService';

export const useStreamDeck = () => {
  const isSupported =
    typeof navigator !== 'undefined' && 'hid' in navigator;

  const [isConnected, setIsConnected] = useState(streamDeckService.isConnected);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onConnected = () => setIsConnected(true);
    const onDisconnected = () => setIsConnected(false);

    streamDeckService.on('connected', onConnected);
    streamDeckService.on('disconnected', onDisconnected);

    // Try to silently reconnect to a previously authorized device
    if (isSupported && !streamDeckService.isConnected) {
      streamDeckService.tryAutoConnect().catch(() => {
        // Silence — no device was previously authorized
      });
    }

    return () => {
      streamDeckService.off('connected', onConnected);
      streamDeckService.off('disconnected', onDisconnected);
    };
  }, [isSupported]);

  const connect = useCallback(async () => {
    setError(null);
    try {
      await streamDeckService.requestAndConnect();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion échouée');
    }
  }, []);

  const disconnect = useCallback(() => {
    streamDeckService.disconnect();
  }, []);

  return { isConnected, isSupported, error, connect, disconnect };
};
