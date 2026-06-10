// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../engine/penaltyDetector', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../engine/penaltyDetector')>();
  return {
    ...actual,
    createIdleDetector: vi.fn(),
    createUnfocusDetector: vi.fn(),
  };
});

import { createIdleDetector, createUnfocusDetector, type PenaltyCallback } from '../engine/penaltyDetector';
import { usePenaltyDetection } from './usePenaltyDetection';
import { useSessionStore, activateRegulationWithConfig } from '../stores/sessionStore';
import { season2026 } from '../data/seasons/season2026';

describe('usePenaltyDetection hook', () => {
  let mockIdleDetector: { start: any; stop: any; destroy: any };
  let mockUnfocusDetector: { start: any; stop: any; destroy: any };
  let idleCallback: PenaltyCallback;
  let unfocusCallback: PenaltyCallback;

  beforeEach(() => {
    vi.clearAllMocks();
    useSessionStore.setState({ session: null });

    mockIdleDetector = {
      start: vi.fn(),
      stop: vi.fn(),
      destroy: vi.fn(),
    };
    mockUnfocusDetector = {
      start: vi.fn(),
      stop: vi.fn(),
      destroy: vi.fn(),
    };

    // Capture the callbacks provided by the hook so we can trigger penalties manually
    vi.mocked(createIdleDetector).mockImplementation((_threshold, callback) => {
      idleCallback = callback;
      return mockIdleDetector;
    });

    vi.mocked(createUnfocusDetector).mockImplementation((_gracePeriod, callback) => {
      unfocusCallback = callback;
      return mockUnfocusDetector;
    });
  });

  it('creates detectors and starts/stops them based on session state', () => {
    const { rerender, unmount } = renderHook(() => usePenaltyDetection());

    // Initially no session, detectors should be created but not started
    expect(createIdleDetector).toHaveBeenCalled();
    expect(createUnfocusDetector).toHaveBeenCalled();

    const store = useSessionStore.getState();
    store.createSession({
      trackId: 'silverstone',
      seasonYear: 2026,
      durationSec: 1500,
      strategyNote: '',
      parcFerme: false,
      penaltyTriggers: ['idle', 'unfocus'],
    });

    // Not running yet, shouldn't start
    expect(mockIdleDetector.start).not.toHaveBeenCalled();

    store.startSession();
    // React state update will trigger rerender, but we rerender manually for testing
    rerender();

    expect(mockIdleDetector.start).toHaveBeenCalled();
    expect(mockUnfocusDetector.start).toHaveBeenCalled();

    // Pause session
    store.pauseSession();
    rerender();

    expect(mockIdleDetector.stop).toHaveBeenCalled();
    expect(mockUnfocusDetector.stop).toHaveBeenCalled();

    // Unmount cleans up
    unmount();
    expect(mockIdleDetector.destroy).toHaveBeenCalled();
    expect(mockUnfocusDetector.destroy).toHaveBeenCalled();
  });

  it('applies penalty when triggered and enabled', () => {
    renderHook(() => usePenaltyDetection());

    const store = useSessionStore.getState();
    store.createSession({
      trackId: 'silverstone',
      seasonYear: 2026,
      durationSec: 1500,
      strategyNote: '',
      parcFerme: false,
      penaltyTriggers: ['idle'], // Only idle enabled
    });
    store.startSession();

    let session = useSessionStore.getState().session;
    expect(session?.totalPenaltySec).toBe(0);

    // Trigger idle penalty
    idleCallback('idle');

    session = useSessionStore.getState().session;
    expect(session?.totalPenaltySec).toBe(season2026.penaltyConfig.idlePenaltySec); // 20s for 2026

    // Trigger unfocus penalty (should be ignored because it is not enabled for this session)
    unfocusCallback('unfocus');

    session = useSessionStore.getState().session;
    expect(session?.totalPenaltySec).toBe(season2026.penaltyConfig.idlePenaltySec); // Unchanged
  });

  it('applies interruption multiplier when regulation is active and deactivates it', () => {
    renderHook(() => usePenaltyDetection());

    const store = useSessionStore.getState();
    store.createSession({
      trackId: 'silverstone',
      seasonYear: 2026,
      durationSec: 1500,
      strategyNote: '',
      parcFerme: false,
      penaltyTriggers: ['unfocus'],
    });
    store.startSession();

    // Activate regulation (boost)
    // type, paceMultiplier, durationSec, cooldownSec
    const boostConfig = season2026.regulations.find(r => r.type === 'boost')!;
    activateRegulationWithConfig(
      'boost',
      boostConfig.paceMultiplier,
      boostConfig.durationSec,
      boostConfig.cooldownSec
    );

    let session = useSessionStore.getState().session;
    expect(session?.activeRegulation).toBe('boost');
    expect(session?.totalPenaltySec).toBe(0);

    // Trigger unfocus penalty
    unfocusCallback('unfocus');

    session = useSessionStore.getState().session;

    // In 2026, unfocus penalty is 10s. boost has interruptionPenaltyMultiplier = 1.5
    // Penalty should be 10 * 1.5 = 15s
    const expectedPenalty = season2026.penaltyConfig.unfocusPenaltySec * boostConfig.interruptionPenaltyMultiplier!;
    expect(session?.totalPenaltySec).toBe(expectedPenalty);

    // Regulation should be deactivated
    expect(session?.activeRegulation).toBeNull();

    // Verify regulation_interrupted event was logged
    const events = session?.events ?? [];
    const interruptEvent = events.find(e => e.type === 'regulation_interrupted');
    expect(interruptEvent).toBeDefined();
    expect(interruptEvent?.metadata).toEqual({
      regulationType: 'boost',
      trigger: 'unfocus',
      penaltySec: expectedPenalty,
    });
  });
});
