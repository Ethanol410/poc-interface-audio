/**
 * Utilitaire de connexion WebHID partagé entre les deux services Stream Deck.
 *
 * Utilise un mutex pour sérialiser les connexions concurrentes (les deux hooks
 * montent en même temps dans Dashboard) et try-catch pour ignorer les devices
 * déjà ouverts par l'autre service.
 */

import { openDevice, VENDOR_ID, CORSAIR_VENDOR_ID } from '@elgato-stream-deck/webhid';
import type { StreamDeckWeb } from '@elgato-stream-deck/webhid';

const HID_FILTERS = [{ vendorId: VENDOR_ID }, { vendorId: CORSAIR_VENDOR_ID }];

// Mutex pour sérialiser les connexions concurrentes
let connectLock: Promise<void> = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const result = connectLock.then(fn);
  connectLock = result.then(
    () => {},
    () => {},
  );
  return result;
}

/**
 * Ouvre le picker WebHID et retourne le premier Stream Deck disponible.
 * Try-catch sur chaque device pour ignorer ceux déjà ouverts.
 */
export async function requestFreshStreamDeck(): Promise<StreamDeckWeb> {
  return withLock(async () => {
    const hidDevices = await navigator.hid.requestDevice({ filters: HID_FILTERS });

    if (hidDevices.length === 0) {
      throw new Error('Aucun Stream Deck sélectionné.');
    }

    for (const device of hidDevices) {
      try {
        return await openDevice(device);
      } catch {
        continue; // déjà ouvert par l'autre service
      }
    }

    throw new Error(
      'Le Stream Deck sélectionné est déjà utilisé. Sélectionnez le 2ème appareil.',
    );
  });
}

/**
 * Ouvre séquentiellement le prochain Stream Deck autorisé disponible.
 * Utilisé pour la reconnexion silencieuse au chargement de la page.
 */
export async function openNextStreamDeck(): Promise<StreamDeckWeb | null> {
  return withLock(async () => {
    const hidDevices = await navigator.hid.getDevices();
    const valid = hidDevices.filter(
      (d) => d.vendorId === VENDOR_ID || d.vendorId === CORSAIR_VENDOR_ID,
    );

    for (const device of valid) {
      try {
        return await openDevice(device);
      } catch {
        continue; // déjà ouvert par l'autre service
      }
    }

    return null;
  });
}
