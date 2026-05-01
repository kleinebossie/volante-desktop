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
// (No top-level constants — lap times are now per-track real values)

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
 * The number of laps is based on the real-world F1 lap time for the track:
 *   - Monaco (76 s lap): a 25-min session gives ceil(1500 / 76) = 20 laps
 *   - Spa (107 s lap): a 25-min session gives ceil(1500 / 107) = 15 laps
 *
 * @param effectiveProgressSec  How much effective progress (in seconds) the user has made
 * @param targetDurationSec     The total session duration in seconds
 * @param lapTimeSec            The track's approximate real F1 lap time in seconds
 * @returns                     Lap information (current lap, total laps, progress within lap)
 */
export function calculateLapInfo(
  effectiveProgressSec: number,
  targetDurationSec: number,
  lapTimeSec: number
): LapInfo {
  // How many laps fit into the session based on the real lap time?
  const totalLaps = Math.ceil(targetDurationSec / lapTimeSec);

  // Spread target duration evenly across all laps
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
