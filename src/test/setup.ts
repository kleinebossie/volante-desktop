/**
 * setup.ts — Global test setup, loaded by vitest before every test file.
 *
 * It does three things:
 *   1. Registers @testing-library/jest-dom matchers (toBeInTheDocument, etc.)
 *   2. Polyfills ResizeObserver — jsdom has no implementation, but several
 *      components (TrackSelector) construct one on mount.
 *   3. Polyfills window.matchMedia — also absent in jsdom and touched by
 *      some animation libraries.
 *
 * Per-test SVG geometry stubs (getTotalLength / getPointAtLength) live in the
 * individual TrackRenderer / interpolatePath tests, since their return values
 * are test-specific.
 */

import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Unmount anything rendered by Testing Library between tests. Auto-cleanup only
// fires when vitest globals are enabled; we register it explicitly so each test
// starts with a clean document regardless of config.
afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------
// ResizeObserver — jsdom does not implement it.
// ---------------------------------------------------------------------------
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver =
    ResizeObserverStub as unknown as typeof ResizeObserver;
}

// ---------------------------------------------------------------------------
// matchMedia — jsdom does not implement it.
// ---------------------------------------------------------------------------
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}
