import { memo } from 'react';
import { formatMMSS } from '../../utils/formatTime';
import styles from './Timer.module.css';

interface TimerProps {
  remainingSec: number;
  isPaused?: boolean;
}

// ⚡ Bolt: Wrapped in React.memo with a custom equality function.
// RaceScreen re-renders ~60 times per second, passing a new fractional `remainingSec` every frame.
// By comparing `Math.floor(remainingSec)`, this component only re-renders ~1 time per second
// when the visual text output actually changes, saving significant DOM diffing effort.
export const Timer = memo(function Timer({ remainingSec, isPaused = false }: TimerProps) {
  return (
    <div className={styles.container}>
      <div className={styles.label}>{isPaused ? 'Paused' : 'Remaining'}</div>
      <div className={styles.time} aria-live="polite">
        {formatMMSS(remainingSec)}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    Math.floor(prevProps.remainingSec) === Math.floor(nextProps.remainingSec) &&
    prevProps.isPaused === nextProps.isPaused
  );
});
