import { CooldownBar } from '../CooldownBar/CooldownBar';
import type { RegulationState } from '../../engine/regulationsEngine';
import styles from './RegulationButton.module.css';

interface RegulationButtonProps {
  icon: string;
  label: string;
  accentColor: string;
  state: RegulationState;
  cooldownProgress: number;
  cooldownRemainingSec: number;
  activeProgress: number;
  activeRemainingSec: number;
  remainingUses: number | null;
  onActivate: () => void;
}

const stateLabel: Record<RegulationState, string> = {
  available: 'Ready',
  active: 'Active',
  cooldown: 'Cooldown',
  depleted: 'Depleted',
  locked: 'Locked',
  unavailable: 'Unavailable',
};

export function RegulationButton({
  icon,
  label,
  accentColor,
  state,
  cooldownProgress,
  cooldownRemainingSec,
  activeProgress,
  activeRemainingSec,
  remainingUses,
  onActivate,
}: RegulationButtonProps) {
  const isClickable = state === 'available';
  const barProgress = state === 'active' ? activeProgress : cooldownProgress;
  const showBar = state === 'active' || state === 'cooldown';
  const statusTime = state === 'active'
    ? `${Math.ceil(activeRemainingSec)}s`
    : state === 'cooldown'
      ? `${Math.ceil(cooldownRemainingSec)}s`
      : null;

  return (
    <button
      type="button"
      className={`${styles.button} ${styles[state]}`}
      style={{
        '--regulation-accent': accentColor,
      } as React.CSSProperties}
      onClick={onActivate}
      disabled={!isClickable}
      aria-label={`${label} regulation`}
      aria-disabled={!isClickable}
    >
      <div className={styles.topRow}>
        <span className={styles.icon}>{icon}</span>
        <span className={styles.title}>{label}</span>
      </div>

      <div className={styles.metaRow}>
        <span className={styles.stateText}>{stateLabel[state]}</span>
        {statusTime ? <span className={styles.timeText}>{statusTime}</span> : null}
      </div>

      {showBar ? <CooldownBar progress={barProgress} color={accentColor} /> : null}

      {remainingUses !== null ? (
        <div className={styles.uses}>Uses left: {remainingUses}</div>
      ) : null}
    </button>
  );
}
