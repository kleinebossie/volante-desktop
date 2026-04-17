// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@tauri-apps/api/window', () => {
  throw new Error('Tauri window API not available in unit tests');
});

import {
  UNFOCUS_GRACE_PERIOD_MS,
  createIdleDetector,
  createUnfocusDetector,
  getPenaltyAmount,
  isPenaltyEnabled,
} from './penaltyDetector';

const PENALTY_CONFIG = {
  pausePenaltySec: 15,
  unfocusPenaltySec: 10,
  idlePenaltySec: 20,
  idleThresholdSec: 120,
};

afterEach(() => {
  vi.useRealTimers();
});

describe('penaltyDetector helpers', () => {
  it('maps each trigger to the correct penalty amount', () => {
    expect(getPenaltyAmount('pause', PENALTY_CONFIG)).toBe(15);
    expect(getPenaltyAmount('unfocus', PENALTY_CONFIG)).toBe(10);
    expect(getPenaltyAmount('idle', PENALTY_CONFIG)).toBe(20);
  });

  it('checks whether a trigger is enabled', () => {
    const enabled = ['pause', 'idle'] as const;

    expect(isPenaltyEnabled('pause', [...enabled])).toBe(true);
    expect(isPenaltyEnabled('idle', [...enabled])).toBe(true);
    expect(isPenaltyEnabled('unfocus', [...enabled])).toBe(false);
  });
});

describe('createIdleDetector', () => {
  it('fires idle penalty after threshold and repeats while still idle', () => {
    vi.useFakeTimers();

    const onPenalty = vi.fn();
    const detector = createIdleDetector(1000, onPenalty);

    detector.start();

    vi.advanceTimersByTime(1000);
    expect(onPenalty).toHaveBeenCalledTimes(1);
    expect(onPenalty).toHaveBeenLastCalledWith('idle');

    vi.advanceTimersByTime(1000);
    expect(onPenalty).toHaveBeenCalledTimes(2);

    detector.destroy();
  });

  it('resets idle countdown when user interacts', () => {
    vi.useFakeTimers();

    const onPenalty = vi.fn();
    const detector = createIdleDetector(1000, onPenalty);

    detector.start();
    vi.advanceTimersByTime(600);

    document.dispatchEvent(new MouseEvent('mousemove'));

    vi.advanceTimersByTime(600);
    expect(onPenalty).toHaveBeenCalledTimes(0);

    vi.advanceTimersByTime(400);
    expect(onPenalty).toHaveBeenCalledTimes(1);

    detector.destroy();
  });

  it('stops firing penalties when stopped', () => {
    vi.useFakeTimers();

    const onPenalty = vi.fn();
    const detector = createIdleDetector(500, onPenalty);

    detector.start();
    vi.advanceTimersByTime(400);
    detector.stop();
    vi.advanceTimersByTime(2000);

    expect(onPenalty).toHaveBeenCalledTimes(0);

    detector.destroy();
  });
});

describe('createUnfocusDetector', () => {
  it('does not penalize if focus returns before grace period', async () => {
    vi.useFakeTimers();

    const onPenalty = vi.fn();
    const detector = createUnfocusDetector(UNFOCUS_GRACE_PERIOD_MS, onPenalty);

    detector.start();
    await vi.dynamicImportSettled();

    window.dispatchEvent(new Event('blur'));
    vi.advanceTimersByTime(UNFOCUS_GRACE_PERIOD_MS - 1);
    window.dispatchEvent(new Event('focus'));
    vi.advanceTimersByTime(10);

    expect(onPenalty).not.toHaveBeenCalled();

    detector.destroy();
  });

  it('penalizes after grace period when still unfocused', async () => {
    vi.useFakeTimers();

    const onPenalty = vi.fn();
    const detector = createUnfocusDetector(500, onPenalty);

    detector.start();
    await vi.dynamicImportSettled();

    window.dispatchEvent(new Event('blur'));
    vi.advanceTimersByTime(501);

    expect(onPenalty).toHaveBeenCalledTimes(1);
    expect(onPenalty).toHaveBeenLastCalledWith('unfocus');

    detector.destroy();
  });

  it('stops pending unfocus penalties when stopped', async () => {
    vi.useFakeTimers();

    const onPenalty = vi.fn();
    const detector = createUnfocusDetector(500, onPenalty);

    detector.start();
    await vi.dynamicImportSettled();

    window.dispatchEvent(new Event('blur'));
    vi.advanceTimersByTime(300);
    detector.stop();
    vi.advanceTimersByTime(300);

    expect(onPenalty).toHaveBeenCalledTimes(0);

    detector.destroy();
  });
});
