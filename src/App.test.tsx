// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Replace the heavy screen trees with markers so this test focuses purely on
// App's view routing.
vi.mock('./screens/SetupScreen/SetupScreen', () => ({
  SetupScreen: () => <div data-testid="setup-screen" />,
}));
vi.mock('./screens/RaceScreen/RaceScreen', () => ({
  RaceScreen: () => <div data-testid="race-screen" />,
}));
vi.mock('./screens/SummaryScreen/SummaryScreen', () => ({
  SummaryScreen: () => <div data-testid="summary-screen" />,
}));

// Avoid touching the real filesystem during the startup load effect.
vi.mock('./utils/storage', () => ({
  readData: vi.fn().mockResolvedValue(null),
  writeData: vi.fn().mockResolvedValue(undefined),
}));

import App from './App';
import { useSessionStore } from './stores/sessionStore';
import { useSettingsStore } from './stores/settingsStore';
import { useHistoryStore } from './stores/historyStore';
import type { Session, SessionState } from './types/session';

function sessionInState(state: SessionState): Session {
  return {
    id: 's1',
    createdAt: 0,
    state,
    selectedTrackId: 'silverstone',
    seasonYear: 2026,
    targetDurationSec: 1500,
    strategyNote: '',
    parcFermeEnabled: false,
    elapsedWallTimeSec: 0,
    effectiveProgressSec: 0,
    currentPaceMultiplier: 1,
    lapsCompleted: 0,
    totalPenaltySec: 0,
    activeRegulation: null,
    regulationEndTime: null,
    cooldowns: { boost: 0, overtake: 0, drs: 0 },
    usageCounts: { boost: 0, overtake: 0, drs: 0 },
    enabledPenaltyTriggers: ['pause'],
    events: [],
    completedAt: null,
  };
}

beforeEach(() => {
  useSessionStore.setState({ session: null });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('App routing', () => {
  it('shows the setup screen when there is no session', () => {
    render(<App />);
    expect(screen.getByTestId('setup-screen')).toBeInTheDocument();
  });

  it('shows the setup screen while a session is still in setup', () => {
    useSessionStore.setState({ session: sessionInState('setup') });
    render(<App />);
    expect(screen.getByTestId('setup-screen')).toBeInTheDocument();
  });

  it('shows the race screen while running or paused', () => {
    useSessionStore.setState({ session: sessionInState('running') });
    const { unmount } = render(<App />);
    expect(screen.getByTestId('race-screen')).toBeInTheDocument();
    unmount();

    useSessionStore.setState({ session: sessionInState('paused') });
    render(<App />);
    expect(screen.getByTestId('race-screen')).toBeInTheDocument();
  });

  it('shows the summary screen when completed or abandoned', () => {
    useSessionStore.setState({ session: sessionInState('completed') });
    const { unmount } = render(<App />);
    expect(screen.getByTestId('summary-screen')).toBeInTheDocument();
    unmount();

    useSessionStore.setState({ session: sessionInState('abandoned') });
    render(<App />);
    expect(screen.getByTestId('summary-screen')).toBeInTheDocument();
  });

  it('loads settings and history on mount', () => {
    const settingsSpy = vi
      .spyOn(useSettingsStore.getState(), 'loadSettings')
      .mockResolvedValue(undefined);
    const historySpy = vi
      .spyOn(useHistoryStore.getState(), 'loadHistory')
      .mockResolvedValue(undefined);

    render(<App />);

    expect(settingsSpy).toHaveBeenCalledTimes(1);
    expect(historySpy).toHaveBeenCalledTimes(1);
  });
});
