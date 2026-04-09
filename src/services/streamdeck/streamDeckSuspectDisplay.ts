/**
 * Stream Deck suspect LCD rendering.
 * Buttons: suspect photos (0-3), stop (4), loop (5), slow (6), reset pitch (7).
 * LCD strips: playing info (0), role (1), pitch bar (2), alibi (3).
 */

import type { StreamDeck } from '@elgato-stream-deck/webhid';

const LCD_W = 200;
const LCD_H = 100;

export interface SuspectRenderData {
  name: string;
  role: string;
  notes: string;
  photoUrl: string;
}

// ─── Button rendering ──────────────────────────────────────────────────────

export async function renderSuspectKey(
  deck: StreamDeck,
  keyIndex: number,
  suspect: SuspectRenderData,
  isPlaying: boolean,
  photoCache: Map<string, ImageBitmap>,
): Promise<void> {
  const ctrl = deck.CONTROLS.find(
    (c) => c.type === 'button' && 'index' in c && c.index === keyIndex,
  );

  if (!ctrl || !('feedbackType' in ctrl) || ctrl.feedbackType !== 'lcd') {
    const [r, g, b] = isPlaying ? [0, 255, 136] : [26, 26, 46];
    await deck.fillKeyColor(keyIndex, r, g, b);
    return;
  }

  const { width, height } = ctrl.pixelSize;
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0d0d1a';
  ctx.fillRect(0, 0, width, height);

  if (suspect.photoUrl && !photoCache.has(suspect.photoUrl)) {
    try {
      const blob = await fetch(suspect.photoUrl).then((r) => r.blob());
      photoCache.set(suspect.photoUrl, await createImageBitmap(blob));
    } catch {
      /* ignore */
    }
  }

  const bitmap = photoCache.get(suspect.photoUrl);
  if (bitmap) {
    const photoH = Math.round(height * 0.62);
    ctx.drawImage(bitmap, 0, 0, width, photoH);
    const grad = ctx.createLinearGradient(0, photoH * 0.4, 0, photoH);
    grad.addColorStop(0, 'rgba(13,13,26,0)');
    grad.addColorStop(1, 'rgba(13,13,26,1)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, photoH);
  }

  const [firstName, ...rest] = suspect.name.split(' ');
  const lastName = rest.join(' ');

  ctx.textAlign = 'center';
  ctx.fillStyle = isPlaying ? '#00ff88' : '#ffffff';
  ctx.font = `bold ${Math.round(height * 0.17)}px monospace`;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(firstName, width / 2, Math.round(height * 0.80));

  if (lastName) {
    ctx.fillStyle = isPlaying ? '#00cc66' : '#bbbbbb';
    ctx.font = `${Math.round(height * 0.13)}px monospace`;
    ctx.fillText(lastName, width / 2, Math.round(height * 0.95));
  }

  if (isPlaying) {
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, width - 4, height - 4);
    ctx.fillStyle = '#00ff88';
    ctx.font = `${Math.round(height * 0.2)}px serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText('♪', width - 6, 4);
  }

  const imageData = ctx.getImageData(0, 0, width, height);
  await deck.fillKeyBuffer(keyIndex, imageData.data, { format: 'rgba' });
}

export async function renderStopKey(
  deck: StreamDeck,
  keyIndex: number,
  hasActiveSuspect: boolean,
): Promise<void> {
  const ctrl = deck.CONTROLS.find(
    (c) => c.type === 'button' && 'index' in c && c.index === keyIndex,
  );

  if (!ctrl || !('feedbackType' in ctrl) || ctrl.feedbackType !== 'lcd') {
    await deck.fillKeyColor(keyIndex, hasActiveSuspect ? 200 : 60, 0, 0);
    return;
  }

  const { width, height } = ctrl.pixelSize;
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = hasActiveSuspect ? '#2a0000' : '#120000';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = hasActiveSuspect ? '#ff4444' : '#551111';
  ctx.font = `bold ${Math.round(height * 0.42)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⏹', width / 2, Math.round(height * 0.44));

  ctx.fillStyle = hasActiveSuspect ? '#ff6666' : '#442222';
  ctx.font = `bold ${Math.round(height * 0.17)}px monospace`;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('STOP', width / 2, height - 8);

  const imageData = ctx.getImageData(0, 0, width, height);
  await deck.fillKeyBuffer(keyIndex, imageData.data, { format: 'rgba' });
}

export async function renderLoopKey(
  deck: StreamDeck,
  keyIndex: number,
  isLooping: boolean,
): Promise<void> {
  await renderSimpleActionKey(deck, keyIndex, '🔁', 'BOUCLE', isLooping, '#22d3ee', '#0d2030');
}

export async function renderSlowKey(
  deck: StreamDeck,
  keyIndex: number,
  isSlowMode: boolean,
): Promise<void> {
  await renderSimpleActionKey(deck, keyIndex, '🐢', 'LENT', isSlowMode, '#fbbf24', '#0d2030');
}

export async function renderResetPitchKey(
  deck: StreamDeck,
  keyIndex: number,
  isModified: boolean,
): Promise<void> {
  await renderSimpleActionKey(deck, keyIndex, '↺', 'RESET', isModified, '#f87171', '#1a1a2e');
}

async function renderSimpleActionKey(
  deck: StreamDeck,
  keyIndex: number,
  icon: string,
  label: string,
  active: boolean,
  colorOn: string,
  colorOff: string,
): Promise<void> {
  const ctrl = deck.CONTROLS.find(
    (c) => c.type === 'button' && 'index' in c && c.index === keyIndex,
  );

  if (!ctrl || !('feedbackType' in ctrl) || ctrl.feedbackType !== 'lcd') {
    const hex = active ? colorOn : colorOff;
    const n = parseInt(hex.replace('#', ''), 16);
    await deck.fillKeyColor(keyIndex, (n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff);
    return;
  }

  const { width, height } = ctrl.pixelSize;
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = active ? colorOn : colorOff;
  ctx.fillRect(0, 0, width, height);

  if (active) {
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, width - 4, height - 4);
  }

  const iconSize = Math.round(height * 0.38);
  ctx.fillStyle = active ? '#000000' : '#888888';
  ctx.font = `bold ${iconSize}px "Segoe UI Emoji", "Apple Color Emoji", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(icon, width / 2, height * 0.45);

  const labelSize = Math.round(height * 0.2);
  ctx.fillStyle = active ? '#000000aa' : '#444444';
  ctx.font = `bold ${labelSize}px monospace`;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(label, width / 2, height - 10);

  const imageData = ctx.getImageData(0, 0, width, height);
  await deck.fillKeyBuffer(keyIndex, imageData.data, { format: 'rgba' });
}

export async function renderEmptyKey(deck: StreamDeck, keyIndex: number): Promise<void> {
  await deck.fillKeyColor(keyIndex, 5, 5, 15);
}

// ─── LCD strip rendering ───────────────────────────────────────────────────

export async function renderSuspectStrips(
  deck: StreamDeck,
  lcdId: number,
  playing: SuspectRenderData | null,
  voicePitch: number,
  volume: number,
  isLooping: boolean,
): Promise<void> {
  const loopIndicator = isLooping ? ' 🔁' : '';
  await renderLcdStrip(deck, 0, lcdId, 'EN ÉCOUTE', (playing?.name ?? '— AUCUN —') + loopIndicator, playing !== null);
  await renderLcdStrip(deck, 1, lcdId, 'RÔLE', playing?.role ?? '', false);
  await renderPitchStrip(deck, 2, lcdId, voicePitch, volume);
  await renderAlibiStrip(deck, 3, lcdId, playing?.notes ?? '');
}

async function renderLcdStrip(
  deck: StreamDeck,
  encoderIndex: number,
  lcdId: number,
  label: string,
  value: string,
  active: boolean,
): Promise<void> {
  const canvas = new OffscreenCanvas(LCD_W, LCD_H);
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#080810';
  ctx.fillRect(0, 0, LCD_W, LCD_H);

  ctx.fillStyle = active ? '#00d4ff' : '#334455';
  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(label, LCD_W / 2, 5);

  ctx.fillStyle = active ? '#00d4ff44' : '#223344';
  ctx.fillRect(10, 24, LCD_W - 20, 1);

  ctx.fillStyle = active ? '#00ff88' : '#cccccc';
  ctx.font = 'bold 17px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let text = value;
  while (text.length > 0 && ctx.measureText(text).width > LCD_W - 16) {
    text = text.slice(0, -1);
  }
  if (text !== value) text += '…';
  ctx.fillText(text, LCD_W / 2, 63);

  await flushStrip(deck, encoderIndex, lcdId, canvas);
}

async function renderPitchStrip(
  deck: StreamDeck,
  encoderIndex: number,
  lcdId: number,
  pitch: number,
  volume: number,
): Promise<void> {
  const canvas = new OffscreenCanvas(LCD_W, LCD_H);
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#080810';
  ctx.fillRect(0, 0, LCD_W, LCD_H);

  // Label
  const pitchModified = pitch !== 1.0;
  ctx.fillStyle = pitchModified ? '#fbbf24' : '#334455';
  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('PITCH VOCAL', LCD_W / 2, 5);

  ctx.fillStyle = pitchModified ? '#fbbf2444' : '#223344';
  ctx.fillRect(10, 24, LCD_W - 20, 1);

  // Pitch bar (0.5x to 2.0x, center at 1.0)
  const barX = 8;
  const barY = 30;
  const barW = LCD_W - 16;
  const barH = 14;
  const progress = (pitch - 0.5) / 1.5; // map 0.5-2.0 to 0-1

  ctx.fillStyle = '#152030';
  ctx.fillRect(barX, barY, barW, barH);

  ctx.fillStyle = pitchModified ? '#fbbf24' : '#335533';
  ctx.fillRect(barX, barY, Math.round(barW * progress), barH);

  // Center marker (at 1.0x)
  const centerX = barX + Math.round(barW * (1.0 - 0.5) / 1.5);
  ctx.fillStyle = '#ffffff44';
  ctx.fillRect(centerX - 1, barY - 2, 2, barH + 4);

  ctx.strokeStyle = pitchModified ? '#fbbf24' : '#223344';
  ctx.lineWidth = 1;
  ctx.strokeRect(barX, barY, barW, barH);

  // Value + volume
  ctx.fillStyle = '#e0e0e0';
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(`${pitch.toFixed(2)}x  vol:${Math.round(volume * 100)}%`, LCD_W / 2, LCD_H - 6);

  await flushStrip(deck, encoderIndex, lcdId, canvas);
}

async function renderAlibiStrip(
  deck: StreamDeck,
  encoderIndex: number,
  lcdId: number,
  alibi: string,
): Promise<void> {
  const canvas = new OffscreenCanvas(LCD_W, LCD_H);
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#080810';
  ctx.fillRect(0, 0, LCD_W, LCD_H);

  ctx.fillStyle = '#445566';
  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('ALIBI', LCD_W / 2, 5);

  ctx.fillStyle = '#223344';
  ctx.fillRect(10, 24, LCD_W - 20, 1);

  if (alibi) {
    ctx.fillStyle = '#99aabb';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const words = alibi.split(' ');
    let line = '';
    let y = 30;
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > LCD_W - 12) {
        ctx.fillText(line, LCD_W / 2, y);
        line = word;
        y += 15;
        if (y > LCD_H - 5) { ctx.fillText('…', LCD_W / 2, y); break; }
      } else {
        line = test;
      }
    }
    if (line && y <= LCD_H - 5) ctx.fillText(line, LCD_W / 2, y);
  }

  await flushStrip(deck, encoderIndex, lcdId, canvas);
}

async function flushStrip(
  deck: StreamDeck,
  encoderIndex: number,
  lcdId: number,
  canvas: OffscreenCanvas,
): Promise<void> {
  const imageData = canvas.getContext('2d')!.getImageData(0, 0, LCD_W, LCD_H);
  await deck.fillLcdRegion(lcdId, encoderIndex * LCD_W, 0, new Uint8Array(imageData.data.buffer), {
    format: 'rgba',
    width: LCD_W,
    height: LCD_H,
  });
}
