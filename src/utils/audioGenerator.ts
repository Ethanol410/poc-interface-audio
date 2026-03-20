/**
 * Audio Generator - Génère des fichiers audio de test synthétiques
 * Utilise du bruit blanc filtré par formants pour simuler la parole
 */

/**
 * Génère un buffer audio imitant une voix (bruit filtré par formants + enveloppe rythmique)
 */
export async function generateTestAudio(
  duration: number = 25,
  _frequency: number = 200,
  distorted: boolean = false
): Promise<Blob> {
  const AudioContextClass = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) throw new Error('AudioContext not supported');

  const ctx = new AudioContextClass();
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * duration;
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  // Vocal formant frequencies (F1/F2/F3 for a neutral vowel)
  const formants = distorted
    ? [{ f: 300, bw: 120 }, { f: 900, bw: 200 }, { f: 2200, bw: 300 }, { f: 3400, bw: 400 }]
    : [{ f: 700, bw: 130 }, { f: 1200, bw: 180 }, { f: 2600, bw: 250 }];

  // Build simple IIR bandpass per formant using biquad coefficients
  type BandpassState = { b0: number; b2: number; a1: number; a2: number; x1: number; x2: number; y1: number; y2: number };

  const bpFilters: BandpassState[] = formants.map(({ f, bw }) => {
    const w0 = 2 * Math.PI * f / sampleRate;
    const bwRad = 2 * Math.PI * bw / sampleRate;
    const alpha = Math.sin(w0) * Math.sinh(Math.log(2) / 2 * bwRad / Math.sin(w0));
    const b0 = alpha;
    const b2 = -alpha;
    const a0 = 1 + alpha;
    const a1 = -2 * Math.cos(w0);
    const a2 = 1 - alpha;
    return { b0: b0 / a0, b2: b2 / a0, a1: a1 / a0, a2: a2 / a0, x1: 0, x2: 0, y1: 0, y2: 0 };
  });

  // Syllable envelope parameters (speech rhythm ~ 4-5 syllables/sec)
  const syllableRate = distorted ? 3.5 : 4.5;
  const syllablePeriod = sampleRate / syllableRate;

  for (let i = 0; i < length; i++) {
    // White noise input
    const x = (Math.random() * 2 - 1) * 0.3;

    // Sum formant outputs
    let out = 0;
    for (const f of bpFilters) {
      const y = f.b0 * x + f.b2 * f.x2 - f.a1 * f.y1 - f.a2 * f.y2;
      f.x2 = f.x1; f.x1 = x;
      f.y2 = f.y1; f.y1 = y;
      out += y;
    }

    // Syllable envelope (raised cosine)
    const phase = (i % syllablePeriod) / syllablePeriod;
    const envelope = Math.max(0, Math.sin(Math.PI * phase)) ** 0.6;

    // Fade in/out edges
    const t = i / sampleRate;
    const fade = Math.min(1, t / 0.3, (duration - t) / 0.3);

    // Add low-frequency pitch hum for distorted version
    const buzz = distorted ? Math.sin(2 * Math.PI * 120 * t) * 0.08 : 0;

    data[i] = Math.max(-1, Math.min(1, (out * 2 + buzz) * envelope * fade));
  }

  await ctx.close();
  return audioBufferToWav(buffer);
}

/**
 * Génère une voix de suspect (formants légèrement différents par suspect)
 */
export async function generateSuspectVoice(
  suspectId: number,
  duration: number = 15
): Promise<Blob> {
  // Each suspect gets a different base frequency offset (simulates different pitch)
  return generateTestAudio(duration, 180 + suspectId * 30, false);
}

/**
 * Convertit un AudioBuffer en fichier WAV
 */
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const length = buffer.length * buffer.numberOfChannels * 2;
  const arrayBuffer = new ArrayBuffer(44 + length);
  const view = new DataView(arrayBuffer);
  const channels: Float32Array[] = [];
  let offset = 0;
  let pos = 0;

  setUint32(0x46464952); // "RIFF"
  setUint32(36 + length);
  setUint32(0x45564157); // "WAVE"
  setUint32(0x20746d66); // "fmt "
  setUint32(16);
  setUint16(1); // PCM
  setUint16(buffer.numberOfChannels);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels);
  setUint16(buffer.numberOfChannels * 2);
  setUint16(16);
  setUint32(0x61746164); // "data"
  setUint32(length);

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < buffer.length) {
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][pos]));
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(44 + offset, sample, true);
      offset += 2;
    }
    pos++;
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });

  function setUint16(data: number) { view.setUint16(pos, data, true); pos += 2; }
  function setUint32(data: number) { view.setUint32(pos, data, true); pos += 4; }
}

/**
 * Inverse les samples d'un Blob audio et retourne un nouveau Blob WAV.
 */
export async function reverseAudioBlob(blob: Blob): Promise<Blob> {
  const AudioContextClass = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) throw new Error('AudioContext not supported');
  const audioContext = new AudioContextClass();

  const arrayBuffer = await blob.arrayBuffer();
  const decoded = await audioContext.decodeAudioData(arrayBuffer);

  const reversed = audioContext.createBuffer(
    decoded.numberOfChannels,
    decoded.length,
    decoded.sampleRate,
  );

  for (let channel = 0; channel < decoded.numberOfChannels; channel++) {
    const src = decoded.getChannelData(channel);
    const dst = reversed.getChannelData(channel);
    const len = decoded.length;
    for (let i = 0; i < len; i++) {
      dst[i] = src[len - 1 - i];
    }
  }

  await audioContext.close();
  return audioBufferToWav(reversed);
}

/**
 * Génère tous les fichiers audio de test nécessaires
 */
export async function generateAllTestAudios(): Promise<{
  evidenceDistorted: Blob;
  evidenceClean: Blob;
  evidenceReverse: Blob;
  suspect1: Blob;
  suspect2: Blob;
  suspect3: Blob;
  suspect4: Blob;
}> {
  const [evidenceDistorted, evidenceClean, suspect1, suspect2, suspect3, suspect4] =
    await Promise.all([
      generateTestAudio(25, 200, true),
      generateTestAudio(25, 200, false),
      generateSuspectVoice(1, 15),
      generateSuspectVoice(2, 15),
      generateSuspectVoice(3, 15),
      generateSuspectVoice(4, 15),
    ]);

  const evidenceReverse = await reverseAudioBlob(evidenceDistorted);

  return { evidenceDistorted, evidenceClean, evidenceReverse, suspect1, suspect2, suspect3, suspect4 };
}

export function createAudioURL(blob: Blob): string {
  return URL.createObjectURL(blob);
}

export function revokeAudioURL(url: string): void {
  URL.revokeObjectURL(url);
}
