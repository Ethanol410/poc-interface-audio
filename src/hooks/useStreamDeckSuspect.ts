/**
 * React hook for Stream Deck suspect deck connection.
 */

import { useState, useEffect, useCallback } from 'react';
import { streamDeckSuspectService } from '@/services/streamdeck/StreamDeckSuspectService';

export const useStreamDeckSuspect = () => {
  const isSupported = typeof navigator !== 'undefined' && 'hid' in navigator;
  const [isConnected, setIsConnected] = useState(streamDeckSuspectService.isConnected);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onConnected = () => setIsConnected(true);
    const onDisconnected = () => setIsConnected(false);

    streamDeckSuspectService.on('connected', onConnected);
    streamDeckSuspectService.on('disconnected', onDisconnected);

    // Try to silently reconnect to a previously authorized device
    if (isSupported && !streamDeckSuspectService.isConnected) {
      streamDeckSuspectService.tryAutoConnect().catch(() => {
        // Silence — no device was previously authorized
      });
    }

    return () => {
      streamDeckSuspectService.off('connected', onConnected);
      streamDeckSuspectService.off('disconnected', onDisconnected);
    };
  }, [isSupported]);

  const connect = useCallback(async () => {
    setError(null);
    try {
      await streamDeckSuspectService.requestAndConnect();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion échouée');
    }
  }, []);

  const disconnect = useCallback(() => {
    streamDeckSuspectService.disconnect();
  }, []);

  return { isConnected, isSupported, error, connect, disconnect };
};
