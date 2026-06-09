
import { useEffect, useState } from 'react';
import styles from './DurationPicker.module.css';

interface DurationPickerProps {
  durationMin: number;
  onChange: (durationMin: number) => void;
}

export function DurationPicker({ durationMin, onChange }: DurationPickerProps) {
  const MIN = 5;
  const MAX = 600;
  const STEP = 5;

  const [inputValue, setInputValue] = useState(String(durationMin));

  useEffect(() => {
    setInputValue(String(durationMin));
  }, [durationMin]);

  const handleDecrement = () => {
    if (durationMin > MIN) {
      onChange(Math.max(MIN, durationMin - STEP));
    }
  };

  const handleIncrement = () => {
    if (durationMin < MAX) {
      onChange(Math.min(MAX, durationMin + STEP));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setInputValue('');
      return;
    }

    if (/^\d*$/.test(value)) {
      setInputValue(value);
      const parsed = parseInt(value, 10);
      if (!isNaN(parsed) && parsed >= MIN && parsed <= MAX) {
        onChange(parsed);
      }
    }
  };

  const handleBlur = () => {
    if (inputValue === '') {
      onChange(MIN);
      setInputValue(String(MIN));
      return;
    }

    const parsed = parseInt(inputValue, 10);
    if (isNaN(parsed)) {
      onChange(MIN);
      setInputValue(String(MIN));
    } else {
      const clamped = Math.min(MAX, Math.max(MIN, parsed));
      onChange(clamped);
      setInputValue(String(clamped));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
      e.currentTarget.blur();
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
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
          type="button"
        >
          -
        </button>
        <div className={styles.display}>
          <input
            type="text"
            className={styles.input}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            aria-label="Duration in minutes"
          />
          <span className={styles.unit}>min</span>
        </div>
        <button
          className={styles.button}
          onClick={handleIncrement}
          disabled={durationMin >= MAX}
          aria-label="Increase duration"
          type="button"
        >
          +
        </button>
      </div>
    </div>
  );
}

