/**
 * TrackRenderer.tsx — SVG track renderer with animated F1 car.
 *
 * WHAT THIS COMPONENT DOES (in plain English):
 * ─────────────────────────────────────────────
 * It draws the F1 circuit as an SVG (a losslessly-scalable picture made
 * of mathematical lines). On top of that circuit it puts a tiny red car
 * that moves around the track as session progress increases.
 *
 * HOW CAR MOVEMENT WORKS:
 * ─────────────────────────────────────────────
 * 1. The track is drawn as an SVG `<path>` element.
 * 2. The browser's built-in `getPointAtLength()` function can tell us
 *    the exact (x, y) pixel coordinates at any point along that path.
 * 3. We calculate "how far along the lap" the session is (0.0 → 1.0).
 * 4. We look up the x, y, and direction angle at that position.
 * 5. The car `<rect>` is translated and rotated to that position.
 *    Because this happens ~60 times per second, the car moves smoothly.
 *
 * From ARCHITECTURE.md §9.7 — Track Renderer specification.
 * Implements Phase 5, steps 5.1–5.5.
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { useTrackProgress } from '../../hooks/useTrackProgress';
import styles from './TrackRenderer.module.css';

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface TrackRendererProps {
  /**
   * The SVG path `d` attribute string for the track.
   * This comes from `track.svgPathD` — the F1 circuit outline.
   * Example: "M 250 50 L 300 100 ..."
   */
  pathD: string;

  /**
   * How far through the current lap the car is, from 0.0 to 1.0.
   * 0.0 = start/finish line, 0.5 = halfway around, 1.0 = back at start.
   * This value comes from `calculateLapInfo().lapProgress` in the session.
   */
  lapProgress: number;

  /**
   * The track's accent color (e.g. "#e10600" for red, "#0090ff" for blue).
   * Used to color the racing line and the progress trail.
   * Falls back to the F1 red CSS variable if not provided.
   */
  accentColor?: string;

  /**
   * Fraction (0.0–1.0) along the SVG path where the real start/finish line sits.
   * Shifts both the car's "zero" position and the S/F line marker.
   */
  startOffset?: number;

  /**
   * If true, the car travels in the opposite direction along the path,
   * matching tracks whose SVG is drawn counter-clockwise.
   */
  reversed?: boolean;

  /**
   * Optional: show a small debug label with the current lapProgress value.
   * Useful during step 5.6 hardcoded testing to verify car movement.
   * Default: false.
   */
  showDebugLabel?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/**
 * All tracks from the f1-circuits-svg repo use a 500×500 viewBox.
 * We always render with this viewBox so the path coordinates are correct.
 */
const VIEWBOX = '0 0 500 500';

/**
 * Car dimensions in SVG units.
 * The car is a small rectangle, centered at the car's position.
 *
 * Width = nose-to-tail length of the car
 * Height = side-to-side width of the car
 */
const CAR_WIDTH = 10;
const CAR_HEIGHT = 5;

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function TrackRenderer({
  pathD,
  lapProgress,
  accentColor = 'var(--color-accent-red)',
  startOffset = 0,
  reversed = false,
  showDebugLabel = false,
}: TrackRendererProps) {
  // ── Refs ──────────────────────────────────────────────────────────────────
  /**
   * Reference to the invisible (but rendered) SVG `<path>` element
   * that represents the track outline. We need it so we can call
   * `pathElement.getPointAtLength()` — the browser API that tells us
   * where any point on the path is.
   *
   * Note: We use a SEPARATE hidden path element for measurements, so
   * the visible styled paths can use different stroke widths without
   * affecting length calculations (they don't — path `d` attribute
   * determines length, not stroke — but keeping them separate is cleaner).
   */
  const measurePathRef = useRef<SVGPathElement>(null);

  // ── State for reactive path ref ───────────────────────────────────────────
  /**
   * React doesn't re-render when a ref changes value. So we need a
   * state variable that holds the *actual path element* once it mounts.
   *
   * The flow:
   *   1. Component renders → measurePathRef.current = null initially
   *   2. SVG mounts in DOM → the ref callback fires → we update pathElement state
   *   3. State update → re-render → useTrackProgress gets the real path element
   *   4. Car position is computed and rendered correctly
   */
  const [pathElement, setPathElement] = useState<SVGPathElement | null>(null);

  /**
   * Callback ref — fires when the path element mounts or unmounts.
   * This is how we bridge the "ref is populated" event into React state.
   */
  const handlePathMount = useCallback((node: SVGPathElement | null) => {
    // Store in the ref for stable access
    (measurePathRef as React.MutableRefObject<SVGPathElement | null>).current = node;
    // Also push into state so useTrackProgress gets a fresh render
    setPathElement(node);
  }, []);

  // ── Force re-render when pathD changes ───────────────────────────────────
  /**
   * If the user picks a different track (different pathD), the SVG path
   * element itself doesn't change — only its `d` attribute does.
   * We nudge state so useTrackProgress recalculates with the new path length.
   */
  useEffect(() => {
    if (measurePathRef.current) {
      setPathElement(measurePathRef.current);
    }
  }, [pathD]);

  // ── Apply direction/position correction ──────────────────────────────────
  /**
   * The raw `lapProgress` from the engine always runs 0→1 forward along the
   * SVG path starting at its geometric origin (wherever the path data begins).
   *
   * We need two corrections:
   *  1. `reversed` — some SVG paths are drawn counter-clockwise vs the real
   *     circuit direction. Flip to 1-p so the car moves the right way.
   *  2. `startOffset` — the real start/finish line is rarely at the path's
   *     geometric origin. We shift the zero point by `startOffset` so the
   *     car starts from the correct place on screen.
   */
  let adjustedProgress = lapProgress;
  if (reversed) {
    adjustedProgress = 1 - adjustedProgress;
  }
  adjustedProgress = (adjustedProgress + startOffset) % 1.0;

  // ── Compute car position ──────────────────────────────────────────────────
  /**
   * useTrackProgress calls getPointAtLength under the hood.
   * Returns { x, y, angle } — where the car should be and which
   * direction it should face.
   */
  const carPos = useTrackProgress(pathElement, adjustedProgress);

  // Extra 180° when reversed so the car faces the direction it is travelling
  const carAngle = reversed ? carPos.angle + 180 : carPos.angle;

  // ── Compute progress trail ────────────────────────────────────────────────
  /**
   * To draw a perfectly smooth trail matching the track outline, we use
   * a path with the exact same `d` attribute and control its visibility
   * via CSS `stroke-dasharray` and `stroke-dashoffset`.
   * This is perfectly smooth and matches the track's curves pixel-for-pixel.
   */

  // ── Compute start/finish line markers ────────────────────────────────────
  /**
   * The start/finish line is a small perpendicular line across the track
   * at position 0. We draw it as two short lines forming a cross/tick.
   *
   * We get the start position from the already-computed carPos when
   * lapProgress is 0, but since we always need it we compute it separately
   * by querying position 0.0.
   */
  // We'll use the pathElement ref to compute the start point on mount
  const [startPoint, setStartPoint] = useState<{ x: number; y: number; angle: number } | null>(null);
  const [pathLength, setPathLength] = useState<number>(0);

  useEffect(() => {
    if (!pathElement) return;
    try {
      const totalLength = pathElement.getTotalLength();
      setPathLength(totalLength);
      // S/F line sits at the startOffset fraction along the path
      const sfLength = startOffset * totalLength;
      const pt = pathElement.getPointAtLength(sfLength);
      // Sample a tiny bit ahead (respecting direction) to get the angle
      const delta = reversed ? -2 : 2;
      const ptAhead = pathElement.getPointAtLength(
        Math.min(Math.max(0, sfLength + delta), totalLength)
      );
      const angle =
        Math.atan2(ptAhead.y - pt.y, ptAhead.x - pt.x) * (180 / Math.PI);
      setStartPoint({ x: pt.x, y: pt.y, angle });
    } catch {
      // SVG not ready yet — safe to ignore
    }
  }, [pathElement, pathD, startOffset, reversed]);

  // ── Car transform ─────────────────────────────────────────────────────────
  /**
   * We position and rotate the car using an SVG `transform` attribute.
   *
   * The approach:
   *   1. Translate to the car's (x, y) position
   *   2. Rotate by the path's angle (so the car noses forward into corners)
   *   3. Translate back by half the car size so it's CENTERED on the point
   *      (without this, the car's top-left corner sits on the track, not its center)
   */
  const carTransform = `
    translate(${carPos.x}, ${carPos.y})
    rotate(${carAngle})
    translate(${-CAR_WIDTH / 2}, ${-CAR_HEIGHT / 2})
  `;

  // ── Start/finish line transform ───────────────────────────────────────────
  const sfTransform = startPoint
    ? `translate(${startPoint.x}, ${startPoint.y}) rotate(${startPoint.angle + 90})`
    : undefined;

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className={styles.trackContainer}>
      <svg
        className={styles.trackSvg}
        viewBox={VIEWBOX}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="F1 track map"
        role="img"
      >
        {/*
         * ── MEASUREMENT PATH (invisible) ─────────────────────────────────
         * This path is invisible but MUST be rendered so the browser can
         * answer `getPointAtLength()` calls. Without rendering it, the
         * SVG DOM APIs won't work.
         */}
        <path
          ref={handlePathMount}
          d={pathD}
          fill="none"
          stroke="none"
          strokeWidth={0}
        />

        {/*
         * ── TRACK GLOW (bottom layer: wide, very faint) ──────────────────
         * Creates a soft ambient glow around the track, making it look
         * like it's lit from below — that F1 broadcast aesthetic.
         */}
        <path
          d={pathD}
          className={styles.trackGlow}
        />

        {/*
         * ── TRACK OUTLINE (main road surface) ───────────────────────────
         * The semi-transparent white strip that represents the track surface.
         */}
        <path
          d={pathD}
          className={styles.trackPath}
        />

        {/*
         * ── RACING LINE (thin accent line on top of the track) ───────────
         * The "ideal racing line" — a thinner colored stroke on top.
         * Uses the track's accent color prop.
         */}
        <path
          d={pathD}
          className={styles.racingLine}
          style={{ stroke: accentColor }}
        />

        {/*
         * ── PROGRESS TRAIL (colored segment behind the car) ──────────────
         * Shows the portion of the current lap that's been completed.
         * The trail starts at the start/finish line and ends at the car.
         */}
        {pathLength > 0 && adjustedProgress > 0.01 && (
          <path
            d={pathD}
            className={styles.progressTrail}
            style={{
              stroke: accentColor,
              strokeDasharray: pathLength,
              strokeDashoffset: pathLength - adjustedProgress * pathLength,
            }}
          />
        )}

        {/*
         * ── START/FINISH LINE ────────────────────────────────────────────
         * A small perpendicular line across the track at position 0.
         * The classic F1 start/finish marker.
         */}
        {startPoint && sfTransform && (
          <line
            x1={0}
            y1={-8}
            x2={0}
            y2={8}
            className={styles.startFinishLine}
            transform={sfTransform}
          />
        )}

        {/*
         * ── CAR ──────────────────────────────────────────────────────────
         * A small rectangle that moves along the track.
         * It's rotated to always face the direction the path is heading.
         * Red fill + glow filter = it looks like an F1 car's rear light.
         *
         * The `key` on the group forces re-mount (and re-transition) if
         * lapProgress resets back to 0 (new lap started).
         */}
        <g className={styles.car} transform={carTransform}>
          {/* Car body */}
          <rect
            x={0}
            y={0}
            width={CAR_WIDTH}
            height={CAR_HEIGHT}
            rx={1.5}
            fill="var(--color-accent-red)"
          />
          {/* Cockpit highlight — smaller bright rect on top */}
          <rect
            x={CAR_WIDTH * 0.3}
            y={CAR_HEIGHT * 0.2}
            width={CAR_WIDTH * 0.35}
            height={CAR_HEIGHT * 0.6}
            rx={1}
            fill="rgba(255, 255, 255, 0.6)"
          />
        </g>

        {/*
         * ── DEBUG LABEL (step 5.6 testing only) ──────────────────────────
         * Shows the raw lapProgress value so we can verify the number
         * is changing as expected during hardcoded animation testing.
         */}
        {showDebugLabel && (
          <text
            x={10}
            y={20}
            className={styles.testLabel}
          >
            lap: {(lapProgress * 100).toFixed(1)}%
          </text>
        )}
      </svg>
    </div>
  );
}
