/**
 * progressCalculator.ts — Pure math functions for session progress.
 *
 * This module handles all the number-crunching that turns raw time values
 * into meaningful progress data:
 *   - How much "effective" work has been done (accounting for speed multipliers)
 *   - What lap the user is on
 *   - Overall progress as a 0–1 fraction
 *
 * All functions are pure (no side effects, no store access).
 * They take values in and return values out — nothing else.
 *
 * From ARCHITECTURE.md §9.4.2–9.4.3.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Base lap duration in seconds — how long a single lap takes at the
 * default pace on a track with lapTimeFactor = 1.0.
 *
 * Set to 300 seconds (5 minutes) so that a 25-minute session produces
 * roughly 5 laps, which feels natural:
 *   - 25 min ÷ 5 min = 5 laps
 *   - Monaco (factor 0.6): 25 min ÷ 3 min = ~8 laps (short fast laps)
 *   - Spa (factor 1.3): 25 min ÷ 6.5 min = ~4 laps (long sweeping laps)
 */
export const BASE_LAP_SECONDS = 300;

// ---------------------------------------------------------------------------
// Effective progress
// ---------------------------------------------------------------------------

/**
 * Calculate how many "effective" seconds of progress the user has earned,
 * given the elapsed time, the current pace multiplier, and any penalties.
 *
 * Think of it like this:
 *   - Normal pace (1x) means 1 real second = 1 progress second
 *   - Boost (2x) means 1 real second = 2 progress seconds
 *   - Penalties subtract from your total
 *
 * The result is clamped to a minimum of 0 (you can't go negative).
 *
 * @param elapsedMs       How many real milliseconds have passed
 * @param paceMultiplier  Current speed multiplier (1.0 = normal, 2.0 = double)
 * @param totalPenaltySec How many seconds of penalty have been applied so far
 * @returns               Effective progress in seconds (>= 0)
 */
export function calculateEffectiveProgress(
  elapsedMs: number,
  paceMultiplier: number,
  totalPenaltySec: number
): number {
  return Math.max(0, (elapsedMs / 1000) * paceMultiplier - totalPenaltySec);
}

// ---------------------------------------------------------------------------
// Lap information
// ---------------------------------------------------------------------------

/**
 * Information about what lap the user is currently on.
 */
export interface LapInfo {
  /** Which lap the user is currently on (1-based: first lap = 1). */
  currentLap: number;
  /** Total number of laps in this session. */
  totalLaps: number;
  /**
   * How far through the current lap the user is, as a fraction from 0.0 to 1.0.
   * 0.0 = just started the lap, 1.0 = about to finish it.
   * This value drives the car's position on the track.
   */
  lapProgress: number;
}

/**
 * Calculate which lap the user is on and how far through that lap they are.
 *
 * The number of laps depends on:
 *   - Session duration (longer session = more laps)
 *   - Track's lapTimeFactor (shorter tracks = more laps)
 *
 * For example, a 25-minute session on a track with factor 1.0 gives 5 laps.
 * The same session on Monaco (factor 0.6) gives about 8 laps.
 *
 * @param effectiveProgressSec  How much effective progress (in seconds) the user has made
 * @param targetDurationSec     The total session duration in seconds
 * @param lapTimeFactor         The track's lap time multiplier
 * @returns                     Lap information (current lap, total laps, progress within lap)
 */
export function calculateLapInfo(
  effectiveProgressSec: number,
  targetDurationSec: number,
  lapTimeFactor: number
): LapInfo {
  // How many laps fit into the session?
  // Higher total laps = shorter individual laps.
  const totalLaps = Math.ceil(
    targetDurationSec / (BASE_LAP_SECONDS * lapTimeFactor)
  );

  // How long each lap takes (in effective seconds)
  const lapDurationSec = targetDurationSec / totalLaps;

  // What lap are we on? (1-based, so lap 1 is the first lap)
  const currentLap = Math.floor(effectiveProgressSec / lapDurationSec) + 1;

  // How far through the current lap? (0.0 to 1.0)
  const lapProgress =
    (effectiveProgressSec % lapDurationSec) / lapDurationSec;

  return {
    currentLap: Math.min(currentLap, totalLaps),
    totalLaps,
    lapProgress,
  };
}

// ---------------------------------------------------------------------------
// Overall progress
// ---------------------------------------------------------------------------

/**
 * Calculate overall session progress as a fraction from 0.0 to 1.0.
 *
 * This is simpler than lap progress — it's just "how close are you to being done?"
 *   - 0.0 = just started
 *   - 0.5 = halfway through
 *   - 1.0 = session complete (100%)
 *
 * The value is clamped to [0, 1] so it never goes negative or above 100%.
 *
 * @param effectiveProgressSec  Effective progress in seconds
 * @param targetDurationSec     Total session target in seconds
 * @returns                     Progress fraction (0.0 to 1.0)
 */
export function calculateOverallProgress(
  effectiveProgressSec: number,
  targetDurationSec: number
): number {
  if (targetDurationSec <= 0) return 0;
  return Math.min(1, Math.max(0, effectiveProgressSec / targetDurationSec));
}

// ---------------------------------------------------------------------------
// Remaining time
// ---------------------------------------------------------------------------

/**
 * Calculate how many seconds remain in the session.
 *
 * This is what the countdown timer displays. It accounts for the pace
 * multiplier — if you're at 2x speed, you "eat through" remaining time
 * faster, but the remaining time itself is shown in effective seconds.
 *
 * @param effectiveProgressSec  Current effective progress in seconds
 * @param targetDurationSec     Total session target in seconds
 * @returns                     Remaining seconds (>= 0)
 */
export function calculateRemainingSec(
  effectiveProgressSec: number,
  targetDurationSec: number
): number {
  return Math.max(0, targetDurationSec - effectiveProgressSec);
}
