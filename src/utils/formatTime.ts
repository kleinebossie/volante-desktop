/**
 * formatTime.ts — Utility functions for formatting time durations.
 *
 * All functions take a duration in seconds and return a human-readable string.
 * These are used throughout the app for timer displays and summary screens.
 */

/**
 * Formats seconds into MM:SS display format.
 * Example: formatMMSS(90) → "01:30"
 * Example: formatMMSS(3661) → "61:01"  (hours roll into minutes)
 */
export function formatMMSS(totalSeconds: number): string {
  const clampedSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(clampedSeconds / 60);
  const seconds = clampedSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Formats seconds into HH:MM:SS display format.
 * Example: formatHHMMSS(3661) → "01:01:01"
 */
export function formatHHMMSS(totalSeconds: number): string {
  const clampedSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(clampedSeconds / 3600);
  const minutes = Math.floor((clampedSeconds % 3600) / 60);
  const seconds = clampedSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Formats a penalty value as "+Xs" or "-Xs" for penalty feed display.
 * Example: formatPenalty(-10) → "-10s"
 * Example: formatPenalty(30) → "+30s"
 */
export function formatPenalty(penaltySec: number): string {
  const absVal = Math.abs(Math.round(penaltySec));
  return penaltySec >= 0 ? `+${absVal}s` : `-${absVal}s`;
}

/**
 * Formats a duration in minutes for display in the setup/summary screens.
 * Example: formatMinutes(25) → "25 min"
 * Example: formatMinutes(90) → "1h 30m"
 */
export function formatMinutes(totalMinutes: number): string {
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
}

/**
 * Converts seconds to minutes (rounded down).
 * Example: secondsToMinutes(1500) → 25
 */
export function secondsToMinutes(seconds: number): number {
  return Math.floor(seconds / 60);
}
