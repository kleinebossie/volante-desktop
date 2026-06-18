// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CooldownBar } from './CooldownBar';

function getFill(container: HTMLElement): HTMLElement {
  const track = container.firstChild as HTMLElement;
  return track.firstChild as HTMLElement;
}

describe('CooldownBar', () => {
  it('scales the fill by the given progress', () => {
    const { container } = render(<CooldownBar progress={0.5} />);
    expect(getFill(container).style.transform).toBe('scaleX(0.5)');
  });

  it('clamps progress above 1 down to 1', () => {
    const { container } = render(<CooldownBar progress={1.7} />);
    expect(getFill(container).style.transform).toBe('scaleX(1)');
  });

  it('clamps negative progress up to 0', () => {
    const { container } = render(<CooldownBar progress={-0.4} />);
    expect(getFill(container).style.transform).toBe('scaleX(0)');
  });

  it('applies the default accent color when none is provided', () => {
    const { container } = render(<CooldownBar progress={0.3} />);
    expect(getFill(container).style.backgroundColor).toBe('var(--color-accent-blue)');
  });

  it('applies a custom color', () => {
    const { container } = render(<CooldownBar progress={0.3} color="#ff0000" />);
    expect(getFill(container).style.backgroundColor).toBe('rgb(255, 0, 0)');
  });

  it('marks the bar as decorative for assistive tech', () => {
    const { container } = render(<CooldownBar progress={0.3} />);
    const track = container.firstChild as HTMLElement;
    expect(track.getAttribute('role')).toBe('presentation');
    expect(track.getAttribute('aria-hidden')).toBe('true');
  });
});
