
import styles from './DurationPicker.module.css';

interface DurationPickerProps {
  durationMin: number;
  onChange: (durationMin: number) => void;
}

export function DurationPicker({ durationMin, onChange }: DurationPickerProps) {
  const MIN = 5;
  const MAX = 120;
  const STEP = 5;

  const handleDecrement = () => {
    if (durationMin > MIN) {
      onChange(durationMin - STEP);
    }
  };

  const handleIncrement = () => {
    if (durationMin < MAX) {
      onChange(durationMin + STEP);
    }
  };

  return (
    <div className={styles.container}>
      <label className={styles.label}>Duration</label>
      <div className={styles.control}>
        <button
          className={styles.button}
          onClick={handleDecrement}
          disabled={durationMin <= MIN}
          aria-label="Decrease duration"
        >
          -
        </button>
        <div className={styles.display}>
          <span className={styles.value}>{durationMin}</span>
          <span className={styles.unit}>min</span>
        </div>
        <button
          className={styles.button}
          onClick={handleIncrement}
          disabled={durationMin >= MAX}
          aria-label="Increase duration"
        >
          +
        </button>
      </div>
    </div>
  );
}
