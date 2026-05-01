
import { useMemo, useState } from 'react';
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
  const [draftNote, setDraftNote] = useState('');

  const notes = useMemo(
    () => note.split('\n').map((item) => item.trim()).filter((item) => item.length > 0),
    [note]
  );

  const commitDraft = () => {
    const trimmed = draftNote.trim();
    if (!trimmed) {
      return;
    }

    onChangeNote([...notes, trimmed].join('\n'));
    setDraftNote('');
  };

  return (
    <div className={styles.container}>
      <label className={styles.label}>Strategy Note</label>
      <div className={styles.inputContainer}>
        <input
          type="text"
          className={styles.input}
          placeholder="Type a focus point and press Enter"
          value={draftNote}
          onChange={(e) => setDraftNote(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') {
              return;
            }

            e.preventDefault();
            commitDraft();
          }}
        />
      </div>

      {notes.length > 0 ? (
        <ul className={styles.noteList}>
          {notes.map((item, index) => (
            <li key={`${item}-${index}`} className={styles.noteItem}>
              {item}
            </li>
          ))}
        </ul>
      ) : null}

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
