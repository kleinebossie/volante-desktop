/**
 * validatePersisted.ts — Runtime validation for data loaded from local JSON.
 *
 * `settings.json` and `history.json` are written by this app, but they live on
 * disk where they can be corrupted, truncated, or hand-edited. `JSON.parse(...)
 * as T` is a compile-time assertion only — it does not guarantee the parsed
 * value actually matches the type. Without validation, a tampered file could
 * inject wrong-typed or out-of-range values (e.g. a negative `defaultDurationMin`
 * or a huge `idleThresholdSec`) that flow into the regulation/timer math in
 * `getSeasonByYear()` and corrupt runtime state or crash the app.
 *
 * These are pure, side-effect-free functions: they never throw on bad input,
 * instead clamping numerics to safe ranges and falling back to defaults for
 * any missing or ill-typed field. This also makes the app resilient to
 * forward/backward version skew in the persisted schema.
 */

import { DEFAULT_SETTINGS, UserSettings } from '../types/settings';
import type { Session, SessionState } from '../types/session';
import type { PenaltyTrigger, RegulationType } from '../types/regulations';

// ---------------------------------------------------------------------------
// Primitive guards / coercion helpers
// ---------------------------------------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Returns `value` if it is a finite number within [min, max], clamping if it
 * falls outside. Returns `fallback` for anything that is not a finite number.
 */
function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function asString(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

/** Keeps only the string elements of an array; returns [] for non-arrays. */
function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === 'string');
}

const VALID_PENALTY_TRIGGERS: readonly PenaltyTrigger[] = ['pause', 'unfocus', 'idle'];
const VALID_REGULATION_TYPES: readonly RegulationType[] = ['boost', 'overtake', 'drs'];
const VALID_SESSION_STATES: readonly SessionState[] = [
  'setup',
  'running',
  'paused',
  'completed',
  'abandoned',
];

/** Filters an array down to the recognized PenaltyTrigger values (deduped). */
function asPenaltyTriggers(value: unknown, fallback: PenaltyTrigger[]): PenaltyTrigger[] {
  if (!Array.isArray(value)) return [...fallback];
  const seen = new Set<PenaltyTrigger>();
  for (const v of value) {
    if (typeof v === 'string' && (VALID_PENALTY_TRIGGERS as readonly string[]).includes(v)) {
      seen.add(v as PenaltyTrigger);
    }
  }
  return [...seen];
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

// Safe bounds for persisted numeric settings. These are deliberately generous
// (they bound pathological values, not legitimate UI ranges) — the UI enforces
// its own narrower limits.
const SECONDS_IN_DAY = 86_400;

/**
 * Validate and sanitize a parsed `settings.json` object.
 * Starts from defaults and overlays only well-typed, in-range fields, so any
 * unknown or corrupt field silently falls back to its default.
 */
export function sanitizeSettings(raw: unknown): UserSettings {
  if (!isRecord(raw)) return { ...DEFAULT_SETTINGS };

  const durationType =
    raw.regulationDurationType === 'relative' || raw.regulationDurationType === 'absolute'
      ? raw.regulationDurationType
      : DEFAULT_SETTINGS.regulationDurationType;

  return {
    // defaultSeasonYear is looked up against a known season list; an unknown
    // year just yields no ruleset, so we only need it to be a sane integer.
    defaultSeasonYear: Math.round(
      clampNumber(raw.defaultSeasonYear, 1950, 2200, DEFAULT_SETTINGS.defaultSeasonYear),
    ),
    favoriteTrackIds: asStringArray(raw.favoriteTrackIds),
    defaultPenaltyTriggers: asPenaltyTriggers(
      raw.defaultPenaltyTriggers,
      DEFAULT_SETTINGS.defaultPenaltyTriggers,
    ),
    idleThresholdSec: clampNumber(
      raw.idleThresholdSec,
      1,
      SECONDS_IN_DAY,
      DEFAULT_SETTINGS.idleThresholdSec,
    ),
    defaultDurationMin: clampNumber(
      raw.defaultDurationMin,
      1,
      24 * 60,
      DEFAULT_SETTINGS.defaultDurationMin,
    ),
    parcFermeDefault: asBoolean(raw.parcFermeDefault, DEFAULT_SETTINGS.parcFermeDefault),
    soundEnabled: asBoolean(raw.soundEnabled, DEFAULT_SETTINGS.soundEnabled),
    showLapCounter: asBoolean(raw.showLapCounter, DEFAULT_SETTINGS.showLapCounter),
    showPenaltyFeed: asBoolean(raw.showPenaltyFeed, DEFAULT_SETTINGS.showPenaltyFeed),
    regulationDurationType: durationType,
    boostRelativePercent: clampNumber(
      raw.boostRelativePercent,
      0,
      100,
      DEFAULT_SETTINGS.boostRelativePercent,
    ),
    boostAbsoluteSec: clampNumber(
      raw.boostAbsoluteSec,
      1,
      SECONDS_IN_DAY,
      DEFAULT_SETTINGS.boostAbsoluteSec,
    ),
    overtakeRelativePercent: clampNumber(
      raw.overtakeRelativePercent,
      0,
      100,
      DEFAULT_SETTINGS.overtakeRelativePercent,
    ),
    overtakeAbsoluteSec: clampNumber(
      raw.overtakeAbsoluteSec,
      1,
      SECONDS_IN_DAY,
      DEFAULT_SETTINGS.overtakeAbsoluteSec,
    ),
  };
}

// ---------------------------------------------------------------------------
// History (Session[])
// ---------------------------------------------------------------------------

function isRegulationType(value: unknown): value is RegulationType {
  return typeof value === 'string' && (VALID_REGULATION_TYPES as readonly string[]).includes(value);
}

/** Builds a {boost,overtake,drs}→number map from raw, clamping to >= 0. */
function sanitizeRegulationMap(raw: unknown): Record<RegulationType, number> {
  const result = { boost: 0, overtake: 0, drs: 0 } as Record<RegulationType, number>;
  if (isRecord(raw)) {
    for (const type of VALID_REGULATION_TYPES) {
      result[type] = clampNumber(raw[type], 0, Number.MAX_SAFE_INTEGER, 0);
    }
  }
  return result;
}

/**
 * Validate a single parsed session. Returns null if the object is missing the
 * fields the UI relies on (id, state) or they are the wrong type — such an
 * entry is dropped rather than rendered with undefined fields.
 */
function sanitizeSession(raw: unknown): Session | null {
  if (!isRecord(raw)) return null;
  if (typeof raw.id !== 'string' || raw.id.length === 0) return null;
  if (
    typeof raw.state !== 'string' ||
    !(VALID_SESSION_STATES as readonly string[]).includes(raw.state)
  ) {
    return null;
  }

  const MAX = Number.MAX_SAFE_INTEGER;

  return {
    id: raw.id,
    createdAt: clampNumber(raw.createdAt, 0, MAX, 0),
    state: raw.state as SessionState,
    selectedTrackId: asString(raw.selectedTrackId, ''),
    seasonYear: Math.round(clampNumber(raw.seasonYear, 1950, 2200, DEFAULT_SETTINGS.defaultSeasonYear)),
    targetDurationSec: clampNumber(raw.targetDurationSec, 0, MAX, 0),
    strategyNote: asString(raw.strategyNote, ''),
    parcFermeEnabled: asBoolean(raw.parcFermeEnabled, false),
    elapsedWallTimeSec: clampNumber(raw.elapsedWallTimeSec, 0, MAX, 0),
    effectiveProgressSec: clampNumber(raw.effectiveProgressSec, 0, MAX, 0),
    currentPaceMultiplier: clampNumber(raw.currentPaceMultiplier, 0, MAX, 1),
    lapsCompleted: clampNumber(raw.lapsCompleted, 0, MAX, 0),
    totalPenaltySec: clampNumber(raw.totalPenaltySec, 0, MAX, 0),
    activeRegulation: isRegulationType(raw.activeRegulation) ? raw.activeRegulation : null,
    regulationEndTime:
      typeof raw.regulationEndTime === 'number' && Number.isFinite(raw.regulationEndTime)
        ? raw.regulationEndTime
        : null,
    cooldowns: sanitizeRegulationMap(raw.cooldowns),
    usageCounts: sanitizeRegulationMap(raw.usageCounts),
    enabledPenaltyTriggers: asPenaltyTriggers(raw.enabledPenaltyTriggers, []),
    events: Array.isArray(raw.events) ? (raw.events as Session['events']) : [],
    completedAt:
      typeof raw.completedAt === 'number' && Number.isFinite(raw.completedAt)
        ? raw.completedAt
        : null,
  };
}

/**
 * Validate a parsed `history.json` value. Returns an array of valid sessions,
 * dropping any entry that is not a well-formed session. Returns [] for any
 * non-array input.
 */
export function sanitizeHistory(raw: unknown): Session[] {
  if (!Array.isArray(raw)) return [];
  const out: Session[] = [];
  for (const entry of raw) {
    const session = sanitizeSession(entry);
    if (session) out.push(session);
  }
  return out;
}
