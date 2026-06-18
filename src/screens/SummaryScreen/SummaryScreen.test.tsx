// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../utils/storage', () => ({
  readData: vi.fn().mockResolvedValue(null),
  writeData: vi.fn().mockResolvedValue(undefined),
}));

import { SummaryScreen } from './SummaryScreen';
import { useSessionStore } from '../../stores/sessionStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useHistoryStore } from '../../stores/historyStore';
import { DEFAULT_SETTINGS } from '../../types/settings';
import type { Session, SessionEvent, SessionState } from '../../types/session';

let eventSeq = 0;
function ev(
  type: SessionEvent['type'],
  timestamp: number,
  metadata: Record<string, unknown> = {}
): SessionEvent {
  eventSeq += 1;
  return { id: `ev${eventSeq}`, timestamp, type, metadata };
}

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: 'sum-1',
    createdAt: 1000,
    state: 'completed' as SessionState,
    selectedTrackId: 'silverstone',
    seasonYear: 2026,
    targetDurationSec: 1500,
    strategyNote: '',
    parcFermeEnabled: false,
    elapsedWallTimeSec: 1500,
    effectiveProgressSec: 1500,
    currentPaceMultiplier: 1,
    lapsCompleted: 16,
    totalPenaltySec: 0,
    activeRegulation: null,
    regulationEndTime: null,
    cooldowns: { boost: 0, overtake: 0, drs: 0 },
    usageCounts: { boost: 0, overtake: 0, drs: 0 },
    enabledPenaltyTriggers: ['pause'],
    events: [],
    completedAt: 60000,
    ...overrides,
  };
}

beforeEach(() => {
  useSessionStore.setState({ session: null });
  useSettingsStore.setState({ settings: { ...DEFAULT_SETTINGS } });
  useHistoryStore.setState({ sessions: [], isLoaded: true });
});

describe('SummaryScreen empty states', () => {
  it('prompts to start a race when there is no session', () => {
    render(<SummaryScreen />);
    expect(screen.getByText(/No finished session found/i)).toBeInTheDocument();
  });

  it('explains the summary is unavailable for an unfinished session', () => {
    useSessionStore.setState({ session: makeSession({ state: 'running' }) });
    render(<SummaryScreen />);
    expect(screen.getByText(/available after a session is completed or abandoned/i)).toBeInTheDocument();
  });

  it('shows an error when the track cannot be resolved', () => {
    useSessionStore.setState({ session: makeSession({ selectedTrackId: 'no-such-track' }) });
    render(<SummaryScreen />);
    expect(screen.getByText(/Could not load track or season data/i)).toBeInTheDocument();
  });
});

describe('SummaryScreen finalized session', () => {
  it('renders the complete summary and persists the session to history', () => {
    const session = makeSession({
      strategyNote: 'Brake late\nStay calm',
      events: [
        ev('regulation_activate', 2000, { regulationType: 'boost', paceMultiplier: 1.25, durationSec: 30 }),
        ev('regulation_deactivate', 12000, { regulationType: 'boost' }),
      ],
    });
    useSessionStore.setState({ session });

    render(<SummaryScreen />);

    expect(screen.getByRole('heading', { name: 'Race Complete' })).toBeInTheDocument();
    expect(screen.getByText(/Silverstone Circuit/)).toBeInTheDocument();
    expect(screen.getByText('Regulation Usage')).toBeInTheDocument();
    // Boost was used once.
    expect(screen.getByText(/used 1x/)).toBeInTheDocument();
    // No penalties → clean race hint.
    expect(screen.getByText(/Clean race/i)).toBeInTheDocument();
    // Strategy notes are listed.
    expect(screen.getByText('Brake late')).toBeInTheDocument();
    expect(screen.getByText('Stay calm')).toBeInTheDocument();

    // The finalized session was written to history on mount.
    expect(useHistoryStore.getState().sessions.map((s) => s.id)).toContain('sum-1');
  });

  it('renders the abandoned status and penalty timeline', () => {
    const session = makeSession({
      state: 'abandoned',
      totalPenaltySec: 15,
      events: [ev('penalty_applied', 5000, { trigger: 'pause', penaltySec: 15 })],
    });
    useSessionStore.setState({ session });

    render(<SummaryScreen />);

    expect(screen.getByRole('heading', { name: 'Race Abandoned' })).toBeInTheDocument();
    expect(screen.getByText(/Pause penalty/)).toBeInTheDocument();
    expect(screen.getByText('-15s')).toBeInTheDocument();
    expect(screen.queryByText(/Clean race/i)).not.toBeInTheDocument();
  });

  it('labels an interrupted regulation in the penalty timeline', () => {
    const session = makeSession({
      state: 'abandoned',
      totalPenaltySec: 22,
      events: [
        ev('regulation_activate', 2000, { regulationType: 'boost', paceMultiplier: 1.25, durationSec: 30 }),
        ev('regulation_interrupted', 8000, { regulationType: 'boost', trigger: 'pause', penaltySec: 22 }),
      ],
    });
    useSessionStore.setState({ session });

    render(<SummaryScreen />);

    // The interrupted regulation is named, and counts as a use.
    expect(screen.getByText(/BOOST interrupted/)).toBeInTheDocument();
    expect(screen.getByText('-22s')).toBeInTheDocument();
    expect(screen.getByText(/used 1x/)).toBeInTheDocument();
  });

  it('counts a regulation still active at session end up to completedAt', () => {
    const session = makeSession({
      // Activated but never deactivated before completion.
      events: [
        ev('regulation_activate', 20000, { regulationType: 'boost', paceMultiplier: 1.25, durationSec: 30 }),
      ],
      completedAt: 50000,
    });
    useSessionStore.setState({ session });

    render(<SummaryScreen />);

    // Active time accrues from activation (20s) to completion (50s) = 30s.
    expect(screen.getByText(/used 1x · total 00:30/)).toBeInTheDocument();
  });

  it('shows a placeholder when no strategy note was set', () => {
    useSessionStore.setState({ session: makeSession({ strategyNote: '' }) });
    render(<SummaryScreen />);
    expect(screen.getByText(/No strategy note was set/i)).toBeInTheDocument();
  });

  it('returns to setup when "Back to Setup" is clicked', () => {
    useSessionStore.setState({ session: makeSession() });
    render(<SummaryScreen />);

    fireEvent.click(screen.getByRole('button', { name: 'Back to Setup' }));
    expect(useSessionStore.getState().session).toBeNull();
  });

  it('starts a fresh setup session with the same config on "Race Again"', () => {
    useSessionStore.setState({ session: makeSession({ selectedTrackId: 'monaco', seasonYear: 2025 }) });
    render(<SummaryScreen />);

    fireEvent.click(screen.getByRole('button', { name: 'Race Again' }));

    const next = useSessionStore.getState().session!;
    expect(next.state).toBe('setup');
    expect(next.selectedTrackId).toBe('monaco');
    expect(next.seasonYear).toBe(2025);
  });
});
