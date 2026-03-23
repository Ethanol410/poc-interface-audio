/**
 * React hook for Stream Deck suspect deck connection.
 */

import { useState, useEffect, useCallback } from 'react';
import { streamDeckSuspectService } from '@/services/streamdeck/StreamDeckSuspectService';

export const useStreamDeckSuspect = () => {
  const isSupported = typeof navigator !== 'undefined' && 'hid' in navigator;
  const [isConnected, setIsConnected] = useState(streamDeckSuspectService.isConnected);
  const [isConnecting, setIsConnecting] = useState(false);
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
    setIsConnecting(true);
    try {
      await streamDeckSuspectService.requestAndConnect();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion échouée');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    streamDeckSuspectService.disconnect();
  }, []);

  return { isConnected, isConnecting, isSupported, error, connect, disconnect };
};
