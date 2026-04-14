/**
 * interpolatePath.ts — SVG path point interpolation utilities.
 *
 * This module provides helper functions that calculate a point's (x, y)
 * position along an SVG path at a given progress fraction (0.0 to 1.0).
 *
 * The main use case: as the user works through their session, the "car"
 * needs to move along the track. This module figures out WHERE on the
 * track the car should be at any given moment.
 *
 * It relies on the SVG DOM API `getPointAtLength()`, which only works
 * on rendered `<path>` elements in the browser. That's why the Track
 * Renderer component passes a `ref` to the SVG path element.
 *
 * From ARCHITECTURE.md §9.7 (car position calculation).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * A point on the track with x/y coordinates and a rotation angle.
 *
 * The angle tells the car which direction to face so it always points
 * "forward" along the track. Without the angle, the car would slide
 * sideways through corners looking silly.
 */
export interface TrackPoint {
  /** X coordinate within the SVG viewBox (0–500) */
  x: number;
  /** Y coordinate within the SVG viewBox (0–500) */
  y: number;
  /** Rotation angle in degrees — the direction the track is heading */
  angle: number;
}

// ---------------------------------------------------------------------------
// Core function: get a point along a path at a given progress
// ---------------------------------------------------------------------------

/**
 * Calculate the (x, y, angle) position at a fractional progress along
 * an SVG path element.
 *
 * How it works:
 *   1. Get the total length of the path (in SVG units).
 *   2. Multiply by `progress` to find where along the path we are.
 *   3. Use `getPointAtLength()` to get the (x, y) coordinates at that distance.
 *   4. Get another point slightly further along, then compute the angle
 *      from the difference — this tells us which direction the path is heading.
 *
 * @param pathElement  A rendered SVG `<path>` element (from a React ref)
 * @param progress     How far along the path, from 0.0 (start) to 1.0 (end)
 * @returns            The position and rotation at that point on the track
 *
 * @example
 * ```tsx
 * const pathRef = useRef<SVGPathElement>(null);
 * const carPos = getPointAtProgress(pathRef.current, 0.5); // halfway around the track
 * // → { x: 250, y: 123, angle: 45 }
 * ```
 */
export function getPointAtProgress(
  pathElement: SVGPathElement,
  progress: number
): TrackPoint {
  const totalLength = pathElement.getTotalLength();

  // Clamp progress to [0, 1] just in case
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const distance = clampedProgress * totalLength;

  // Get the (x, y) position at this distance along the path
  const point = pathElement.getPointAtLength(distance);

  // Get a second point slightly ahead to calculate the direction angle.
  // We use a small offset (2 SVG units) to get a reasonable direction.
  // If we're near the end, we look backwards instead.
  const LOOK_AHEAD = 2;
  const aheadDistance = Math.min(distance + LOOK_AHEAD, totalLength);
  const behindDistance = Math.max(distance - LOOK_AHEAD, 0);

  let angle: number;

  if (aheadDistance > distance) {
    // Normal case: look ahead
    const nextPoint = pathElement.getPointAtLength(aheadDistance);
    angle =
      Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) *
      (180 / Math.PI);
  } else {
    // Near the end: look behind and reverse the angle
    const prevPoint = pathElement.getPointAtLength(behindDistance);
    angle =
      Math.atan2(point.y - prevPoint.y, point.x - prevPoint.x) *
      (180 / Math.PI);
  }

  return {
    x: point.x,
    y: point.y,
    angle,
  };
}

// ---------------------------------------------------------------------------
// Get the starting point of a path (position 0)
// ---------------------------------------------------------------------------

/**
 * Get the (x, y, angle) at the very start of the path.
 *
 * Useful for positioning the car at the starting grid before the
 * session begins.
 *
 * @param pathElement  A rendered SVG `<path>` element
 * @returns            The start position and heading direction
 */
export function getStartPoint(pathElement: SVGPathElement): TrackPoint {
  return getPointAtProgress(pathElement, 0);
}

// ---------------------------------------------------------------------------
// Get the total length of a path
// ---------------------------------------------------------------------------

/**
 * Get the total length of the SVG path in SVG units.
 *
 * This is mostly for debugging or for advanced use cases like
 * calculating exact pixel-per-progress ratios.
 *
 * @param pathElement  A rendered SVG `<path>` element
 * @returns            Total path length in SVG units
 */
export function getPathLength(pathElement: SVGPathElement): number {
  return pathElement.getTotalLength();
}

// ---------------------------------------------------------------------------
// Generate a trail (series of points along a portion of the path)
// ---------------------------------------------------------------------------

/**
 * Generate a series of points along a section of the path.
 *
 * Used to draw the "progress trail" behind the car — a colored line
 * showing how much of the current lap has been completed.
 *
 * @param pathElement  A rendered SVG `<path>` element
 * @param fromProgress Start of the trail (0.0 to 1.0)
 * @param toProgress   End of the trail (0.0 to 1.0)
 * @param numPoints    How many points to generate (more = smoother trail)
 * @returns            Array of {x, y} points forming the trail
 */
export function getTrailPoints(
  pathElement: SVGPathElement,
  fromProgress: number,
  toProgress: number,
  numPoints: number = 50
): Array<{ x: number; y: number }> {
  if (numPoints < 2) return [];

  const totalLength = pathElement.getTotalLength();
  const from = Math.max(0, Math.min(1, fromProgress));
  const to = Math.max(0, Math.min(1, toProgress));

  const points: Array<{ x: number; y: number }> = [];

  for (let i = 0; i < numPoints; i++) {
    const t = from + (to - from) * (i / (numPoints - 1));
    const point = pathElement.getPointAtLength(t * totalLength);
    points.push({ x: point.x, y: point.y });
  }

  return points;
}
