import { memo } from 'react';
import { formatMMSS } from '../../utils/formatTime';
import styles from './Timer.module.css';

interface TimerProps {
  remainingSec: number;
  isPaused?: boolean;
}

export const Timer = memo(
  function Timer({ remainingSec, isPaused = false }: TimerProps) {
    return (
      <div className={styles.container}>
        <div className={styles.label}>{isPaused ? 'Paused' : 'Remaining'}</div>
        <div className={styles.time} aria-live="polite">
          {formatMMSS(remainingSec)}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if the pause state changes or the actual displayed time string changes.
    // This prevents ~59 unnecessary re-renders per second since remainingSec is updated 60fps.
    return (
      prevProps.isPaused === nextProps.isPaused &&
      formatMMSS(prevProps.remainingSec) === formatMMSS(nextProps.remainingSec)
    );
  }
);
