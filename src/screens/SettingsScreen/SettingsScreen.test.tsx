// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../utils/storage', () => ({
  readData: vi.fn().mockResolvedValue(null),
  writeData: vi.fn().mockResolvedValue(undefined),
}));

import { SettingsScreen } from './SettingsScreen';
import { useSettingsStore } from '../../stores/settingsStore';
import { DEFAULT_SETTINGS } from '../../types/settings';

function renderSettings(isOpen = true) {
  const onClose = vi.fn();
  const utils = render(<SettingsScreen isOpen={isOpen} onClose={onClose} />);
  return { ...utils, onClose };
}

const settings = () => useSettingsStore.getState().settings;

beforeEach(() => {
  useSettingsStore.setState({ settings: { ...DEFAULT_SETTINGS } });
});

describe('SettingsScreen', () => {
  it('renders nothing when closed', () => {
    const { container } = renderSettings(false);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a settings dialog when open', () => {
    renderSettings(true);
    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
  });

  it('closes via the Close button', () => {
    const { onClose } = renderSettings(true);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when the backdrop is clicked but not when the modal body is clicked', () => {
    const { onClose } = renderSettings(true);

    // Clicking inside the modal (the heading) must not close.
    fireEvent.click(screen.getByRole('heading', { name: 'Settings' }));
    expect(onClose).not.toHaveBeenCalled();

    // Clicking the backdrop itself closes.
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('persists a valid default duration on blur', () => {
    renderSettings(true);
    const input = screen.getByLabelText('Default session duration (minutes)');
    fireEvent.change(input, { target: { value: '45' } });
    fireEvent.blur(input);
    expect(settings().defaultDurationMin).toBe(45);
  });

  it('clamps an out-of-range duration on blur', () => {
    renderSettings(true);
    const input = screen.getByLabelText('Default session duration (minutes)');
    fireEvent.change(input, { target: { value: '5000' } });
    fireEvent.blur(input);
    expect(settings().defaultDurationMin).toBe(600); // DURATION_MAX
  });

  it('shows a validation error for an out-of-range duration while typing', () => {
    renderSettings(true);
    const input = screen.getByLabelText('Default session duration (minutes)');
    fireEvent.change(input, { target: { value: '2' } }); // below the minimum
    expect(screen.getByRole('alert')).toHaveTextContent(/between 5 and 600/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('changes the default season', () => {
    renderSettings(true);
    fireEvent.change(screen.getByLabelText('Default season ruleset'), {
      target: { value: '2025' },
    });
    expect(settings().defaultSeasonYear).toBe(2025);
  });

  it('toggles the parc ferme default', () => {
    renderSettings(true);
    const checkbox = screen.getByLabelText('Parc Ferme enabled by default');
    fireEvent.click(checkbox);
    expect(settings().parcFermeDefault).toBe(true);
  });

  it('toggles a penalty default', () => {
    renderSettings(true);
    // Idle is off by default; turning it on adds it.
    fireEvent.click(screen.getByLabelText('Idle penalty'));
    expect(settings().defaultPenaltyTriggers).toContain('idle');
  });

  it('toggles display options', () => {
    renderSettings(true);
    fireEvent.click(screen.getByLabelText('Show lap counter'));
    expect(settings().showLapCounter).toBe(false);
    fireEvent.click(screen.getByLabelText('Show penalty feed'));
    expect(settings().showPenaltyFeed).toBe(false);
  });

  it('switches the regulation duration mode to absolute', () => {
    renderSettings(true);
    fireEvent.click(screen.getByRole('button', { name: 'Absolute (Min)' }));
    expect(settings().regulationDurationType).toBe('absolute');
  });

  it('updates the idle threshold on blur', () => {
    renderSettings(true);
    const input = screen.getByLabelText('Idle threshold (seconds)');
    fireEvent.change(input, { target: { value: '300' } });
    fireEvent.blur(input);
    expect(settings().idleThresholdSec).toBe(300);
  });

  it('toggles a favorite track', () => {
    renderSettings(true);
    fireEvent.click(screen.getByLabelText(/Circuit de Monaco/));
    expect(settings().favoriteTrackIds).toContain('monaco');
  });

  it('shows a validation error for an out-of-range idle threshold while typing', () => {
    renderSettings(true);
    const input = screen.getByLabelText('Idle threshold (seconds)');
    fireEvent.change(input, { target: { value: '5' } }); // below the minimum of 10
    expect(screen.getByText(/between 10 and 3600/i)).toBeInTheDocument();
  });

  it('edits absolute boost duration after switching to absolute mode', () => {
    renderSettings(true);
    fireEvent.click(screen.getByRole('button', { name: 'Absolute (Min)' }));

    // Default boostAbsoluteSec is 120 → the boost minutes input shows "2".
    const boostMin = screen.getByDisplayValue('2');
    fireEvent.change(boostMin, { target: { value: '3' } });
    fireEvent.blur(boostMin);

    // 3 minutes, 0 seconds = 180s.
    expect(settings().boostAbsoluteSec).toBe(180);
  });

  it('raises overtake percent to keep boost ≤ overtake when boost is set higher', () => {
    renderSettings(true);
    // Default relative mode: boost 5%, overtake 10%. Raise boost to 20%.
    const boostInput = screen.getAllByDisplayValue('5')[0];
    fireEvent.change(boostInput, { target: { value: '20' } });
    fireEvent.blur(boostInput);
    expect(settings().boostRelativePercent).toBe(20);
    expect(settings().overtakeRelativePercent).toBe(20); // pulled up to match
  });
});
