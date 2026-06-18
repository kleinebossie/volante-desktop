// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Timer } from './Timer';

describe('Timer', () => {
  it('formats the remaining seconds as MM:SS', () => {
    render(<Timer remainingSec={90} />);
    expect(screen.getByText('01:30')).toBeInTheDocument();
  });

  it('shows the "Remaining" label by default', () => {
    render(<Timer remainingSec={60} />);
    expect(screen.getByText('Remaining')).toBeInTheDocument();
  });

  it('shows the "Paused" label when paused', () => {
    render(<Timer remainingSec={60} isPaused />);
    expect(screen.getByText('Paused')).toBeInTheDocument();
    expect(screen.queryByText('Remaining')).not.toBeInTheDocument();
  });

  it('does not re-render the displayed time for sub-second changes (memoized)', () => {
    const { rerender } = render(<Timer remainingSec={90.9} />);
    expect(screen.getByText('01:30')).toBeInTheDocument();

    // 90.4 still floors to 01:30 → the memo comparator skips the update.
    rerender(<Timer remainingSec={90.4} />);
    expect(screen.getByText('01:30')).toBeInTheDocument();
  });

  it('re-renders when the displayed time string changes', () => {
    const { rerender } = render(<Timer remainingSec={91} />);
    expect(screen.getByText('01:31')).toBeInTheDocument();

    rerender(<Timer remainingSec={89} />);
    expect(screen.getByText('01:29')).toBeInTheDocument();
  });
});
