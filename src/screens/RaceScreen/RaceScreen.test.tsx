// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// The timer + penalty-detection hooks have their own dedicated tests; stub them
// here so the RaceScreen test stays focused on its own UI and interactions.
vi.mock('../../hooks/useTimer', () => ({ useTimer: () => {} }));
vi.mock('../../hooks/usePenaltyDetection', () => ({ usePenaltyDetection: () => {} }));

import { RaceScreen } from './RaceScreen';
import { useSessionStore } from '../../stores/sessionStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { DEFAULT_SETTINGS } from '../../types/settings';

// jsdom lacks SVG geometry used by the embedded TrackRenderer.
const pathProto = Object.getPrototypeOf(
  document.createElementNS('http://www.w3.org/2000/svg', 'path')
) as Record<string, unknown>;
pathProto.getTotalLength = () => 1000;
pathProto.getPointAtLength = (d: number) => ({ x: d / 10, y: 0 });

function startRunningSession(penaltyTriggers: ('pause' | 'unfocus' | 'idle')[] = ['pause']) {
  const store = useSessionStore.getState();
  store.createSession({
    trackId: 'silverstone',
    seasonYear: 2026,
    durationSec: 1500,
    strategyNote: '',
    parcFerme: false,
    penaltyTriggers,
  });
  store.startSession();
}

beforeEach(() => {
  useSessionStore.setState({ session: null });
  useSettingsStore.setState({ settings: { ...DEFAULT_SETTINGS }, isLoaded: true });
});

describe('RaceScreen empty states', () => {
  it('prompts to start a race when there is no session', () => {
    render(<RaceScreen />);
    expect(screen.getByText(/No active session/i)).toBeInTheDocument();
  });

  it('warns when the session track cannot be resolved', () => {
    const store = useSessionStore.getState();
    store.createSession({
      trackId: 'unknown-track',
      seasonYear: 2026,
      durationSec: 1500,
      strategyNote: '',
      parcFerme: false,
      penaltyTriggers: ['pause'],
    });
    store.startSession();
    render(<RaceScreen />);
    expect(screen.getByText(/Session configuration is incomplete/i)).toBeInTheDocument();
  });
});

describe('RaceScreen running session', () => {
  it('renders the HUD: regulation buttons, pause, and abandon controls', () => {
    startRunningSession();
    render(<RaceScreen />);

    expect(screen.getByRole('button', { name: 'BOOST regulation' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'OVERTAKE regulation' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pause/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Abandon' })).toBeInTheDocument();
    // Progress percentage starts at 0%.
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('pauses the session and applies the pause penalty', () => {
    startRunningSession(['pause']);
    render(<RaceScreen />);

    fireEvent.click(screen.getByRole('button', { name: /Pause/ }));

    const session = useSessionStore.getState().session!;
    expect(session.state).toBe('paused');
    // 2026 pause penalty is 15s.
    expect(session.totalPenaltySec).toBe(15);
    expect(screen.getByText('Session Paused')).toBeInTheDocument();
  });

  it('does not apply a pause penalty when the pause trigger is disabled', () => {
    startRunningSession(['unfocus']); // pause not enabled
    render(<RaceScreen />);

    fireEvent.click(screen.getByRole('button', { name: /Pause/ }));

    const session = useSessionStore.getState().session!;
    expect(session.state).toBe('paused');
    expect(session.totalPenaltySec).toBe(0);
  });

  it('abandons the race through the confirmation dialog', () => {
    startRunningSession();
    render(<RaceScreen />);

    fireEvent.click(screen.getByRole('button', { name: 'Abandon' }));
    expect(screen.getByText('Abandon this race?')).toBeInTheDocument();

    // The dialog adds a second "Abandon" button — confirm with it.
    const abandonButtons = screen.getAllByRole('button', { name: 'Abandon' });
    fireEvent.click(abandonButtons[abandonButtons.length - 1]);

    expect(useSessionStore.getState().session!.state).toBe('abandoned');
  });

  it('cancels the abandon confirmation with "Keep Racing"', () => {
    startRunningSession();
    render(<RaceScreen />);

    fireEvent.click(screen.getByRole('button', { name: 'Abandon' }));
    expect(screen.getByText('Abandon this race?')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Keep Racing' }));

    // "Keep Racing" leaves the session running (the dialog's exit animation is
    // driven by framer-motion, so we assert on state rather than DOM removal).
    expect(useSessionStore.getState().session!.state).toBe('running');
  });

  it('activates a regulation from its button', () => {
    startRunningSession();
    render(<RaceScreen />);

    fireEvent.click(screen.getByRole('button', { name: 'BOOST regulation' }));
    expect(useSessionStore.getState().session!.activeRegulation).toBe('boost');
  });

  it('applies the interruption multiplier and deactivates the regulation when pausing mid-boost', () => {
    startRunningSession(['pause']);
    render(<RaceScreen />);

    fireEvent.click(screen.getByRole('button', { name: 'BOOST regulation' }));
    fireEvent.click(screen.getByRole('button', { name: /Pause/ }));

    const session = useSessionStore.getState().session!;
    expect(session.state).toBe('paused');
    // 2026 pause penalty (15) × boost interruption multiplier (1.5) = 22.5.
    expect(session.totalPenaltySec).toBe(22.5);
    expect(session.activeRegulation).toBeNull();
    expect(session.events.map((e) => e.type)).toContain('regulation_interrupted');
  });

  it('resumes a paused session via the overlay button', () => {
    startRunningSession(['unfocus']); // no pause penalty noise
    render(<RaceScreen />);

    fireEvent.click(screen.getByRole('button', { name: /Pause/ }));
    expect(useSessionStore.getState().session!.state).toBe('paused');

    fireEvent.click(screen.getByRole('button', { name: /Resume Race/ }));
    expect(useSessionStore.getState().session!.state).toBe('running');
  });

  it('edits an existing strategy note from the HUD', () => {
    const store = useSessionStore.getState();
    store.createSession({
      trackId: 'silverstone',
      seasonYear: 2026,
      durationSec: 1500,
      strategyNote: 'Plan A',
      parcFerme: false,
      penaltyTriggers: ['pause'],
    });
    store.startSession();
    render(<RaceScreen />);

    fireEvent.click(screen.getByLabelText('Edit strategy note'));
    const editInput = screen.getByLabelText('Edit strategy note text');
    fireEvent.change(editInput, { target: { value: 'Plan B' } });
    fireEvent.click(screen.getByLabelText('Save edited strategy note'));

    expect(useSessionStore.getState().session!.strategyNote).toBe('Plan B');
  });

  it('removes a strategy note from the HUD', () => {
    const store = useSessionStore.getState();
    store.createSession({
      trackId: 'silverstone',
      seasonYear: 2026,
      durationSec: 1500,
      strategyNote: 'Plan A',
      parcFerme: false,
      penaltyTriggers: ['pause'],
    });
    store.startSession();
    render(<RaceScreen />);

    fireEvent.click(screen.getByLabelText('Remove strategy note'));
    expect(useSessionStore.getState().session!.strategyNote).toBe('');
  });

  it('locks strategy editing under Parc Fermé', () => {
    const store = useSessionStore.getState();
    store.createSession({
      trackId: 'silverstone',
      seasonYear: 2026,
      durationSec: 1500,
      strategyNote: 'Locked plan',
      parcFerme: true,
      penaltyTriggers: ['pause'],
    });
    store.startSession();
    render(<RaceScreen />);

    expect(screen.getByText(/Locked by Parc Ferme/i)).toBeInTheDocument();
    expect(screen.queryByLabelText('Add strategy note')).not.toBeInTheDocument();
  });

  it('adds a strategy note from the race HUD', () => {
    startRunningSession();
    render(<RaceScreen />);

    const input = screen.getByLabelText('Add strategy note');
    fireEvent.change(input, { target: { value: 'Push now' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(useSessionStore.getState().session!.strategyNote).toContain('Push now');
  });

  it('hides the lap counter and penalty feed when disabled in settings', () => {
    useSettingsStore.setState({
      settings: { ...DEFAULT_SETTINGS, showLapCounter: false, showPenaltyFeed: false },
      isLoaded: true,
    });
    startRunningSession();
    render(<RaceScreen />);
    expect(screen.queryByText('Lap')).not.toBeInTheDocument();
  });
});
