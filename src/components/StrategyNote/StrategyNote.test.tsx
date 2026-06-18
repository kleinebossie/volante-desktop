// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { StrategyNote } from './StrategyNote';

function setup(note = '') {
  const onChangeNote = vi.fn();
  const onChangeParcFerme = vi.fn();
  const utils = render(
    <StrategyNote
      note={note}
      onChangeNote={onChangeNote}
      parcFerme={false}
      onChangeParcFerme={onChangeParcFerme}
    />
  );
  return { ...utils, onChangeNote, onChangeParcFerme };
}

function addInput() {
  return screen.getByLabelText('Strategy Note');
}

describe('StrategyNote', () => {
  it('renders existing notes split from the newline-delimited prop', () => {
    setup('Brake late\nTrust the line');
    expect(screen.getByText('Brake late')).toBeInTheDocument();
    expect(screen.getByText('Trust the line')).toBeInTheDocument();
  });

  it('commits a new note on Enter', () => {
    const { onChangeNote } = setup('Existing');
    const input = addInput();
    fireEvent.change(input, { target: { value: 'New point' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChangeNote).toHaveBeenCalledWith('Existing\nNew point');
  });

  it('ignores an empty / whitespace-only note', () => {
    const { onChangeNote } = setup('Existing');
    const input = addInput();
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChangeNote).not.toHaveBeenCalled();
  });

  it('does not commit on non-Enter keys', () => {
    const { onChangeNote } = setup('');
    const input = addInput();
    fireEvent.change(input, { target: { value: 'typing' } });
    fireEvent.keyDown(input, { key: 'a' });
    expect(onChangeNote).not.toHaveBeenCalled();
  });

  it('truncates a committed note to 50 characters', () => {
    const { onChangeNote } = setup('');
    const input = addInput();
    const long = 'x'.repeat(80);
    fireEvent.change(input, { target: { value: long } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChangeNote).toHaveBeenCalledWith('x'.repeat(50));
  });

  it('removes a note', () => {
    const { onChangeNote } = setup('First\nSecond');
    const removeButtons = screen.getAllByLabelText('Remove strategy note');
    fireEvent.click(removeButtons[0]); // remove "First"
    expect(onChangeNote).toHaveBeenCalledWith('Second');
  });

  it('edits a note inline and saves it', () => {
    const { onChangeNote } = setup('First\nSecond');
    fireEvent.click(screen.getAllByLabelText('Edit strategy note')[1]); // edit "Second"

    const editInput = screen.getByLabelText('Edit strategy note text');
    fireEvent.change(editInput, { target: { value: 'Second edited' } });
    fireEvent.click(screen.getByLabelText('Save edited strategy note'));

    expect(onChangeNote).toHaveBeenCalledWith('First\nSecond edited');
  });

  it('cancels editing without changing the note', () => {
    const { onChangeNote } = setup('First');
    fireEvent.click(screen.getByLabelText('Edit strategy note'));
    fireEvent.change(screen.getByLabelText('Edit strategy note text'), {
      target: { value: 'changed' },
    });
    fireEvent.click(screen.getByLabelText('Cancel editing strategy note'));

    expect(onChangeNote).not.toHaveBeenCalled();
    // Original text is shown again (edit row closed).
    expect(screen.getByText('First')).toBeInTheDocument();
  });

  it('saves an edit on Enter and cancels on Escape', () => {
    const { onChangeNote } = setup('First');

    // Enter saves.
    fireEvent.click(screen.getByLabelText('Edit strategy note'));
    fireEvent.change(screen.getByLabelText('Edit strategy note text'), {
      target: { value: 'Updated' },
    });
    fireEvent.keyDown(screen.getByLabelText('Edit strategy note text'), { key: 'Enter' });
    expect(onChangeNote).toHaveBeenCalledWith('Updated');

    onChangeNote.mockClear();

    // Escape cancels.
    fireEvent.click(screen.getByLabelText('Edit strategy note'));
    fireEvent.keyDown(screen.getByLabelText('Edit strategy note text'), { key: 'Escape' });
    expect(onChangeNote).not.toHaveBeenCalled();
  });

  it('toggles the parc ferme checkbox', () => {
    const { onChangeParcFerme } = setup('');
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(onChangeParcFerme).toHaveBeenCalledWith(true);
  });
});
