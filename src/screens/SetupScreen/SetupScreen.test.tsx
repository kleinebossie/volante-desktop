// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../utils/storage', () => ({
  readData: vi.fn().mockResolvedValue(null),
  writeData: vi.fn().mockResolvedValue(undefined),
}));

import { SetupScreen } from './SetupScreen';
import { useSessionStore } from '../../stores/sessionStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useHistoryStore } from '../../stores/historyStore';
import { DEFAULT_SETTINGS } from '../../types/settings';
import type { Session } from '../../types/session';

function pastSession(id: string, state: Session['state']): Session {
  return {
    id,
    createdAt: Date.UTC(2026, 0, 1),
    state,
    selectedTrackId: 'monaco',
    seasonYear: 2026,
    targetDurationSec: 1500,
    strategyNote: '',
    parcFermeEnabled: false,
    elapsedWallTimeSec: 1500,
    effectiveProgressSec: 1500,
    currentPaceMultiplier: 1,
    lapsCompleted: 20,
    totalPenaltySec: 0,
    activeRegulation: null,
    regulationEndTime: null,
    cooldowns: { boost: 0, overtake: 0, drs: 0 },
    usageCounts: { boost: 0, overtake: 0, drs: 0 },
    enabledPenaltyTriggers: ['pause'],
    events: [],
    completedAt: Date.UTC(2026, 0, 1) + 1500000,
  };
}

beforeEach(() => {
  useSessionStore.setState({ session: null });
  useSettingsStore.setState({ settings: { ...DEFAULT_SETTINGS }, isLoaded: true });
  useHistoryStore.setState({ sessions: [], isLoaded: true });
});

describe('SetupScreen', () => {
  it('disables START RACE until a track is selected', () => {
    render(<SetupScreen />);
    expect(screen.getByRole('button', { name: /START RACE/ })).toBeDisabled();
  });

  it('starts a running session when a track is selected and START is clicked', () => {
    render(<SetupScreen />);

    fireEvent.click(screen.getByText('Circuit de Monaco').closest('button')!);

    const startButton = screen.getByRole('button', { name: /START RACE/ });
    expect(startButton).not.toBeDisabled();

    fireEvent.click(startButton);

    const session = useSessionStore.getState().session!;
    expect(session.state).toBe('running');
    expect(session.selectedTrackId).toBe('monaco');
    expect(session.targetDurationSec).toBe(DEFAULT_SETTINGS.defaultDurationMin * 60);
  });

  it('opens the settings modal', () => {
    render(<SetupScreen />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Settings/ }));
    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
  });

  it('changes the selected season', () => {
    render(<SetupScreen />);
    const select = screen.getByLabelText('Season') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: '2025' } });
    expect(select.value).toBe('2025');
  });

  it('toggles a penalty trigger', () => {
    render(<SetupScreen />);
    const idle = screen.getByLabelText('Idle') as HTMLInputElement;
    expect(idle.checked).toBe(false);
    fireEvent.click(idle);
    expect(idle.checked).toBe(true);
  });

  it('lists recent sessions from history', () => {
    useHistoryStore.setState({
      sessions: [pastSession('h1', 'completed'), pastSession('h2', 'abandoned')],
      isLoaded: true,
    });
    render(<SetupScreen />);
    expect(screen.getByText('Recent Sessions')).toBeInTheDocument();
    expect(screen.getByText(/Completed/)).toBeInTheDocument();
    expect(screen.getByText(/Abandoned/)).toBeInTheDocument();
  });

  it('restores the form from an existing setup session (Race Again flow)', () => {
    const store = useSessionStore.getState();
    store.createSession({
      trackId: 'monaco',
      seasonYear: 2025,
      durationSec: 1800,
      strategyNote: 'Carry over',
      parcFerme: true,
      penaltyTriggers: ['idle'],
    });
    // Session stays in 'setup' state — SetupScreen should hydrate from it.
    render(<SetupScreen />);

    // The track is pre-selected, so START is enabled immediately.
    expect(screen.getByRole('button', { name: /START RACE/ })).not.toBeDisabled();
    expect((screen.getByLabelText('Season') as HTMLSelectElement).value).toBe('2025');
    expect((screen.getByLabelText('Duration in minutes') as HTMLInputElement).value).toBe('30');
    expect(screen.getByText('Carry over')).toBeInTheDocument();
  });

  it('does not start a race when START is clicked with no track', () => {
    render(<SetupScreen />);
    // Force-click the disabled button's handler path: it should remain a no-op.
    fireEvent.click(screen.getByRole('button', { name: /START RACE/ }));
    expect(useSessionStore.getState().session).toBeNull();
  });
});
