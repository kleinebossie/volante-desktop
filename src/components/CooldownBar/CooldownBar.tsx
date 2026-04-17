import styles from './CooldownBar.module.css';

interface CooldownBarProps {
  progress: number;
  color?: string;
}

export function CooldownBar({ progress, color = 'var(--color-accent-blue)' }: CooldownBarProps) {
  const safeProgress = Math.min(1, Math.max(0, progress));

  return (
    <div className={styles.track} role="presentation" aria-hidden="true">
      <div
        className={styles.fill}
        style={{
          transform: `scaleX(${safeProgress})`,
          backgroundColor: color,
        }}
      />
    </div>
  );
}
