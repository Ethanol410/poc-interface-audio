/**
 * Stream Deck suspect LCD rendering.
 * Boutons suspects (photo + nom) + strips LCD "en écoute".
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

  // Background
  ctx.fillStyle = '#0d0d1a';
  ctx.fillRect(0, 0, width, height);

  // Load + cache photo
  if (suspect.photoUrl && !photoCache.has(suspect.photoUrl)) {
    try {
      const blob = await fetch(suspect.photoUrl).then((r) => r.blob());
      photoCache.set(suspect.photoUrl, await createImageBitmap(blob));
    } catch {
      /* ignore — no photo available */
    }
  }

  const bitmap = photoCache.get(suspect.photoUrl);
  if (bitmap) {
    const photoH = Math.round(height * 0.62);
    ctx.drawImage(bitmap, 0, 0, width, photoH);
    // Gradient overlay: photo fades into dark background
    const grad = ctx.createLinearGradient(0, photoH * 0.4, 0, photoH);
    grad.addColorStop(0, 'rgba(13,13,26,0)');
    grad.addColorStop(1, 'rgba(13,13,26,1)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, photoH);
  }

  // Name split first / last
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

  // Playing: green border + note icon
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

export async function renderEmptyKey(deck: StreamDeck, keyIndex: number): Promise<void> {
  await deck.fillKeyColor(keyIndex, 5, 5, 15);
}

// ─── LCD strip rendering ───────────────────────────────────────────────────

export async function renderSuspectStrips(
  deck: StreamDeck,
  lcdId: number,
  playing: SuspectRenderData | null,
): Promise<void> {
  await renderLcdStrip(deck, 0, lcdId, 'EN ÉCOUTE', playing?.name ?? '— AUCUN —', playing !== null);
  await renderLcdStrip(deck, 1, lcdId, 'RÔLE', playing?.role ?? '', false);
  await renderAlibiStrip(deck, 2, lcdId, playing?.notes ?? '');
  await renderLcdStrip(deck, 3, lcdId, 'CTRL', 'BTN 0-3 = JOUER', false);
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

  // Label
  ctx.fillStyle = active ? '#00d4ff' : '#334455';
  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(label, LCD_W / 2, 5);

  // Separator line
  ctx.fillStyle = active ? '#00d4ff44' : '#223344';
  ctx.fillRect(10, 24, LCD_W - 20, 1);

  // Value — truncate if needed
  ctx.fillStyle = active ? '#00ff88' : '#cccccc';
  ctx.font = `bold 17px monospace`;
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

  // Word-wrap in available area
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
