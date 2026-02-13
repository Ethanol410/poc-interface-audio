/**
 * worker_threads shim for browser compatibility
 * This module is used to replace Node.js worker_threads in browser environment
 */

// Empty shim - worker_threads is not available in browser
export const Worker = null;
export const isMainThread = true;
export const parentPort = null;
export const workerData = null;

// No-op functions
export const threadId = 0;

export default {
  Worker,
  isMainThread,
  parentPort,
  workerData,
  threadId,
};
