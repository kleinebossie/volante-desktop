
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
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingDraft, setEditingDraft] = useState('');

  const notes = useMemo(
    () => note.split('\n').map((item) => item.trim()).filter((item) => item.length > 0),
    [note]
  );

  const commitDraft = () => {
    const trimmed = draftNote.trim();
    if (!trimmed) {
      return;
    }

    // Programmatically enforce the 50 character limit per note
    const truncated = trimmed.slice(0, 50);
    onChangeNote([...notes, truncated].join('\n'));
    setDraftNote('');
  };

  const handleRemove = (index: number) => {
    const updated = notes.filter((_, noteIndex) => noteIndex !== index);
    onChangeNote(updated.join('\n'));

    if (editingIndex === index) {
      setEditingIndex(null);
      setEditingDraft('');
      return;
    }

    if (editingIndex !== null && index < editingIndex) {
      setEditingIndex(editingIndex - 1);
    }
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditingDraft(notes[index] ?? '');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingDraft('');
  };

  const handleSaveEdit = () => {
    if (editingIndex === null) {
      return;
    }

    const trimmed = editingDraft.trim();
    if (!trimmed) {
      return;
    }

    const nextNotes = [...notes];
    // Programmatically enforce the 50 character limit per note
    nextNotes[editingIndex] = trimmed.slice(0, 50);
    onChangeNote(nextNotes.join('\n'));
    setEditingIndex(null);
    setEditingDraft('');
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
          maxLength={50}
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
              {editingIndex === index ? (
                <div className={styles.strategyEditRow}>
                  <input
                    type="text"
                    className={styles.strategyEditInput}
                    value={editingDraft}
                    onChange={(e) => setEditingDraft(e.target.value)}
                    maxLength={50}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveEdit();
                      }

                      if (e.key === 'Escape') {
                        e.preventDefault();
                        handleCancelEdit();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className={styles.noteActionButton}
                    onClick={handleSaveEdit}
                    aria-label="Save edited strategy note"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className={styles.noteActionButton}
                    onClick={handleCancelEdit}
                    aria-label="Cancel editing strategy note"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <span className={styles.noteItemText}>{item}</span>
                  <span className={styles.noteItemActions}>
                    <button
                      type="button"
                      className={styles.noteActionButton}
                      onClick={() => handleStartEdit(index)}
                      aria-label="Edit strategy note"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className={`${styles.noteActionButton} ${styles.noteRemoveButton}`}
                      onClick={() => handleRemove(index)}
                      aria-label="Remove strategy note"
                    >
                      ✕
                    </button>
                  </span>
                </>
              )}
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
