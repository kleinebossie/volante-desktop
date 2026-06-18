// @vitest-environment jsdom
//
// interpolatePath relies on the SVG geometry APIs getTotalLength /
// getPointAtLength, which jsdom does not implement. Each test builds a real
// <path> element and supplies deterministic geometry functions so the cache,
// clamping, and shortest-arc angle interpolation can be exercised precisely.

import { describe, expect, it, vi } from 'vitest';
import { getPointAtProgress, getPathLength } from './interpolatePath';

function makePath(
  totalLength: number,
  pointAt: (d: number) => { x: number; y: number }
): { el: SVGPathElement; getPointAtLength: ReturnType<typeof vi.fn> } {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'path') as SVGPathElement;
  el.getTotalLength = () => totalLength;
  const getPointAtLength = vi.fn((d: number) => pointAt(d));
  (el as unknown as { getPointAtLength: (d: number) => { x: number; y: number } }).getPointAtLength =
    getPointAtLength;
  return { el, getPointAtLength };
}

// A straight horizontal line: point(d) = (d, 0); heading is always 0°.
function straightLine(totalLength = 1000) {
  return makePath(totalLength, (d) => ({ x: d, y: 0 }));
}

describe('getPathLength', () => {
  it('returns the path total length', () => {
    const { el } = straightLine(742);
    expect(getPathLength(el)).toBe(742);
  });
});

describe('getPointAtProgress', () => {
  it('returns the point and a 0° heading along a straight line', () => {
    const { el } = straightLine(1000);
    const mid = getPointAtProgress(el, 0.5);
    expect(mid.x).toBeCloseTo(500, 5);
    expect(mid.y).toBeCloseTo(0, 5);
    expect(mid.angle).toBeCloseTo(0, 5);
  });

  it('clamps progress below 0 and above 1', () => {
    const { el } = straightLine(1000);
    const start = getPointAtProgress(el, -5);
    const end = getPointAtProgress(el, 5);
    expect(start.x).toBeCloseTo(0, 5);
    expect(end.x).toBeCloseTo(1000, 5);
  });

  it('caches geometry per element — getTotalLength/getPointAtLength run once', () => {
    const { el, getPointAtLength } = straightLine(1000);
    const totalLengthSpy = vi.spyOn(el, 'getTotalLength');

    getPointAtProgress(el, 0.1);
    const callsAfterFirst = getPointAtLength.mock.calls.length;
    expect(totalLengthSpy).toHaveBeenCalledTimes(1);
    expect(callsAfterFirst).toBeGreaterThan(0);

    // Subsequent lookups reuse the cache: no further geometry queries.
    getPointAtProgress(el, 0.2);
    getPointAtProgress(el, 0.9);
    expect(totalLengthSpy).toHaveBeenCalledTimes(1);
    expect(getPointAtLength.mock.calls.length).toBe(callsAfterFirst);
  });

  it('returns the exact lower cache point when progress lands on a cache index', () => {
    // progress * 1000 must be an integer → t === 0 path (no interpolation).
    const { el } = straightLine(1000);
    const p = getPointAtProgress(el, 0.25); // index 250 exactly
    expect(p.x).toBeCloseTo(250, 5);
  });

  it('linearly interpolates position between two cache points', () => {
    // 0.5005 → exactIndex 500.5 → lerp halfway between index 500 and 501.
    const { el } = straightLine(1000);
    const p = getPointAtProgress(el, 0.5005);
    expect(p.x).toBeCloseTo(500.5, 5);
  });

  it('interpolates the heading along the SHORTEST arc across the ±180° seam (CCW)', () => {
    // Counter-clockwise circle. The tangent heading sweeps through ±180°
    // exactly once, so somewhere two adjacent cache points straddle the seam.
    const R = 100;
    const C = 250;
    const L = 2 * Math.PI * R;
    const { el } = makePath(L, (d) => {
      const theta = (d / L) * 2 * Math.PI;
      return { x: C + R * Math.cos(theta), y: C + R * Math.sin(theta) };
    });

    // Build the cache and read the raw per-index headings.
    const angles: number[] = [];
    for (let i = 0; i <= 1000; i++) {
      angles.push(getPointAtProgress(el, i / 1000).angle);
    }

    // Locate the cache cell where the raw heading jumps by more than 180°.
    let seamIndex = -1;
    for (let i = 0; i < 1000; i++) {
      if (Math.abs(angles[i + 1] - angles[i]) > 180) {
        seamIndex = i;
        break;
      }
    }
    expect(seamIndex).toBeGreaterThanOrEqual(0);

    // Sample the middle of the straddling cell. Short-arc interpolation keeps
    // the heading near ±180 (continuous); the buggy "long way round" would
    // instead collapse to ~0.
    const mid = getPointAtProgress(el, (seamIndex + 0.5) / 1000);
    expect(Math.abs(mid.angle)).toBeGreaterThan(170);
  });

  it('interpolates the heading along the SHORTEST arc across the ±180° seam (CW)', () => {
    // Clockwise circle exercises the opposite wrap branch (angleDelta < -180).
    const R = 100;
    const C = 250;
    const L = 2 * Math.PI * R;
    const { el } = makePath(L, (d) => {
      const theta = -(d / L) * 2 * Math.PI;
      return { x: C + R * Math.cos(theta), y: C + R * Math.sin(theta) };
    });

    const angles: number[] = [];
    for (let i = 0; i <= 1000; i++) {
      angles.push(getPointAtProgress(el, i / 1000).angle);
    }

    let seamIndex = -1;
    for (let i = 0; i < 1000; i++) {
      if (Math.abs(angles[i + 1] - angles[i]) > 180) {
        seamIndex = i;
        break;
      }
    }
    expect(seamIndex).toBeGreaterThanOrEqual(0);

    const mid = getPointAtProgress(el, (seamIndex + 0.5) / 1000);
    expect(Math.abs(mid.angle)).toBeGreaterThan(170);
  });

  it('uses the behind-point to compute heading at the very end of the path', () => {
    // At progress 1.0 the look-ahead is clamped to totalLength, so the code
    // falls back to the behind-point branch. A straight line still yields 0°.
    const { el } = straightLine(1000);
    const end = getPointAtProgress(el, 1);
    expect(end.x).toBeCloseTo(1000, 5);
    expect(end.angle).toBeCloseTo(0, 5);
  });
});
