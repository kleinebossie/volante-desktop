
import styles from './StrategyNote.module.css';

interface StrategyNoteProps {
  note: string;
  onChangeNote: (note: string) => void;
  parcFerme: boolean;
  onChangeParcFerme: (enabled: boolean) => void;
}

export function StrategyNote({
  note,
  onChangeNote,
  parcFerme,
  onChangeParcFerme,
}: StrategyNoteProps) {
  return (
    <div className={styles.container}>
      <label className={styles.label}>Strategy Note</label>
      <div className={styles.inputContainer}>
        <input
          type="text"
          className={styles.input}
          placeholder="What will you focus on?"
          value={note}
          onChange={(e) => onChangeNote(e.target.value)}
        />
      </div>
      <label className={styles.checkboxLabel}>
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={parcFerme}
          onChange={(e) => onChangeParcFerme(e.target.checked)}
        />
        <span className={styles.checkboxText}>Lock after start (Parc Fermé)</span>
      </label>
    </div>
  );
}
