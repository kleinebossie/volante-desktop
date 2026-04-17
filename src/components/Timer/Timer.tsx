import { formatMMSS } from '../../utils/formatTime';
import styles from './Timer.module.css';

interface TimerProps {
  remainingSec: number;
  isPaused?: boolean;
}

export function Timer({ remainingSec, isPaused = false }: TimerProps) {
  return (
    <div className={styles.container}>
      <div className={styles.label}>{isPaused ? 'Paused' : 'Remaining'}</div>
      <div className={styles.time} aria-live="polite">
        {formatMMSS(remainingSec)}
      </div>
    </div>
  );
}
