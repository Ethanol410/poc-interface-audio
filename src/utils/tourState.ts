/**
 * Module-level tour completion flag.
 * Resets on every page load (Ctrl+F5), persists through SPA navigation.
 */
let _completed = false;

export const isTourCompleted = () => _completed;
export const markTourCompleted = () => { _completed = true; };
export const resetTour = () => { _completed = false; };
