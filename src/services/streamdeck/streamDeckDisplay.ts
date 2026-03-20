/**
 * Stream Deck LCD rendering via OffscreenCanvas.
 * Renders button images (120×120px) and encoder LCD strips (200×100px each).
 */

import type { StreamDeck } from '@elgato-stream-deck/webhid';

// Stream Deck+ LCD strip: 800×100px total, 200×100px per encoder
const LCD_SEGMENT_PER_ENCODER_WIDTH = 200;
const LCD_SEGMENT_HEIGHT = 100;

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

/**
 * Render a button LCD with label, icon, and active state.
 */
export async function renderButtonKey(
  deck: StreamDeck,
  keyIndex: number,
  label: string,
  icon: string,
  active: boolean,
  colorOn: string,
  colorOff: string,
): Promise<void> {
  // Find button pixel size from CONTROLS
  const buttonControl = deck.CONTROLS.find(
    (c) => c.type === 'button' && 'index' in c && c.index === keyIndex,
  );
  if (!buttonControl || !('feedbackType' in buttonControl) || buttonControl.feedbackType !== 'lcd') {
    // Fallback to solid color for non-LCD buttons
    const [r, g, b] = hexToRgb(active ? colorOn : colorOff);
    await deck.fillKeyColor(keyIndex, r, g, b);
    return;
  }

  const { width, height } = buttonControl.pixelSize;
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background
  ctx.fillStyle = active ? colorOn : colorOff;
  ctx.fillRect(0, 0, width, height);

  // Subtle border for depth
  if (active) {
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, width - 4, height - 4);
  }

  // Icon
  const iconFontSize = Math.round(height * 0.38);
  ctx.fillStyle = active ? '#000000' : '#888888';
  ctx.font = `bold ${iconFontSize}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(icon, width / 2, height * 0.55);

  // Label
  const labelFontSize = Math.round(height * 0.2);
  ctx.fillStyle = active ? '#000000aa' : '#444444';
  ctx.font = `bold ${labelFontSize}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(label, width / 2, height - 10);

  const imageData = ctx.getImageData(0, 0, width, height);
  await deck.fillKeyBuffer(keyIndex, imageData.data, { format: 'rgba' });
}

/**
 * Render an encoder LCD strip segment with label, progress bar, and value.
 * lcdSegmentId: the id of the LCD segment (0 for Stream Deck+)
 */
export async function renderDialStrip(
  deck: StreamDeck,
  encoderIndex: number,
  lcdSegmentId: number,
  label: string,
  value: number,
  min: number,
  max: number,
  unit: string,
  active: boolean,
): Promise<void> {
  const W = LCD_SEGMENT_PER_ENCODER_WIDTH;
  const H = LCD_SEGMENT_HEIGHT;
  const canvas = new OffscreenCanvas(W, H);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background
  ctx.fillStyle = '#080810';
  ctx.fillRect(0, 0, W, H);

  // Top label
  ctx.fillStyle = active ? '#00d4ff' : '#334455';
  ctx.font = 'bold 15px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(label, W / 2, 6);

  // Progress bar
  const barX = 8;
  const barY = 30;
  const barW = W - 16;
  const barH = 18;
  const progress = max === min ? 0 : (value - min) / (max - min);

  // Bar background
  ctx.fillStyle = '#152030';
  ctx.fillRect(barX, barY, barW, barH);

  // Bar fill
  ctx.fillStyle = active ? '#00ff88' : '#005533';
  ctx.fillRect(barX, barY, Math.round(barW * progress), barH);

  // Bar border
  ctx.strokeStyle = active ? '#00d4ff' : '#223344';
  ctx.lineWidth = 1;
  ctx.strokeRect(barX, barY, barW, barH);

  // Value text
  let displayValue: string;
  if (Number.isInteger(value)) {
    displayValue = String(value);
  } else {
    displayValue = value.toFixed(2);
  }
  ctx.fillStyle = '#e0e0e0';
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(`${displayValue}${unit}`, W / 2, H - 6);

  const imageData = ctx.getImageData(0, 0, W, H);
  const xOffset = encoderIndex * W;
  await deck.fillLcdRegion(lcdSegmentId, xOffset, 0, new Uint8Array(imageData.data.buffer), {
    format: 'rgba',
    width: W,
    height: H,
  });
}

/**
 * Clear all button keys to black.
 */
export async function clearAllButtons(deck: StreamDeck): Promise<void> {
  const buttonCount = deck.CONTROLS.filter((c) => c.type === 'button').length;
  for (let i = 0; i < buttonCount; i++) {
    await deck.fillKeyColor(i, 0, 0, 0);
  }
}
