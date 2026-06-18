// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRegulations } from './useRegulations';
import { useSessionStore } from '../stores/sessionStore';
import { useSettingsStore } from '../stores/settingsStore';
import { DEFAULT_SETTINGS } from '../types/settings';

function startSession(seasonYear = 2026) {
  const store = useSessionStore.getState();
  store.createSession({
    trackId: 'silverstone',
    seasonYear,
    durationSec: 1500,
    strategyNote: '',
    parcFerme: false,
    penaltyTriggers: ['pause'],
  });
  store.startSession();
}

beforeEach(() => {
  useSessionStore.setState({ session: null });
  useSettingsStore.setState({ settings: { ...DEFAULT_SETTINGS } });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useRegulations', () => {
  it('returns an empty ruleset and no regulations when there is no session', () => {
    const { result } = renderHook(() => useRegulations());
    expect(result.current.ruleset).toBeNull();
    expect(result.current.regulations).toEqual([]);
    expect(result.current.activeRegulation).toBeNull();

    // activate / deactivate are safe no-ops without a session.
    act(() => result.current.activate('boost'));
    expect(useSessionStore.getState().session).toBeNull();
    act(() => result.current.deactivate());
    expect(useSessionStore.getState().session).toBeNull();
  });

  it('exposes the season regulations with their button state for a running session', () => {
    startSession(2026);
    const { result } = renderHook(() => useRegulations());

    expect(result.current.ruleset?.seasonYear).toBe(2026);
    const types = result.current.regulations.map((r) => r.type);
    expect(types).toEqual(['boost', 'overtake']);

    const boost = result.current.regulations.find((r) => r.type === 'boost')!;
    expect(boost.state).toBe('available');
    expect(boost.canActivate.allowed).toBe(true);
    expect(boost.remainingUses).toBe(3);
    expect(boost.config.label).toBe('BOOST');
  });

  it('activates a regulation through the engine + store', () => {
    startSession(2026);
    const { result } = renderHook(() => useRegulations());

    act(() => result.current.activate('boost'));

    const session = useSessionStore.getState().session!;
    expect(session.activeRegulation).toBe('boost');
    // Pace multiplier comes from the 2026 boost config (1.25x).
    expect(session.currentPaceMultiplier).toBe(1.25);
    // The hook reflects the active regulation after the store update.
    expect(result.current.activeRegulation).toBe('boost');
    expect(result.current.regulations.find((r) => r.type === 'boost')!.state).toBe('active');
    expect(result.current.regulations.find((r) => r.type === 'overtake')!.state).toBe('locked');
  });

  it('does not activate a regulation that is not in the season', () => {
    startSession(2026); // DRS is not part of 2026
    const { result } = renderHook(() => useRegulations());

    act(() => result.current.activate('drs'));
    expect(useSessionStore.getState().session!.activeRegulation).toBeNull();
  });

  it('does not activate when the session is not running', () => {
    startSession(2026);
    act(() => {
      useSessionStore.getState().pauseSession();
    });
    const { result } = renderHook(() => useRegulations());

    act(() => result.current.activate('boost'));
    expect(useSessionStore.getState().session!.activeRegulation).toBeNull();
  });

  it('does not activate a second regulation while one is already active', () => {
    startSession(2026);
    const { result } = renderHook(() => useRegulations());

    act(() => result.current.activate('boost'));
    act(() => result.current.activate('overtake')); // blocked by canActivate
    expect(useSessionStore.getState().session!.activeRegulation).toBe('boost');
  });

  it('deactivates the active regulation', () => {
    startSession(2026);
    const { result } = renderHook(() => useRegulations());

    act(() => result.current.activate('boost'));
    expect(useSessionStore.getState().session!.activeRegulation).toBe('boost');

    act(() => result.current.deactivate());
    expect(useSessionStore.getState().session!.activeRegulation).toBeNull();
    expect(result.current.activeRegulation).toBeNull();
  });

  it('surfaces the 2025 DRS + Overtake regulations', () => {
    startSession(2025);
    const { result } = renderHook(() => useRegulations());
    const types = result.current.regulations.map((r) => r.type);
    expect(types).toEqual(['drs', 'overtake']);
  });
});
