import { beforeEach, describe, expect, it } from 'vitest';
import { activateRegulationWithConfig, useSessionStore } from './sessionStore';

function resetSessionStore() {
  useSessionStore.setState({ session: null });
}

describe('sessionStore edge cases', () => {
  beforeEach(() => {
    resetSessionStore();
  });

  it('handles abandon while regulation is active', () => {
    const store = useSessionStore.getState();

    store.createSession({
      trackId: 'silverstone',
      seasonYear: 2026,
      durationSec: 1500,
      strategyNote: 'Focus sprint',
      parcFerme: false,
      penaltyTriggers: ['pause', 'unfocus'],
    });
    store.startSession();

    activateRegulationWithConfig('boost', 2, 30, 120);
    useSessionStore.getState().abandonSession();

    const session = useSessionStore.getState().session;
    expect(session).not.toBeNull();

    expect(session?.state).toBe('abandoned');
    expect(session?.activeRegulation).toBeNull();
    expect(session?.regulationEndTime).toBeNull();
    expect(session?.currentPaceMultiplier).toBe(1);
    expect(session?.completedAt).not.toBeNull();

    const eventTypes = session?.events.map((event) => event.type) ?? [];
    expect(eventTypes).toContain('session_abandon');
  });

  it('ignores invalid transition from completed back to running', () => {
    const store = useSessionStore.getState();

    store.createSession({
      trackId: 'silverstone',
      seasonYear: 2026,
      durationSec: 60,
      strategyNote: '',
      parcFerme: false,
      penaltyTriggers: ['pause'],
    });
    store.startSession();

    store.tick(60_000);
    const completed = useSessionStore.getState().session;
    expect(completed?.state).toBe('completed');

    store.resumeSession();
    const afterInvalidResume = useSessionStore.getState().session;
    expect(afterInvalidResume?.state).toBe('completed');
  });

  it('allows updating strategy note during running session when parc ferme is off', () => {
    const store = useSessionStore.getState();

    store.createSession({
      trackId: 'silverstone',
      seasonYear: 2026,
      durationSec: 1500,
      strategyNote: 'Initial plan',
      parcFerme: false,
      penaltyTriggers: ['pause'],
    });
    store.startSession();

    store.updateStrategyNote('Initial plan\nSecond point');

    const session = useSessionStore.getState().session;
    expect(session?.strategyNote).toBe('Initial plan\nSecond point');
  });

  it('blocks updating strategy note during running session when parc ferme is on', () => {
    const store = useSessionStore.getState();

    store.createSession({
      trackId: 'silverstone',
      seasonYear: 2026,
      durationSec: 1500,
      strategyNote: 'Locked plan',
      parcFerme: true,
      penaltyTriggers: ['pause'],
    });
    store.startSession();

    store.updateStrategyNote('Locked plan\nAttempted change');

    const session = useSessionStore.getState().session;
    expect(session?.strategyNote).toBe('Locked plan');
  });
});
