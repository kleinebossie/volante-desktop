import { describe, expect, it } from 'vitest';
import { season2025 } from './season2025';
import { season2026 } from './season2026';
import type { RegulationType, SeasonRuleset } from '../../types/regulations';

const REGULATION_TYPES: RegulationType[] = ['boost', 'overtake', 'drs'];

function assertSeasonInvariants(season: SeasonRuleset) {
  // Every regulation has a sensible, fully-populated config.
  for (const reg of season.regulations) {
    expect(REGULATION_TYPES).toContain(reg.type);
    expect(reg.label.length).toBeGreaterThan(0);
    expect(reg.description.length).toBeGreaterThan(0);
    expect(reg.paceMultiplier).toBeGreaterThan(1);
    expect(reg.durationSec).toBeGreaterThan(0);
    expect(reg.cooldownSec).toBeGreaterThanOrEqual(0);
    expect(reg.interruptionPenaltyMultiplier).toBeGreaterThanOrEqual(1);
    expect(reg.accentColor.length).toBeGreaterThan(0);
    expect(reg.icon.length).toBeGreaterThan(0);
    // maxUsesPerSession is null (unlimited) or a positive integer.
    if (reg.maxUsesPerSession !== null) {
      expect(reg.maxUsesPerSession).toBeGreaterThan(0);
    }
  }

  // The lockout matrix must have an entry for every regulation type.
  for (const type of REGULATION_TYPES) {
    expect(Array.isArray(season.lockoutMatrix[type])).toBe(true);
  }

  // Penalty config is fully populated with positive numbers.
  const { pausePenaltySec, unfocusPenaltySec, idlePenaltySec, idleThresholdSec } =
    season.penaltyConfig;
  expect(pausePenaltySec).toBeGreaterThan(0);
  expect(unfocusPenaltySec).toBeGreaterThan(0);
  expect(idlePenaltySec).toBeGreaterThan(0);
  expect(idleThresholdSec).toBeGreaterThan(0);
}

describe('season2026 ruleset', () => {
  it('declares the correct year and Boost + Overtake regulations', () => {
    expect(season2026.seasonYear).toBe(2026);
    const types = season2026.regulations.map((r) => r.type);
    expect(types).toEqual(['boost', 'overtake']);
  });

  it('locks boost and overtake against each other', () => {
    expect(season2026.lockoutMatrix.boost).toContain('overtake');
    expect(season2026.lockoutMatrix.overtake).toContain('boost');
    expect(season2026.lockoutMatrix.drs).toEqual([]);
  });

  it('satisfies all season ruleset invariants', () => {
    assertSeasonInvariants(season2026);
  });
});

describe('season2025 ruleset', () => {
  it('declares the correct year and DRS + Overtake regulations', () => {
    expect(season2025.seasonYear).toBe(2025);
    const types = season2025.regulations.map((r) => r.type);
    expect(types).toEqual(['drs', 'overtake']);
  });

  it('locks drs and overtake against each other', () => {
    expect(season2025.lockoutMatrix.overtake).toContain('drs');
    expect(season2025.lockoutMatrix.drs).toContain('overtake');
    expect(season2025.lockoutMatrix.boost).toEqual([]);
  });

  it('satisfies all season ruleset invariants', () => {
    assertSeasonInvariants(season2025);
  });
});
