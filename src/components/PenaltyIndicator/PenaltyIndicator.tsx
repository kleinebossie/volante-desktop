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

/**
 * ⚡ Bolt Optimization: Added React.memo()
 *
 * Impact: Prevents this component from re-rendering ~60 times per second
 * when the parent RaceScreen ticks the session clock.
 *
 * Why: The parent RaceScreen subscribes to the entire session state,
 * which updates on every animation frame. Since `events` and `maxItems`
 * are referentially stable between frames, memoizing this display
 * component avoids running the formatting loop and diffing the list
 * on every tick, saving CPU overhead on the main thread.
 */
export const PenaltyIndicator = memo(function PenaltyIndicator({ events, maxItems = 3 }: PenaltyIndicatorProps) {
  const items: { id: string; text: string }[] = [];

  // Iterate backwards to get the most recent penalty events without mapping the whole array.
  for (let i = events.length - 1; i >= 0 && items.length < maxItems; i--) {
    const formatted = formatPenaltyEvent(events[i]);
    if (formatted) {
      items.push(formatted);
    }
  }

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
