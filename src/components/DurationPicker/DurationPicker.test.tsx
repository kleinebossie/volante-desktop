// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DurationPicker } from './DurationPicker';

function setup(durationMin = 25) {
  const onChange = vi.fn();
  const utils = render(<DurationPicker durationMin={durationMin} onChange={onChange} />);
  return { ...utils, onChange };
}

const input = () => screen.getByLabelText('Duration in minutes') as HTMLInputElement;

describe('DurationPicker', () => {
  it('shows the current duration', () => {
    setup(40);
    expect(input().value).toBe('40');
  });

  it('decrements by the step', () => {
    const { onChange } = setup(25);
    fireEvent.click(screen.getByLabelText('Decrease duration'));
    expect(onChange).toHaveBeenCalledWith(20);
  });

  it('increments by the step', () => {
    const { onChange } = setup(25);
    fireEvent.click(screen.getByLabelText('Increase duration'));
    expect(onChange).toHaveBeenCalledWith(30);
  });

  it('disables decrement at the minimum and increment at the maximum', () => {
    const { unmount } = setup(5);
    expect(screen.getByLabelText('Decrease duration')).toBeDisabled();
    unmount();

    setup(600);
    expect(screen.getByLabelText('Increase duration')).toBeDisabled();
  });

  it('accepts a valid in-range typed value', () => {
    const { onChange } = setup(25);
    fireEvent.change(input(), { target: { value: '45' } });
    expect(onChange).toHaveBeenCalledWith(45);
  });

  it('does not call onChange while the field is being cleared', () => {
    const { onChange } = setup(25);
    fireEvent.change(input(), { target: { value: '' } });
    expect(onChange).not.toHaveBeenCalled();
    expect(input().value).toBe('');
  });

  it('ignores non-numeric input', () => {
    const { onChange } = setup(25);
    fireEvent.change(input(), { target: { value: '4a' } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('resets an empty field to the minimum on blur', () => {
    const { onChange } = setup(25);
    fireEvent.change(input(), { target: { value: '' } });
    fireEvent.blur(input());
    expect(onChange).toHaveBeenCalledWith(5);
    expect(input().value).toBe('5');
  });

  it('clamps an out-of-range value on blur', () => {
    const { onChange } = setup(25);
    fireEvent.change(input(), { target: { value: '999' } });
    fireEvent.blur(input());
    expect(onChange).toHaveBeenLastCalledWith(600);
    expect(input().value).toBe('600');
  });

  it('commits and blurs on Enter', () => {
    const { onChange } = setup(25);
    fireEvent.change(input(), { target: { value: '3' } }); // below MIN
    fireEvent.keyDown(input(), { key: 'Enter' });
    expect(onChange).toHaveBeenLastCalledWith(5); // clamped up to MIN
    expect(input().value).toBe('5');
  });

  it('selects the text on focus', () => {
    setup(25);
    const el = input();
    const selectSpy = vi.spyOn(el, 'select');
    fireEvent.focus(el);
    expect(selectSpy).toHaveBeenCalled();
  });
});
