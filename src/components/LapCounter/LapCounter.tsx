import styles from './LapCounter.module.css';

interface LapCounterProps {
  currentLap: number;
  totalLaps: number;
}

export function LapCounter({ currentLap, totalLaps }: LapCounterProps) {
  return (
    <div className={styles.container}>
      <span className={styles.label}>Lap</span>
      <span className={styles.value}>
        {currentLap}/{totalLaps}
      </span>
    </div>
  );
}
