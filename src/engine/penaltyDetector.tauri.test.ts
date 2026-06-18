// @vitest-environment jsdom
//
// Covers the Tauri-native focus path of createUnfocusDetector. The sibling
// penaltyDetector.test.ts mocks @tauri-apps/api/window to throw (exercising the
// browser fallback); here we mock it to succeed so the native onFocusChanged
// branch and its unlisten cleanup are exercised.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type FocusHandler = (event: { payload: boolean }) => void;

let focusHandler: FocusHandler | null = null;
const unlistenSpy = vi.fn();
const onFocusChangedSpy = vi.fn(async (cb: FocusHandler) => {
  focusHandler = cb;
  return unlistenSpy;
});

vi.mock('@tauri-apps/api/window', () => ({
  getCurrentWindow: () => ({
    onFocusChanged: onFocusChangedSpy,
  }),
}));

import { createUnfocusDetector } from './penaltyDetector';

beforeEach(() => {
  focusHandler = null;
  unlistenSpy.mockClear();
  onFocusChangedSpy.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('createUnfocusDetector — Tauri native path', () => {
  it('registers a native focus listener and penalizes after the grace period', async () => {
    vi.useFakeTimers();
    const onPenalty = vi.fn();
    const detector = createUnfocusDetector(500, onPenalty);

    detector.start();
    await vi.waitFor(() => expect(focusHandler).not.toBeNull());

    // Native focus-lost event.
    focusHandler!({ payload: false });
    vi.advanceTimersByTime(501);

    expect(onPenalty).toHaveBeenCalledTimes(1);
    expect(onPenalty).toHaveBeenLastCalledWith('unfocus');

    detector.destroy();
    expect(unlistenSpy).toHaveBeenCalledTimes(1);
  });

  it('cancels the pending penalty if focus returns within the grace period', async () => {
    vi.useFakeTimers();
    const onPenalty = vi.fn();
    const detector = createUnfocusDetector(500, onPenalty);

    detector.start();
    await vi.waitFor(() => expect(focusHandler).not.toBeNull());

    focusHandler!({ payload: false });
    vi.advanceTimersByTime(300);
    focusHandler!({ payload: true }); // regained focus
    vi.advanceTimersByTime(500);

    expect(onPenalty).not.toHaveBeenCalled();
    detector.destroy();
  });

  it('only sets up the native listener once across repeated start() calls', async () => {
    vi.useFakeTimers();
    const onPenalty = vi.fn();
    const detector = createUnfocusDetector(500, onPenalty);

    detector.start();
    detector.start();
    await vi.waitFor(() => expect(focusHandler).not.toBeNull());

    expect(onFocusChangedSpy).toHaveBeenCalledTimes(1);
    detector.destroy();
  });

  it('skips native listener setup when destroyed before the dynamic import resolves', async () => {
    const onPenalty = vi.fn();
    const detector = createUnfocusDetector(500, onPenalty);

    detector.start();
    detector.destroy(); // destroyed before the import settles
    await vi.dynamicImportSettled();

    expect(onFocusChangedSpy).not.toHaveBeenCalled();
    expect(focusHandler).toBeNull();
  });

  it('ignores focus events fired after stop()', async () => {
    vi.useFakeTimers();
    const onPenalty = vi.fn();
    const detector = createUnfocusDetector(500, onPenalty);

    detector.start();
    await vi.waitFor(() => expect(focusHandler).not.toBeNull());

    detector.stop();
    focusHandler!({ payload: false });
    vi.advanceTimersByTime(1000);

    expect(onPenalty).not.toHaveBeenCalled();
    detector.destroy();
  });
});
