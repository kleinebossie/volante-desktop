/**
 * useTrackProgress.ts — React hook for computing the car's position on the track.
 *
 * This hook takes a reference to the SVG `<path>` element (the track)
 * and the current lap progress fraction (0.0 to 1.0), and returns the
 * exact (x, y, angle) position where the car should be rendered.
 *
 * It uses the SVG DOM API `getPointAtLength()` under the hood via the
 * `interpolatePath` utility module.
 *
 * Usage in TrackRenderer:
 *   1. Render the track `<path>` and capture a ref to it
 *   2. Pass the ref and lapProgress to this hook
 *   3. Use the returned x, y, angle to position and rotate the car element
 *
 * From ARCHITECTURE.md §9.7 and Phase 4 step 4.9.
 */

import { useMemo } from 'react';
import { getPointAtProgress, type TrackPoint } from '../utils/interpolatePath';
import { useSessionStore } from '../stores/sessionStore';

/**
 * Default position when the path isn't available yet (e.g., before first render).
 */
const DEFAULT_POINT: TrackPoint = { x: 0, y: 0, angle: 0 };

/**
 * React hook that computes the car's position on the track.
 *
 * Given a reference to the SVG path element and how far through the
 * current lap the user is, this returns the exact coordinates and
 * rotation angle for the car.
 *
 * The car smoothly follows the track because:
 *   - `lapProgress` updates every animation frame (~60 times per second)
 *   - `getPointAtLength()` gives precise positions along the SVG path
 *   - The angle makes the car face the right direction through corners
 *
 * @param pathRef      Reference to the SVG `<path>` element representing the track.
 *                     Can be null if the path hasn't been rendered yet.
 * @param lapProgress  How far through the current lap (0.0 = start, 1.0 = finish).
 *                     This value comes from `calculateLapInfo()` in the progress calculator.
 * @returns            The car's position (x, y) and rotation angle in degrees.
 *
 * @example
 * ```tsx
 * function TrackRenderer({ pathD, lapProgress }) {
 *   const pathRef = useRef<SVGPathElement>(null);
 *   const carPos = useTrackProgress(pathRef.current, lapProgress);
 *
 *   return (
 *     <svg viewBox="0 0 500 500">
 *       <path ref={pathRef} d={pathD} />
 *       <circle
 *         cx={carPos.x}
 *         cy={carPos.y}
 *         r={6}
 *         transform={`rotate(${carPos.angle}, ${carPos.x}, ${carPos.y})`}
 *       />
 *     </svg>
 *   );
 * }
 * ```
 */
export function useTrackProgress(
  pathRef: SVGPathElement | null,
  lapProgress: number
): TrackPoint {
  // Memoize the calculation — it only re-runs when pathRef or lapProgress changes.
  // Since lapProgress changes every frame, this recalculates every frame,
  // which is exactly what we want for smooth car movement.
  const point = useMemo(() => {
    if (!pathRef) return DEFAULT_POINT;

    return getPointAtProgress(pathRef, lapProgress);
  }, [pathRef, lapProgress]);

  return point;
}

/**
 * Hook to select track progress data from the session store.
 */
export function useTrackProgressData() {
  return useSessionStore((s) => s.session?.effectiveProgressSec ?? 0);
}
