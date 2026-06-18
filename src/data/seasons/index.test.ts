import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  SEASONS,
  DEFAULT_SEASON_YEAR,
  getSeasonByYear,
} from './index';
import { season2025 } from './season2025';
import { season2026 } from './season2026';
import { useSettingsStore } from '../../stores/settingsStore';
import { DEFAULT_SETTINGS } from '../../types/settings';
import type { Session } from '../../types/session';

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
    cooldowns: { boost: 0, overtake: 0, drs: 0 },
    usageCounts: { boost: 0, overtake: 0, drs: 0 },
    enabledPenaltyTriggers: ['pause', 'unfocus'],
    events: [],
    completedAt: null,
    ...partial,
  };
}

function setSettings(partial: Partial<typeof DEFAULT_SETTINGS>) {
  useSettingsStore.setState({
    settings: { ...DEFAULT_SETTINGS, ...partial },
  });
}

beforeEach(() => {
  // Reset settings to defaults before each test for determinism.
  useSettingsStore.setState({ settings: { ...DEFAULT_SETTINGS } });
});

afterEach(() => {
  useSettingsStore.setState({ settings: { ...DEFAULT_SETTINGS } });
});

describe('SEASONS catalog', () => {
  it('contains exactly the 2026 and 2025 rulesets, 2026 first', () => {
    expect(SEASONS).toHaveLength(2);
    expect(SEASONS[0]).toBe(season2026);
    expect(SEASONS[1]).toBe(season2025);
  });

  it('exposes 2026 as the default season year', () => {
    expect(DEFAULT_SEASON_YEAR).toBe(2026);
    expect(SEASONS.some((s) => s.seasonYear === DEFAULT_SEASON_YEAR)).toBe(true);
  });
});

describe('getSeasonByYear', () => {
  it('returns undefined for an unknown season year', () => {
    expect(getSeasonByYear(1999)).toBeUndefined();
    expect(getSeasonByYear(2030, makeSession())).toBeUndefined();
  });

  it('returns a cloned ruleset, not the original static object', () => {
    const result = getSeasonByYear(2026, makeSession());
    expect(result).toBeDefined();
    expect(result).not.toBe(season2026);
    // Regulations array is also a fresh clone (mutating must not leak).
    expect(result!.regulations).not.toBe(season2026.regulations);
    expect(result!.regulations[0]).not.toBe(season2026.regulations[0]);
    // Original static object is untouched.
    expect(season2026.regulations[0].durationSec).toBe(30);
  });

  it('uses the session target duration when a session is provided (relative mode)', () => {
    setSettings({
      regulationDurationType: 'relative',
      boostRelativePercent: 5,
      overtakeRelativePercent: 10,
    });

    const result = getSeasonByYear(2026, makeSession({ targetDurationSec: 1500 }));
    const boost = result!.regulations.find((r) => r.type === 'boost')!;
    const overtake = result!.regulations.find((r) => r.type === 'overtake')!;

    expect(boost.durationSec).toBe(75); // 5% of 1500
    expect(boost.cooldownSec).toBe(75); // cooldown matches boost duration
    expect(boost.maxUsesPerSession).toBe(3);
    expect(overtake.durationSec).toBe(150); // 10% of 1500
    expect(overtake.maxUsesPerSession).toBe(1);
    // Overtake cooldown is left from the base ruleset (not rewritten).
    expect(overtake.cooldownSec).toBe(season2026.regulations.find((r) => r.type === 'overtake')!.cooldownSec);
  });

  it('falls back to settings.defaultDurationMin when no session is provided', () => {
    setSettings({
      regulationDurationType: 'relative',
      boostRelativePercent: 10,
      overtakeRelativePercent: 20,
      defaultDurationMin: 40, // 2400 sec
    });

    const result = getSeasonByYear(2026);
    const boost = result!.regulations.find((r) => r.type === 'boost')!;
    const overtake = result!.regulations.find((r) => r.type === 'overtake')!;

    expect(boost.durationSec).toBe(240); // 10% of 2400
    expect(overtake.durationSec).toBe(480); // 20% of 2400
  });

  it('uses absolute durations when regulationDurationType is absolute', () => {
    setSettings({
      regulationDurationType: 'absolute',
      boostAbsoluteSec: 90,
      overtakeAbsoluteSec: 200,
    });

    const result = getSeasonByYear(2026, makeSession({ targetDurationSec: 9999 }));
    const boost = result!.regulations.find((r) => r.type === 'boost')!;
    const overtake = result!.regulations.find((r) => r.type === 'overtake')!;

    // Absolute mode ignores session duration entirely.
    expect(boost.durationSec).toBe(90);
    expect(boost.cooldownSec).toBe(90);
    expect(overtake.durationSec).toBe(200);
  });

  it('rewrites DRS the same way as Boost for the 2025 season', () => {
    setSettings({
      regulationDurationType: 'absolute',
      boostAbsoluteSec: 60,
      overtakeAbsoluteSec: 120,
    });

    const result = getSeasonByYear(2025, makeSession({ seasonYear: 2025, targetDurationSec: 1500 }));
    const drs = result!.regulations.find((r) => r.type === 'drs')!;
    const overtake = result!.regulations.find((r) => r.type === 'overtake')!;

    expect(drs.durationSec).toBe(60);
    expect(drs.cooldownSec).toBe(60);
    expect(drs.maxUsesPerSession).toBe(3);
    expect(overtake.durationSec).toBe(120);
  });

  it('clamps boost/drs duration down to overtake duration when it would exceed it (relative)', () => {
    setSettings({
      regulationDurationType: 'relative',
      boostRelativePercent: 30,
      overtakeRelativePercent: 20,
    });

    const result = getSeasonByYear(2026, makeSession({ targetDurationSec: 1000 }));
    const boost = result!.regulations.find((r) => r.type === 'boost')!;
    const overtake = result!.regulations.find((r) => r.type === 'overtake')!;

    // 30% of 1000 = 300 would exceed overtake's 20% = 200 → clamp to 200.
    expect(overtake.durationSec).toBe(200);
    expect(boost.durationSec).toBe(200);
    expect(boost.cooldownSec).toBe(200);
  });

  it('clamps boost/drs duration down to overtake duration when it would exceed it (absolute)', () => {
    setSettings({
      regulationDurationType: 'absolute',
      boostAbsoluteSec: 500,
      overtakeAbsoluteSec: 300,
    });

    const result = getSeasonByYear(2025, makeSession({ seasonYear: 2025 }));
    const drs = result!.regulations.find((r) => r.type === 'drs')!;
    const overtake = result!.regulations.find((r) => r.type === 'overtake')!;

    expect(overtake.durationSec).toBe(300);
    expect(drs.durationSec).toBe(300);
    expect(drs.cooldownSec).toBe(300);
  });

  it('does not clamp when boost duration is already within overtake duration', () => {
    setSettings({
      regulationDurationType: 'relative',
      boostRelativePercent: 5,
      overtakeRelativePercent: 40,
    });

    const result = getSeasonByYear(2026, makeSession({ targetDurationSec: 1000 }));
    const boost = result!.regulations.find((r) => r.type === 'boost')!;
    const overtake = result!.regulations.find((r) => r.type === 'overtake')!;

    expect(boost.durationSec).toBe(50); // 5% of 1000
    expect(overtake.durationSec).toBe(400); // 40% of 1000
  });

  it('rounds relative durations to whole seconds', () => {
    setSettings({
      regulationDurationType: 'relative',
      boostRelativePercent: 3, // 3% of 1000 = 30 exactly... use odd value
      overtakeRelativePercent: 7, // 7% of 1000 = 70
    });

    const result = getSeasonByYear(2026, makeSession({ targetDurationSec: 1001 }));
    const boost = result!.regulations.find((r) => r.type === 'boost')!;
    // 3% of 1001 = 30.03 → round to 30
    expect(boost.durationSec).toBe(Math.round(0.03 * 1001));
    expect(Number.isInteger(boost.durationSec)).toBe(true);
  });
});
