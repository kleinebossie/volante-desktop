// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LapCounter } from './LapCounter';

describe('LapCounter', () => {
  it('renders the current and total laps', () => {
    render(<LapCounter currentLap={3} totalLaps={20} />);
    expect(screen.getByText('Lap')).toBeInTheDocument();
    expect(screen.getByText('3/20')).toBeInTheDocument();
  });

  it('updates when laps change', () => {
    const { rerender } = render(<LapCounter currentLap={1} totalLaps={15} />);
    expect(screen.getByText('1/15')).toBeInTheDocument();

    rerender(<LapCounter currentLap={15} totalLaps={15} />);
    expect(screen.getByText('15/15')).toBeInTheDocument();
  });
});
