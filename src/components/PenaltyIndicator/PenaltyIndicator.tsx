import { memo } from 'react';
import type { SessionEvent } from '../../types/session';
import styles from './PenaltyIndicator.module.css';

interface PenaltyIndicatorProps {
  events: SessionEvent[];
  maxItems?: number;
}

function formatPenaltyEvent(event: SessionEvent): { id: string; text: string } | null {
  if (event.type === 'penalty_applied') {
    const trigger = String(event.metadata.trigger ?? 'unknown');
    const penaltySec = Number(event.metadata.penaltySec ?? 0);
    return {
      id: event.id,
      text: `-${Math.round(penaltySec)}s (${trigger})`,
    };
  }

  if (event.type === 'regulation_interrupted') {
    const trigger = String(event.metadata.trigger ?? 'unknown');
    const penaltySec = Number(event.metadata.penaltySec ?? 0);
    return {
      id: event.id,
      text: `Regulation interrupted: -${Math.round(penaltySec)}s (${trigger})`,
    };
  }

  return null;
}

// ⚡ Bolt: Wrapped in React.memo to prevent unnecessary ~60fps re-renders from RaceScreen.
// The `events` array reference only changes when new events are added to the session.
export const PenaltyIndicator = memo(function PenaltyIndicator({ events, maxItems = 3 }: PenaltyIndicatorProps) {
  const items = events
    .map(formatPenaltyEvent)
    .filter((item): item is { id: string; text: string } => item !== null)
    .slice(-maxItems)
    .reverse();

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.title}>Penalty Feed</div>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id} className={styles.item}>
            {item.text}
          </li>
        ))}
      </ul>
    </div>
  );
});
