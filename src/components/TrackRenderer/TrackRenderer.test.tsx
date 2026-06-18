// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TrackRenderer } from './TrackRenderer';

// jsdom does not implement SVG geometry. Stub the prototype methods so the
// renderer can resolve a path length, start/finish marker, and car position.
const PATH_D = 'M0 0 L100 0 L100 100 L0 100 Z';

// Derive the shared SVGPathElement prototype from an instance — the
// SVGPathElement constructor is not exposed as a bare global in this env.
const pathProto = Object.getPrototypeOf(
  document.createElementNS('http://www.w3.org/2000/svg', 'path')
) as Record<string, unknown>;

let originalGetTotalLength: unknown;
let originalGetPointAtLength: unknown;

beforeAll(() => {
  originalGetTotalLength = pathProto.getTotalLength;
  originalGetPointAtLength = pathProto.getPointAtLength;
  pathProto.getTotalLength = () => 1000;
  pathProto.getPointAtLength = (d: number) => ({ x: d / 10, y: 0 });
});

afterAll(() => {
  pathProto.getTotalLength = originalGetTotalLength;
  pathProto.getPointAtLength = originalGetPointAtLength;
});

describe('TrackRenderer', () => {
  it('renders an accessible SVG track map with the track path', () => {
    const { container } = render(<TrackRenderer pathD={PATH_D} lapProgress={0} />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('role', 'img');
    expect(svg).toHaveAttribute('aria-label', 'F1 track map');

    const paths = container.querySelectorAll('path');
    // measurement + glow + outline + racing line (no trail at lapProgress 0).
    expect(paths.length).toBeGreaterThanOrEqual(4);
    paths.forEach((p) => expect(p.getAttribute('d')).toBe(PATH_D));
  });

  it('renders the car group with a body rectangle', () => {
    const { container } = render(<TrackRenderer pathD={PATH_D} lapProgress={0.25} />);
    const rects = container.querySelectorAll('rect');
    expect(rects.length).toBeGreaterThanOrEqual(1); // car body (+ cockpit)
  });

  it('draws the progress trail once lap progress passes the threshold', () => {
    const { container: atStart } = render(<TrackRenderer pathD={PATH_D} lapProgress={0} />);
    const startCount = atStart.querySelectorAll('path').length;

    const { container: midLap } = render(<TrackRenderer pathD={PATH_D} lapProgress={0.5} />);
    const midCount = midLap.querySelectorAll('path').length;

    // The trail path only appears when lapProgress > 0.01.
    expect(midCount).toBeGreaterThan(startCount);
    const trail = Array.from(midLap.querySelectorAll('path')).find(
      (p) => p.style.strokeDasharray !== ''
    );
    expect(trail).toBeDefined();
  });

  it('renders the start/finish line once the path geometry resolves', () => {
    const { container } = render(
      <TrackRenderer pathD={PATH_D} lapProgress={0.1} startOffset={0.3} />
    );
    expect(container.querySelector('line')).not.toBeNull();
  });

  it('renders the debug label when enabled', () => {
    const { container } = render(
      <TrackRenderer pathD={PATH_D} lapProgress={0.42} showDebugLabel />
    );
    const text = container.querySelector('text');
    expect(text?.textContent).toContain('42.0%');
  });

  it('does not render the debug label by default', () => {
    const { container } = render(<TrackRenderer pathD={PATH_D} lapProgress={0.42} />);
    expect(container.querySelector('text')).toBeNull();
  });

  it('handles the reversed flag without error', () => {
    const { container } = render(
      <TrackRenderer pathD={PATH_D} lapProgress={0.6} reversed startOffset={0.2} />
    );
    expect(container.querySelector('svg')).not.toBeNull();
  });
});
