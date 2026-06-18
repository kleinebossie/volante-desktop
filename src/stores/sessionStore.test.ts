import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { activateRegulationWithConfig, useSessionStore } from './sessionStore';
import type { CreateSessionParams } from './sessionStore';

function resetSessionStore() {
  useSessionStore.setState({ session: null });
}

const baseParams: CreateSessionParams = {
  trackId: 'silverstone',
  seasonYear: 2026,
  durationSec: 1500,
  strategyNote: '',
  parcFerme: false,
  penaltyTriggers: ['pause', 'unfocus'],
};

function createRunningSession(overrides: Partial<CreateSessionParams> = {}) {
  const store = useSessionStore.getState();
  store.createSession({ ...baseParams, ...overrides });
  store.startSession();
  return useSessionStore.getState();
}

describe('sessionStore edge cases', () => {
  beforeEach(() => {
    resetSessionStore();
  });

  afterEach(() => {
    vi.useRealTimers();
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

describe('sessionStore createSession', () => {
  beforeEach(() => resetSessionStore());

  it('builds a fresh session in setup state with zeroed runtime fields', () => {
    useSessionStore.getState().createSession({
      ...baseParams,
      strategyNote: 'plan',
      parcFerme: true,
      penaltyTriggers: ['pause', 'idle'],
    });

    const session = useSessionStore.getState().session!;
    expect(session.state).toBe('setup');
    expect(session.selectedTrackId).toBe('silverstone');
    expect(session.seasonYear).toBe(2026);
    expect(session.targetDurationSec).toBe(1500);
    expect(session.strategyNote).toBe('plan');
    expect(session.parcFermeEnabled).toBe(true);
    expect(session.enabledPenaltyTriggers).toEqual(['pause', 'idle']);
    expect(session.effectiveProgressSec).toBe(0);
    expect(session.elapsedWallTimeSec).toBe(0);
    expect(session.currentPaceMultiplier).toBe(1);
    expect(session.lapsCompleted).toBe(0);
    expect(session.totalPenaltySec).toBe(0);
    expect(session.activeRegulation).toBeNull();
    expect(session.regulationEndTime).toBeNull();
    expect(session.cooldowns).toEqual({ boost: 0, overtake: 0, drs: 0 });
    expect(session.usageCounts).toEqual({ boost: 0, overtake: 0, drs: 0 });
    expect(session.events).toEqual([]);
    expect(session.completedAt).toBeNull();
    expect(typeof session.id).toBe('string');
    expect(session.id.length).toBeGreaterThan(0);
  });
});

describe('sessionStore lifecycle transitions', () => {
  beforeEach(() => resetSessionStore());

  it('does nothing when lifecycle actions are called with no session', () => {
    const store = useSessionStore.getState();
    store.startSession();
    store.pauseSession();
    store.resumeSession();
    store.completeSession();
    store.abandonSession();
    expect(useSessionStore.getState().session).toBeNull();
  });

  it('starts only from setup and logs a session_start event', () => {
    const store = useSessionStore.getState();
    store.createSession(baseParams);
    store.startSession();

    let session = useSessionStore.getState().session!;
    expect(session.state).toBe('running');
    expect(session.events.map((e) => e.type)).toContain('session_start');

    // A second start is a no-op (running → running is not a valid transition).
    const eventCountBefore = session.events.length;
    store.startSession();
    session = useSessionStore.getState().session!;
    expect(session.events.length).toBe(eventCountBefore);
  });

  it('pauses and resumes, logging events each way', () => {
    createRunningSession();
    const store = useSessionStore.getState();

    store.pauseSession();
    expect(useSessionStore.getState().session!.state).toBe('paused');

    store.resumeSession();
    expect(useSessionStore.getState().session!.state).toBe('running');

    const types = useSessionStore.getState().session!.events.map((e) => e.type);
    expect(types).toEqual(expect.arrayContaining(['session_pause', 'session_resume']));
  });

  it('does not pause a session that is not running', () => {
    const store = useSessionStore.getState();
    store.createSession(baseParams); // still in setup
    store.pauseSession();
    expect(useSessionStore.getState().session!.state).toBe('setup');
  });

  it('completes from running, clearing regulation state and stamping completedAt', () => {
    createRunningSession();
    activateRegulationWithConfig('boost', 2, 30, 120);
    useSessionStore.getState().completeSession();

    const session = useSessionStore.getState().session!;
    expect(session.state).toBe('completed');
    expect(session.activeRegulation).toBeNull();
    expect(session.regulationEndTime).toBeNull();
    expect(session.currentPaceMultiplier).toBe(1);
    expect(session.completedAt).not.toBeNull();
    expect(session.events.map((e) => e.type)).toContain('session_complete');
  });

  it('cannot complete directly from paused (must resume first)', () => {
    createRunningSession();
    const store = useSessionStore.getState();
    store.pauseSession();
    store.completeSession();
    expect(useSessionStore.getState().session!.state).toBe('paused');
  });

  it('abandons from paused', () => {
    createRunningSession();
    const store = useSessionStore.getState();
    store.pauseSession();
    store.abandonSession();
    expect(useSessionStore.getState().session!.state).toBe('abandoned');
  });

  it('clears the session back to null', () => {
    createRunningSession();
    useSessionStore.getState().clearSession();
    expect(useSessionStore.getState().session).toBeNull();
  });

  it('ignores strategy note updates with no session or in setup state', () => {
    const store = useSessionStore.getState();
    store.updateStrategyNote('orphan'); // no session
    expect(useSessionStore.getState().session).toBeNull();

    store.createSession({ ...baseParams, strategyNote: 'setup-note' }); // setup state
    store.updateStrategyNote('changed in setup');
    expect(useSessionStore.getState().session!.strategyNote).toBe('setup-note');
  });
});

describe('sessionStore tick', () => {
  beforeEach(() => resetSessionStore());

  it('does nothing when there is no session', () => {
    useSessionStore.getState().tick(16);
    expect(useSessionStore.getState().session).toBeNull();
  });

  it('does nothing when the session is not running (paused)', () => {
    createRunningSession();
    const store = useSessionStore.getState();
    store.pauseSession();
    const before = useSessionStore.getState().session!.effectiveProgressSec;
    store.tick(1000);
    expect(useSessionStore.getState().session!.effectiveProgressSec).toBe(before);
  });

  it('advances wall time and effective progress at the current pace', () => {
    createRunningSession({ durationSec: 1500 });
    useSessionStore.getState().tick(2000); // 2 seconds at 1x

    const session = useSessionStore.getState().session!;
    expect(session.elapsedWallTimeSec).toBeCloseTo(2, 5);
    expect(session.effectiveProgressSec).toBeCloseTo(2, 5);
    expect(session.state).toBe('running');
  });

  it('advances effective progress faster than wall time while a regulation is active', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    createRunningSession({ durationSec: 1500 });
    activateRegulationWithConfig('boost', 2, 30, 120); // 2x pace

    useSessionStore.getState().tick(1000); // 1 wall second
    const session = useSessionStore.getState().session!;
    expect(session.elapsedWallTimeSec).toBeCloseTo(1, 5);
    expect(session.effectiveProgressSec).toBeCloseTo(2, 5); // 2x pace
  });

  it('auto-deactivates an expired regulation during tick and resets the pace', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    createRunningSession({ durationSec: 1500 });
    activateRegulationWithConfig('boost', 2, 30, 120);
    expect(useSessionStore.getState().session!.activeRegulation).toBe('boost');

    // Jump past the regulation end time, then tick.
    vi.setSystemTime(new Date(Date.now() + 31_000));
    useSessionStore.getState().tick(16);

    const session = useSessionStore.getState().session!;
    expect(session.activeRegulation).toBeNull();
    expect(session.regulationEndTime).toBeNull();
    expect(session.currentPaceMultiplier).toBe(1);
    expect(session.events.map((e) => e.type)).toContain('regulation_deactivate');
    expect(session.state).toBe('running');
  });

  it('auto-completes when effective progress reaches the target and caps progress', () => {
    createRunningSession({ durationSec: 1 });
    useSessionStore.getState().tick(5000); // overshoot

    const session = useSessionStore.getState().session!;
    expect(session.state).toBe('completed');
    expect(session.effectiveProgressSec).toBe(1); // capped at target
    expect(session.completedAt).not.toBeNull();
    expect(session.events.map((e) => e.type)).toContain('session_complete');
  });
});

describe('sessionStore.activateRegulation (low-level stub)', () => {
  beforeEach(() => resetSessionStore());

  it('applies hardcoded defaults (30s duration, 2x pace, 120s cooldown)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const now = Date.now();

    createRunningSession();
    useSessionStore.getState().activateRegulation('boost');

    const session = useSessionStore.getState().session!;
    expect(session.activeRegulation).toBe('boost');
    expect(session.currentPaceMultiplier).toBe(2);
    expect(session.regulationEndTime).toBe(now + 30_000);
    // Cooldown ends after duration + cooldown.
    expect(session.cooldowns.boost).toBe(now + 30_000 + 120_000);
    expect(session.usageCounts.boost).toBe(1);
    expect(session.events.map((e) => e.type)).toContain('regulation_activate');
  });

  it('is a no-op when not running, already active, or on cooldown', () => {
    // Not running (setup).
    const store = useSessionStore.getState();
    store.createSession(baseParams);
    store.activateRegulation('boost');
    expect(useSessionStore.getState().session!.activeRegulation).toBeNull();

    // Running but another regulation already active.
    store.startSession();
    store.activateRegulation('boost');
    store.activateRegulation('overtake'); // blocked: one already active
    expect(useSessionStore.getState().session!.activeRegulation).toBe('boost');
  });

  it('is a no-op while the regulation is on cooldown', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    createRunningSession();
    useSessionStore.setState({
      session: {
        ...useSessionStore.getState().session!,
        cooldowns: { boost: Date.now() + 60_000, overtake: 0, drs: 0 },
      },
    });

    useSessionStore.getState().activateRegulation('boost');
    expect(useSessionStore.getState().session!.activeRegulation).toBeNull();
  });
});

describe('sessionStore.deactivateRegulation', () => {
  beforeEach(() => resetSessionStore());

  it('clears the active regulation and resets pace', () => {
    createRunningSession();
    activateRegulationWithConfig('boost', 2, 30, 120);

    useSessionStore.getState().deactivateRegulation();
    const session = useSessionStore.getState().session!;
    expect(session.activeRegulation).toBeNull();
    expect(session.regulationEndTime).toBeNull();
    expect(session.currentPaceMultiplier).toBe(1);
    expect(session.events.map((e) => e.type)).toContain('regulation_deactivate');
  });

  it('is a no-op when nothing is active or no session exists', () => {
    useSessionStore.getState().deactivateRegulation(); // no session
    expect(useSessionStore.getState().session).toBeNull();

    createRunningSession();
    const before = useSessionStore.getState().session!.events.length;
    useSessionStore.getState().deactivateRegulation(); // nothing active
    expect(useSessionStore.getState().session!.events.length).toBe(before);
  });
});

describe('sessionStore.applyPenalty', () => {
  beforeEach(() => resetSessionStore());

  it('subtracts penalty seconds and tracks the running total', () => {
    createRunningSession();
    useSessionStore.getState().tick(10_000); // 10s of progress
    useSessionStore.getState().applyPenalty('pause', 4);

    const session = useSessionStore.getState().session!;
    expect(session.effectiveProgressSec).toBeCloseTo(6, 5);
    expect(session.totalPenaltySec).toBe(4);
    const penaltyEvent = session.events.find((e) => e.type === 'penalty_applied');
    expect(penaltyEvent?.metadata).toMatchObject({ trigger: 'pause', penaltySec: 4 });
  });

  it('never drives effective progress below zero', () => {
    createRunningSession();
    useSessionStore.getState().tick(2000); // 2s
    useSessionStore.getState().applyPenalty('idle', 100);

    const session = useSessionStore.getState().session!;
    expect(session.effectiveProgressSec).toBe(0);
    expect(session.totalPenaltySec).toBe(100);
  });

  it('is a no-op without a session', () => {
    useSessionStore.getState().applyPenalty('pause', 10);
    expect(useSessionStore.getState().session).toBeNull();
  });
});

describe('sessionStore.addEvent', () => {
  beforeEach(() => resetSessionStore());

  it('appends an event with a generated id and timestamp', () => {
    createRunningSession();
    useSessionStore.getState().addEvent({ type: 'lap_completed', metadata: { lap: 3 } });

    const events = useSessionStore.getState().session!.events;
    const lapEvent = events.find((e) => e.type === 'lap_completed');
    expect(lapEvent).toBeDefined();
    expect(lapEvent!.metadata).toEqual({ lap: 3 });
    expect(typeof lapEvent!.id).toBe('string');
    expect(typeof lapEvent!.timestamp).toBe('number');
  });

  it('is a no-op without a session', () => {
    useSessionStore.getState().addEvent({ type: 'lap_completed', metadata: {} });
    expect(useSessionStore.getState().session).toBeNull();
  });
});

describe('activateRegulationWithConfig', () => {
  beforeEach(() => resetSessionStore());

  it('sets pace, end time, cooldown (starting at regulation end), and usage', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const now = Date.now();

    createRunningSession();
    activateRegulationWithConfig('overtake', 1.5, 20, 180);

    const session = useSessionStore.getState().session!;
    expect(session.activeRegulation).toBe('overtake');
    expect(session.currentPaceMultiplier).toBe(1.5);
    expect(session.regulationEndTime).toBe(now + 20_000);
    // Cooldown begins when the regulation ENDS.
    expect(session.cooldowns.overtake).toBe(now + 20_000 + 180_000);
    expect(session.usageCounts.overtake).toBe(1);
    const activateEvent = session.events.find((e) => e.type === 'regulation_activate');
    expect(activateEvent?.metadata).toMatchObject({
      regulationType: 'overtake',
      paceMultiplier: 1.5,
      durationSec: 20,
    });
  });

  it('is a no-op when not running, already active, or on cooldown', () => {
    // No session.
    activateRegulationWithConfig('boost', 2, 30, 120);
    expect(useSessionStore.getState().session).toBeNull();

    // Setup (not running).
    const store = useSessionStore.getState();
    store.createSession(baseParams);
    activateRegulationWithConfig('boost', 2, 30, 120);
    expect(useSessionStore.getState().session!.activeRegulation).toBeNull();

    // Already active.
    store.startSession();
    activateRegulationWithConfig('boost', 2, 30, 120);
    activateRegulationWithConfig('overtake', 1.5, 20, 180);
    expect(useSessionStore.getState().session!.activeRegulation).toBe('boost');
  });

  it('is a no-op while the regulation is on cooldown', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    createRunningSession();
    useSessionStore.setState({
      session: {
        ...useSessionStore.getState().session!,
        cooldowns: { boost: Date.now() + 60_000, overtake: 0, drs: 0 },
      },
    });

    activateRegulationWithConfig('boost', 2, 30, 120);
    expect(useSessionStore.getState().session!.activeRegulation).toBeNull();
  });
});
