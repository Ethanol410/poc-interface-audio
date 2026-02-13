/**
 * Audio Generator - Génère des fichiers audio de test synthétiques
 * Utilisé pour tester l'application sans fichiers audio réels
 */

/**
 * Génère un fichier audio avec une voix synthétique (ton pur modulé)
 */
export async function generateTestAudio(
  duration: number = 25,
  frequency: number = 200,
  modulation: boolean = false
): Promise<Blob> {
  // Create AudioContext
  const AudioContextClass = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) {
    throw new Error('AudioContext not supported');
  }
  const audioContext = new AudioContextClass();
  const sampleRate = audioContext.sampleRate;
  const numberOfChannels = 2;
  const length = sampleRate * duration;

  // Create buffer
  const audioBuffer = audioContext.createBuffer(
    numberOfChannels,
    length,
    sampleRate
  );

  // Fill buffer with synthesized audio
  for (let channel = 0; channel < numberOfChannels; channel++) {
    const channelData = audioBuffer.getChannelData(channel);
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let signal = 0;

      if (modulation) {
        // Voix modulée avec fréquences multiples (simule voix distordue)
        signal =
          Math.sin(2 * Math.PI * frequency * t) * 0.3 +
          Math.sin(2 * Math.PI * (frequency * 1.5) * t) * 0.2 +
          Math.sin(2 * Math.PI * (frequency * 2) * t) * 0.15 +
          (Math.random() - 0.5) * 0.05; // Noise
        
        // Envelope (fade in/out)
        const fadeTime = 0.5;
        if (t < fadeTime) {
          signal *= t / fadeTime;
        } else if (t > duration - fadeTime) {
          signal *= (duration - t) / fadeTime;
        }
      } else {
        // Voix "clean" - plus simple
        signal =
          Math.sin(2 * Math.PI * frequency * t) * 0.25 +
          Math.sin(2 * Math.PI * (frequency * 2) * t) * 0.1;
        
        // Envelope
        const fadeTime = 0.3;
        if (t < fadeTime) {
          signal *= t / fadeTime;
        } else if (t > duration - fadeTime) {
          signal *= (duration - t) / fadeTime;
        }
      }

      channelData[i] = signal;
    }
  }

  // Convert to WAV
  const wavBlob = audioBufferToWav(audioBuffer);
  return wavBlob;
}

/**
 * Génère un fichier audio pour un suspect (voix différente)
 */
export async function generateSuspectVoice(
  suspectId: number,
  duration: number = 15
): Promise<Blob> {
  const baseFrequency = 180 + suspectId * 30; // Fréquences différentes par suspect
  return generateTestAudio(duration, baseFrequency, false);
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

  // Write WAV header
  setUint32(0x46464952); // "RIFF"
  setUint32(36 + length); // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(buffer.numberOfChannels);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels); // avg. bytes/sec
  setUint16(buffer.numberOfChannels * 2); // block-align
  setUint16(16); // 16-bit

  setUint32(0x61746164); // "data" - chunk
  setUint32(length); // chunk length

  // Write interleaved data
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < buffer.length) {
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][pos])); // clamp
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff; // scale to 16-bit signed int
      view.setInt16(44 + offset, sample, true); // write 16-bit sample
      offset += 2;
    }
    pos++;
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
}

/**
 * Génère tous les fichiers audio de test nécessaires
 */
export async function generateAllTestAudios(): Promise<{
  evidenceDistorted: Blob;
  evidenceClean: Blob;
  suspect1: Blob;
  suspect2: Blob;
  suspect3: Blob;
}> {
  const [evidenceDistorted, evidenceClean, suspect1, suspect2, suspect3] =
    await Promise.all([
      generateTestAudio(25, 200, true), // Evidence modifiée
      generateTestAudio(25, 200, false), // Evidence clean
      generateSuspectVoice(1, 15), // Suspect 1
      generateSuspectVoice(2, 15), // Suspect 2
      generateSuspectVoice(3, 15), // Suspect 3
    ]);

  return {
    evidenceDistorted,
    evidenceClean,
    suspect1,
    suspect2,
    suspect3,
  };
}

/**
 * Crée un URL blob à partir d'un Blob audio
 */
export function createAudioURL(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * Libère un URL blob
 */
export function revokeAudioURL(url: string): void {
  URL.revokeObjectURL(url);
}
