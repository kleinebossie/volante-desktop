import { afterEach, describe, expect, it, vi } from 'vitest';
import { season2025 } from '../data/seasons/season2025';
import { season2026 } from '../data/seasons/season2026';
import { getSeasonByYear } from '../data/seasons';
import { useSettingsStore } from '../stores/settingsStore';
import {
  canActivateRegulation,
  getRegulationState,
  getCooldownRemainingSec,
  getCooldownProgress,
  getActiveRegulationRemainingSec,
  getActiveRegulationProgress,
  getRemainingUses,
  getRegulationConfig,
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
    expect(overtakeMaxUses).toBe(1);

    const session = makeSession({
      usageCounts: {
        boost: 0,
        overtake: 1,
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

  it('calculates dynamic durations based on settings and session duration', () => {
    // 1. Default relative settings (5% boost/drs, 10% overtake)
    // For a 25 min (1500 sec) session - 2026 Season (Boost):
    const season2026Obj = getSeasonByYear(2026, makeSession({ targetDurationSec: 1500 }));
    expect(season2026Obj).toBeDefined();

    const boost = season2026Obj!.regulations.find((r) => r.type === 'boost');
    const overtake26 = season2026Obj!.regulations.find((r) => r.type === 'overtake');

    expect(boost).toBeDefined();
    expect(overtake26).toBeDefined();

    expect(boost!.durationSec).toBe(75); // 5% of 1500
    expect(boost!.cooldownSec).toBe(75); // cooldown matches duration
    expect(boost!.maxUsesPerSession).toBe(3);

    expect(overtake26!.durationSec).toBe(150); // 10% of 1500
    expect(overtake26!.maxUsesPerSession).toBe(1);

    // 2025 Season (DRS):
    const season2025Obj = getSeasonByYear(2025, makeSession({ targetDurationSec: 1500, seasonYear: 2025 }));
    expect(season2025Obj).toBeDefined();

    const drs = season2025Obj!.regulations.find((r) => r.type === 'drs');
    const overtake25 = season2025Obj!.regulations.find((r) => r.type === 'overtake');

    expect(drs).toBeDefined();
    expect(overtake25).toBeDefined();

    expect(drs!.durationSec).toBe(75); // 5% of 1500 (matches boost duration settings)
    expect(drs!.cooldownSec).toBe(75); // cooldown matches duration
    expect(drs!.maxUsesPerSession).toBe(3);

    expect(overtake25!.durationSec).toBe(150); // 10% of 1500
    expect(overtake25!.maxUsesPerSession).toBe(1);

    // 2. Different session duration (e.g. 60 min = 3600 sec)
    const longSessionSeason = getSeasonByYear(2026, makeSession({ targetDurationSec: 3600 }));
    const longBoost = longSessionSeason!.regulations.find((r) => r.type === 'boost');
    const longOvertake = longSessionSeason!.regulations.find((r) => r.type === 'overtake');
    expect(longBoost!.durationSec).toBe(180); // 5% of 3600
    expect(longOvertake!.durationSec).toBe(360); // 10% of 3600
  });

  it('reports unavailable state for a regulation not in the season', () => {
    const session = makeSession({ seasonYear: 2026 });
    expect(getRegulationState('drs', session, season2026)).toBe('unavailable');
    expect(getRegulationState('boost', session, season2025)).toBe('unavailable');
  });

  it('reports available state when cooldown has elapsed', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    const now = Date.now();
    const session = makeSession({
      cooldowns: { boost: now - 1_000, overtake: 0, drs: 0 },
    });

    expect(getRegulationState('boost', session, season2026)).toBe('available');
    expect(getCooldownRemainingSec('boost', session)).toBe(0);
  });

  it('reports cooldown state and progress while on cooldown', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    const now = Date.now();
    const boostConfig = season2026.regulations.find((r) => r.type === 'boost')!;
    const session = makeSession({
      cooldowns: { boost: now + boostConfig.cooldownSec * 1000, overtake: 0, drs: 0 },
    });

    expect(getRegulationState('boost', session, season2026)).toBe('cooldown');
    // Full bar at the very start of the cooldown.
    expect(getCooldownProgress('boost', session, boostConfig)).toBeCloseTo(1, 5);

    // Halfway through the cooldown the bar should be ~0.5.
    vi.setSystemTime(new Date(now + (boostConfig.cooldownSec / 2) * 1000));
    expect(getCooldownProgress('boost', session, boostConfig)).toBeCloseTo(0.5, 1);
  });

  it('returns 0 cooldown progress when not on cooldown or cooldown duration is zero', () => {
    const session = makeSession();
    const boostConfig = season2026.regulations.find((r) => r.type === 'boost')!;

    expect(getCooldownProgress('boost', session, boostConfig)).toBe(0);
    expect(getCooldownProgress('boost', session, { ...boostConfig, cooldownSec: 0 })).toBe(0);
  });

  it('computes active regulation remaining time and progress', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    const now = Date.now();
    const boostConfig = season2026.regulations.find((r) => r.type === 'boost')!;
    const session = makeSession({
      activeRegulation: 'boost',
      regulationEndTime: now + boostConfig.durationSec * 1000,
    });

    expect(getActiveRegulationRemainingSec(session)).toBeCloseTo(boostConfig.durationSec, 1);
    expect(getActiveRegulationProgress(session, boostConfig)).toBeCloseTo(1, 5);

    // Advance to just before expiry.
    vi.setSystemTime(new Date(now + boostConfig.durationSec * 1000 - 1000));
    expect(getActiveRegulationRemainingSec(session)).toBeCloseTo(1, 1);
    expect(getActiveRegulationProgress(session, boostConfig)).toBeCloseTo(1 / boostConfig.durationSec, 2);
  });

  it('returns 0 active remaining/progress when no regulation is active', () => {
    const idle = makeSession();
    const boostConfig = season2026.regulations.find((r) => r.type === 'boost')!;

    expect(getActiveRegulationRemainingSec(idle)).toBe(0);
    expect(getActiveRegulationProgress(idle, boostConfig)).toBe(0);

    // Active flag set but no end time → treated as inactive.
    const noEnd = makeSession({ activeRegulation: 'boost', regulationEndTime: null });
    expect(getActiveRegulationRemainingSec(noEnd)).toBe(0);

    // Expired regulation → remaining clamps to 0.
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const expired = makeSession({
      activeRegulation: 'boost',
      regulationEndTime: Date.now() - 5_000,
    });
    expect(getActiveRegulationRemainingSec(expired)).toBe(0);
    expect(getActiveRegulationProgress(expired, boostConfig)).toBe(0);
  });

  it('returns null remaining uses for unlimited regulations', () => {
    const session = makeSession();
    const unlimitedConfig = { ...season2026.regulations[0], maxUsesPerSession: null };
    expect(getRemainingUses('boost', session, unlimitedConfig)).toBeNull();
  });

  it('looks up regulation config by type within a ruleset', () => {
    expect(getRegulationConfig('boost', season2026)?.label).toBe('BOOST');
    expect(getRegulationConfig('overtake', season2026)?.label).toBe('OVERTAKE');
    expect(getRegulationConfig('drs', season2026)).toBeUndefined();
    expect(getRegulationConfig('drs', season2025)?.label).toBe('DRS');
  });

  it('applies safety clamp if boost/drs duration exceeds overtake duration', () => {
    const settings = useSettingsStore.getState().settings;

    // Temporarily set boost relative to 30% and overtake relative to 20%
    // This violates boost <= overtake, simulating mixed or invalid settings
    const originalBoostRel = settings.boostRelativePercent;
    const originalOvertakeRel = settings.overtakeRelativePercent;

    useSettingsStore.setState({
      settings: {
        ...settings,
        boostRelativePercent: 30,
        overtakeRelativePercent: 20,
      },
    });

    // Verify 2026 (Boost)
    const season26 = getSeasonByYear(2026, makeSession({ targetDurationSec: 1000 }));
    const boost = season26!.regulations.find((r) => r.type === 'boost');
    const overtake26 = season26!.regulations.find((r) => r.type === 'overtake');

    // Boost should be clamped to overtake duration (200 sec)
    expect(overtake26!.durationSec).toBe(200);
    expect(boost!.durationSec).toBe(200);
    expect(boost!.cooldownSec).toBe(200);

    // Verify 2025 (DRS)
    const season25 = getSeasonByYear(2025, makeSession({ targetDurationSec: 1000, seasonYear: 2025 }));
    const drs = season25!.regulations.find((r) => r.type === 'drs');
    const overtake25 = season25!.regulations.find((r) => r.type === 'overtake');

    // DRS should be clamped to overtake duration (200 sec)
    expect(overtake25!.durationSec).toBe(200);
    expect(drs!.durationSec).toBe(200);
    expect(drs!.cooldownSec).toBe(200);

    // Restore settings
    useSettingsStore.setState({
      settings: {
        ...settings,
        boostRelativePercent: originalBoostRel,
        overtakeRelativePercent: originalOvertakeRel,
      },
    });
  });
});
