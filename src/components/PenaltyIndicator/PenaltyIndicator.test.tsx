// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PenaltyIndicator } from './PenaltyIndicator';
import type { SessionEvent, SessionEventType } from '../../types/session';

let counter = 0;
function event(
  type: SessionEventType,
  metadata: Record<string, unknown> = {}
): SessionEvent {
  counter += 1;
  return { id: `e${counter}`, timestamp: counter, type, metadata };
}

describe('PenaltyIndicator', () => {
  it('renders nothing when there are no penalty events', () => {
    const { container } = render(
      <PenaltyIndicator events={[event('session_start'), event('lap_completed')]} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('formats a penalty_applied event', () => {
    render(
      <PenaltyIndicator
        events={[event('penalty_applied', { trigger: 'pause', penaltySec: 10 })]}
      />
    );
    expect(screen.getByText('Penalty Feed')).toBeInTheDocument();
    expect(screen.getByText('-10s (pause)')).toBeInTheDocument();
  });

  it('formats a regulation_interrupted event', () => {
    render(
      <PenaltyIndicator
        events={[event('regulation_interrupted', { trigger: 'unfocus', penaltySec: 45 })]}
      />
    );
    expect(screen.getByText('Regulation interrupted: -45s (unfocus)')).toBeInTheDocument();
  });

  it('rounds fractional penalty seconds and tolerates missing metadata', () => {
    render(
      <PenaltyIndicator events={[event('penalty_applied', { penaltySec: 12.6 })]} />
    );
    expect(screen.getByText('-13s (unknown)')).toBeInTheDocument();
  });

  it('shows only the most recent maxItems penalties, newest first', () => {
    const events = [
      event('penalty_applied', { trigger: 'pause', penaltySec: 1 }),
      event('lap_completed'),
      event('penalty_applied', { trigger: 'idle', penaltySec: 2 }),
      event('penalty_applied', { trigger: 'unfocus', penaltySec: 3 }),
      event('penalty_applied', { trigger: 'pause', penaltySec: 4 }),
    ];
    render(<PenaltyIndicator events={events} maxItems={2} />);

    const items = screen.getAllByRole('listitem').map((li) => li.textContent);
    expect(items).toEqual(['-4s (pause)', '-3s (unfocus)']);
  });
});
