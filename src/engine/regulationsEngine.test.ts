import { afterEach, describe, expect, it, vi } from 'vitest';
import { season2025 } from '../data/seasons/season2025';
import { season2026 } from '../data/seasons/season2026';
import {
  canActivateRegulation,
  getRegulationState,
  getCooldownRemainingSec,
  getRemainingUses,
  calculateInterruptionPenalty,
} from './regulationsEngine';
import type { Session } from '../types/session';
import type { RegulationType } from '../types/regulations';

function makeSession(partial: Partial<Session> = {}): Session {
  return {
    id: 'session-1',
    createdAt: 0,
    state: 'running',
    selectedTrackId: 'silverstone',
    seasonYear: 2026,
    targetDurationSec: 1500,
    strategyNote: '',
    parcFermeEnabled: false,
    elapsedWallTimeSec: 0,
    effectiveProgressSec: 0,
    currentPaceMultiplier: 1,
    lapsCompleted: 0,
    totalPenaltySec: 0,
    activeRegulation: null,
    regulationEndTime: null,
    cooldowns: {
      boost: 0,
      overtake: 0,
      drs: 0,
    },
    usageCounts: {
      boost: 0,
      overtake: 0,
      drs: 0,
    },
    enabledPenaltyTriggers: ['pause', 'unfocus'],
    events: [],
    completedAt: null,
    ...partial,
  };
}

function getConfigMaxUses(type: RegulationType, season: typeof season2026 | typeof season2025): number | null {
  return season.regulations.find((reg) => reg.type === type)?.maxUsesPerSession ?? null;
}

afterEach(() => {
  vi.useRealTimers();
});

describe('regulationsEngine season interactions', () => {
  it('allows only season regulations for 2026', () => {
    const session = makeSession({ seasonYear: 2026 });

    expect(canActivateRegulation('boost', session, season2026)).toEqual({ allowed: true });
    expect(canActivateRegulation('overtake', session, season2026)).toEqual({ allowed: true });
    expect(canActivateRegulation('drs', session, season2026)).toEqual({
      allowed: false,
      reason: 'Regulation not available in this season',
    });
  });

  it('allows only season regulations for 2025', () => {
    const session = makeSession({ seasonYear: 2025 });

    expect(canActivateRegulation('drs', session, season2025)).toEqual({ allowed: true });
    expect(canActivateRegulation('overtake', session, season2025)).toEqual({ allowed: true });
    expect(canActivateRegulation('boost', session, season2025)).toEqual({
      allowed: false,
      reason: 'Regulation not available in this season',
    });
  });

  it('locks all other regulations when one is active', () => {
    const session = makeSession({ activeRegulation: 'boost' });

    expect(canActivateRegulation('overtake', session, season2026)).toEqual({
      allowed: false,
      reason: 'Another regulation is currently active',
    });
    expect(getRegulationState('overtake', session, season2026)).toBe('locked');
    expect(getRegulationState('boost', session, season2026)).toBe('active');
  });

  it('blocks activation during cooldown and reports remaining cooldown', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    const now = Date.now();
    const session = makeSession({
      cooldowns: {
        boost: now + 60_000,
        overtake: 0,
        drs: 0,
      },
    });

    const check = canActivateRegulation('boost', session, season2026);
    expect(check).toEqual({ allowed: false, reason: 'Regulation is on cooldown' });

    const remaining = getCooldownRemainingSec('boost', session);
    expect(remaining).toBeGreaterThan(59);
    expect(remaining).toBeLessThanOrEqual(60);
  });

  it('enforces usage limit for overtake', () => {
    const overtakeMaxUses = getConfigMaxUses('overtake', season2026);
    expect(overtakeMaxUses).toBe(3);

    const session = makeSession({
      usageCounts: {
        boost: 0,
        overtake: 3,
        drs: 0,
      },
    });

    expect(canActivateRegulation('overtake', session, season2026)).toEqual({
      allowed: false,
      reason: 'Maximum uses reached',
    });

    const overtakeConfig = season2026.regulations.find((reg) => reg.type === 'overtake');
    expect(overtakeConfig).toBeDefined();
    expect(getRemainingUses('overtake', session, overtakeConfig!)).toBe(0);
    expect(getRegulationState('overtake', session, season2026)).toBe('depleted');
  });

  it('calculates interruption penalties with multiplier', () => {
    expect(calculateInterruptionPenalty(10, 1.5)).toBe(15);
    expect(calculateInterruptionPenalty(20, 3)).toBe(60);
  });
});
