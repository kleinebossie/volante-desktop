import { describe, it, expect } from 'vitest';
import { sanitizeSettings, sanitizeHistory } from './validatePersisted';
import { DEFAULT_SETTINGS } from '../types/settings';
import type { Session } from '../types/session';

describe('sanitizeSettings', () => {
  it('returns defaults for non-object input', () => {
    expect(sanitizeSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(sanitizeSettings('nope')).toEqual(DEFAULT_SETTINGS);
    expect(sanitizeSettings(42)).toEqual(DEFAULT_SETTINGS);
    expect(sanitizeSettings([])).toEqual(DEFAULT_SETTINGS);
  });

  it('keeps valid in-range values', () => {
    const input = {
      ...DEFAULT_SETTINGS,
      defaultDurationMin: 50,
      idleThresholdSec: 90,
      boostRelativePercent: 8,
    };
    const result = sanitizeSettings(input);
    expect(result.defaultDurationMin).toBe(50);
    expect(result.idleThresholdSec).toBe(90);
    expect(result.boostRelativePercent).toBe(8);
  });

  it('clamps out-of-range numbers to safe bounds', () => {
    const result = sanitizeSettings({
      defaultDurationMin: -10,
      idleThresholdSec: 9_999_999,
      boostRelativePercent: 500,
      overtakeRelativePercent: -1,
      boostAbsoluteSec: 0,
    });
    expect(result.defaultDurationMin).toBe(1); // min clamp
    expect(result.idleThresholdSec).toBe(86_400); // max clamp
    expect(result.boostRelativePercent).toBe(100); // max clamp
    expect(result.overtakeRelativePercent).toBe(0); // min clamp
    expect(result.boostAbsoluteSec).toBe(1); // min clamp
  });

  it('falls back to defaults for wrong-typed fields', () => {
    const result = sanitizeSettings({
      defaultDurationMin: 'abc',
      idleThresholdSec: null,
      boostAbsoluteSec: NaN,
      soundEnabled: 'yes',
      regulationDurationType: 'bogus',
    });
    expect(result.defaultDurationMin).toBe(DEFAULT_SETTINGS.defaultDurationMin);
    expect(result.idleThresholdSec).toBe(DEFAULT_SETTINGS.idleThresholdSec);
    expect(result.boostAbsoluteSec).toBe(DEFAULT_SETTINGS.boostAbsoluteSec);
    expect(result.soundEnabled).toBe(DEFAULT_SETTINGS.soundEnabled);
    expect(result.regulationDurationType).toBe(DEFAULT_SETTINGS.regulationDurationType);
  });

  it('filters penalty triggers to known values and dedupes', () => {
    const result = sanitizeSettings({
      defaultPenaltyTriggers: ['pause', 'pause', 'bogus', 'idle', 42],
    });
    expect(result.defaultPenaltyTriggers).toEqual(['pause', 'idle']);
  });

  it('keeps only string entries in favoriteTrackIds', () => {
    const result = sanitizeSettings({ favoriteTrackIds: ['monaco', 5, null, 'spa'] });
    expect(result.favoriteTrackIds).toEqual(['monaco', 'spa']);
  });

  it('accepts the absolute duration type', () => {
    const result = sanitizeSettings({ regulationDurationType: 'absolute' });
    expect(result.regulationDurationType).toBe('absolute');
  });
});

describe('sanitizeHistory', () => {
  const validSession: Session = {
    id: 'abc-123',
    createdAt: 1000,
    state: 'completed',
    selectedTrackId: 'monaco',
    seasonYear: 2026,
    targetDurationSec: 1500,
    strategyNote: 'focus',
    parcFermeEnabled: false,
    elapsedWallTimeSec: 1500,
    effectiveProgressSec: 1500,
    currentPaceMultiplier: 1,
    lapsCompleted: 12,
    totalPenaltySec: 0,
    activeRegulation: null,
    regulationEndTime: null,
    cooldowns: { boost: 0, overtake: 0, drs: 0 },
    usageCounts: { boost: 1, overtake: 0, drs: 0 },
    enabledPenaltyTriggers: ['pause'],
    events: [],
    completedAt: 2500,
  };

  it('returns [] for non-array input', () => {
    expect(sanitizeHistory(null)).toEqual([]);
    expect(sanitizeHistory({})).toEqual([]);
    expect(sanitizeHistory('nope')).toEqual([]);
  });

  it('passes through a well-formed session', () => {
    const result = sanitizeHistory([validSession]);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(validSession);
  });

  it('drops entries missing id or with an invalid state', () => {
    const result = sanitizeHistory([
      { ...validSession, id: '' },
      { ...validSession, state: 'flying' },
      { not: 'a session' },
      null,
      validSession,
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('abc-123');
  });

  it('clamps negative numeric runtime fields', () => {
    const result = sanitizeHistory([
      { ...validSession, totalPenaltySec: -50, lapsCompleted: -3 },
    ]);
    expect(result[0].totalPenaltySec).toBe(0);
    expect(result[0].lapsCompleted).toBe(0);
  });

  it('normalizes a malformed cooldowns map', () => {
    const result = sanitizeHistory([
      { ...validSession, cooldowns: { boost: -5, overtake: 'x' } },
    ]);
    expect(result[0].cooldowns).toEqual({ boost: 0, overtake: 0, drs: 0 });
  });

  it('coerces an invalid activeRegulation to null', () => {
    const result = sanitizeHistory([{ ...validSession, activeRegulation: 'nitro' }]);
    expect(result[0].activeRegulation).toBeNull();
  });
});
