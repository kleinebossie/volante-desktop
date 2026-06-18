// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SessionSummaryCard, type SessionSummaryRow } from './SessionSummaryCard';

const rows: SessionSummaryRow[] = [
  { label: 'Duration', value: '25:00 target' },
  { label: 'Laps', value: '20/20', tone: 'success' },
  { label: 'Penalties', value: '-30s', tone: 'danger' },
];

describe('SessionSummaryCard', () => {
  it('renders the title as an accessible region', () => {
    render(<SessionSummaryCard title="Session Overview" rows={rows} />);
    expect(screen.getByRole('region', { name: 'Session Overview' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Session Overview' })).toBeInTheDocument();
  });

  it('renders every row label and value', () => {
    render(<SessionSummaryCard title="Overview" rows={rows} />);
    for (const row of rows) {
      expect(screen.getByText(row.label)).toBeInTheDocument();
      expect(screen.getByText(row.value)).toBeInTheDocument();
    }
  });

  it('renders an empty card with no rows', () => {
    render(<SessionSummaryCard title="Empty" rows={[]} />);
    expect(screen.getByRole('region', { name: 'Empty' })).toBeInTheDocument();
  });
});
