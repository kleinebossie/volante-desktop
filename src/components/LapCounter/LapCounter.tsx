import { memo } from 'react';
import styles from './LapCounter.module.css';

interface LapCounterProps {
  currentLap: number;
  totalLaps: number;
}

// ⚡ Bolt: Wrapped in React.memo to prevent unnecessary ~60fps re-renders from RaceScreen
// since laps only update occasionally during a session.
export const LapCounter = memo(function LapCounter({ currentLap, totalLaps }: LapCounterProps) {
  return (
    <div className={styles.container}>
      <span className={styles.label}>Lap</span>
      <span className={styles.value}>
        {currentLap}/{totalLaps}
      </span>
    </div>
  );
});
