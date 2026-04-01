import '@testing-library/jest-dom';

// Mock Web Audio API (not available in jsdom)
class MockAudioContext {
  state: AudioContextState = 'running';
  createBiquadFilter() {
    return { type: '', frequency: { value: 0 }, Q: { value: 0 }, connect: () => {} };
  }
  createGain() { return { gain: { value: 0 }, connect: () => {} }; }
  createDynamicsCompressor() {
    return { threshold: { value: 0 }, ratio: { value: 0 }, connect: () => {} };
  }
  createAnalyser() { return { fftSize: 0, connect: () => {} }; }
  createMediaElementSource() { return { connect: () => {} }; }
  get destination() { return {}; }
  resume() { return Promise.resolve(); }
  close() { return Promise.resolve(); }
  suspend() { return Promise.resolve(); }
}

Object.defineProperty(window, 'AudioContext', { writable: true, value: MockAudioContext });
Object.defineProperty(window, 'webkitAudioContext', { writable: true, value: MockAudioContext });
