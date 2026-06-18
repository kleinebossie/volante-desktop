import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS } from '../types/settings';
import type { Session } from '../types/session';

const readDataMock = vi.fn();
const writeDataMock = vi.fn();

vi.mock('../utils/storage', () => ({
  readData: (...args: unknown[]) => readDataMock(...args),
  writeData: (...args: unknown[]) => writeDataMock(...args),
}));

import { useSettingsStore } from './settingsStore';
import { useHistoryStore } from './historyStore';

function makeSession(id: string, state: Session['state']): Session {
  return {
    id,
    createdAt: 1,
    state,
    selectedTrackId: 'silverstone',
    seasonYear: 2026,
    targetDurationSec: 1500,
    strategyNote: '',
    parcFermeEnabled: false,
    elapsedWallTimeSec: 900,
    effectiveProgressSec: 900,
    currentPaceMultiplier: 1,
    lapsCompleted: 3,
    totalPenaltySec: 0,
    activeRegulation: null,
    regulationEndTime: null,
    cooldowns: { boost: 0, overtake: 0, drs: 0 },
    usageCounts: { boost: 0, overtake: 0, drs: 0 },
    enabledPenaltyTriggers: ['pause'],
    events: [],
    completedAt: 2,
  };
}

describe('settingsStore persistence', () => {
  beforeEach(() => {
    readDataMock.mockReset();
    writeDataMock.mockReset();
    useSettingsStore.setState({ settings: { ...DEFAULT_SETTINGS }, isLoaded: false });
    useHistoryStore.setState({ sessions: [], isLoaded: false });
  });

  it('loads saved settings and keeps defaults for missing fields', async () => {
    readDataMock.mockResolvedValue({
      defaultDurationMin: 50,
      showLapCounter: false,
    });

    await useSettingsStore.getState().loadSettings();
    const state = useSettingsStore.getState();

    expect(state.isLoaded).toBe(true);
    expect(state.settings.defaultDurationMin).toBe(50);
    expect(state.settings.showLapCounter).toBe(false);
    expect(state.settings.defaultSeasonYear).toBe(DEFAULT_SETTINGS.defaultSeasonYear);
  });

  it('keeps defaults and marks loaded when no settings file exists', async () => {
    readDataMock.mockResolvedValue(null);

    await useSettingsStore.getState().loadSettings();
    const state = useSettingsStore.getState();

    expect(state.isLoaded).toBe(true);
    expect(state.settings).toEqual(DEFAULT_SETTINGS);
  });

  it('writes settings on update', async () => {
    await useSettingsStore.getState().updateSettings({ defaultSeasonYear: 2025 });

    expect(writeDataMock).toHaveBeenCalledTimes(1);
    expect(writeDataMock).toHaveBeenCalledWith(
      'settings.json',
      expect.objectContaining({ defaultSeasonYear: 2025 })
    );
  });

  it('merges partial updates over existing settings', async () => {
    await useSettingsStore.getState().updateSettings({ defaultDurationMin: 45 });
    await useSettingsStore.getState().updateSettings({ soundEnabled: false });

    const state = useSettingsStore.getState();
    expect(state.settings.defaultDurationMin).toBe(45);
    expect(state.settings.soundEnabled).toBe(false);
    // Unrelated fields keep their default values.
    expect(state.settings.defaultSeasonYear).toBe(DEFAULT_SETTINGS.defaultSeasonYear);
  });

  it('resets settings back to defaults and persists them', async () => {
    await useSettingsStore.getState().updateSettings({ defaultDurationMin: 99 });
    writeDataMock.mockClear();

    await useSettingsStore.getState().resetSettings();

    const state = useSettingsStore.getState();
    expect(state.settings).toEqual(DEFAULT_SETTINGS);
    expect(writeDataMock).toHaveBeenCalledWith('settings.json', DEFAULT_SETTINGS);
  });
});

describe('historyStore persistence', () => {
  beforeEach(() => {
    readDataMock.mockReset();
    writeDataMock.mockReset();
    useHistoryStore.setState({ sessions: [], isLoaded: false });
  });

  it('loads saved history sessions', async () => {
    const saved = [makeSession('s1', 'completed')];
    readDataMock.mockResolvedValue(saved);

    await useHistoryStore.getState().loadHistory();
    const state = useHistoryStore.getState();

    expect(state.isLoaded).toBe(true);
    expect(state.sessions).toHaveLength(1);
    expect(state.sessions[0].id).toBe('s1');
  });

  it('starts empty and marks loaded when no history file exists', async () => {
    readDataMock.mockResolvedValue(null);

    await useHistoryStore.getState().loadHistory();
    const state = useHistoryStore.getState();

    expect(state.isLoaded).toBe(true);
    expect(state.sessions).toEqual([]);
  });

  it('treats an empty saved array as no history', async () => {
    readDataMock.mockResolvedValue([]);

    await useHistoryStore.getState().loadHistory();
    const state = useHistoryStore.getState();

    expect(state.isLoaded).toBe(true);
    expect(state.sessions).toEqual([]);
  });

  it('prepends a new session and persists the list', async () => {
    const existing = makeSession('old', 'completed');
    useHistoryStore.setState({ sessions: [existing], isLoaded: true });

    const fresh = makeSession('new', 'completed');
    await useHistoryStore.getState().addSession(fresh);

    const state = useHistoryStore.getState();
    expect(state.sessions.map((s) => s.id)).toEqual(['new', 'old']);
    expect(writeDataMock).toHaveBeenCalledWith('history.json', state.sessions);
  });

  it('moves an existing session to the front when re-added', async () => {
    const a = makeSession('a', 'completed');
    const b = makeSession('b', 'completed');
    const c = makeSession('c', 'completed');
    useHistoryStore.setState({ sessions: [a, b, c], isLoaded: true });

    await useHistoryStore.getState().addSession(makeSession('c', 'abandoned'));

    const state = useHistoryStore.getState();
    expect(state.sessions.map((s) => s.id)).toEqual(['c', 'a', 'b']);
    expect(state.sessions).toHaveLength(3);
    expect(state.sessions[0].state).toBe('abandoned');
  });

  it('caps history at 100 entries, pruning the oldest', async () => {
    const existing = Array.from({ length: 100 }, (_, i) => makeSession(`s${i}`, 'completed'));
    useHistoryStore.setState({ sessions: existing, isLoaded: true });

    await useHistoryStore.getState().addSession(makeSession('newest', 'completed'));

    const state = useHistoryStore.getState();
    expect(state.sessions).toHaveLength(100);
    expect(state.sessions[0].id).toBe('newest');
    // The previously-oldest entry (s99) has been pruned.
    expect(state.sessions.some((s) => s.id === 's99')).toBe(false);
  });

  it('deduplicates by session id when adding', async () => {
    const existing = makeSession('session-1', 'completed');
    useHistoryStore.setState({ sessions: [existing], isLoaded: true });

    const replacement = makeSession('session-1', 'abandoned');
    await useHistoryStore.getState().addSession(replacement);

    const state = useHistoryStore.getState();
    expect(state.sessions).toHaveLength(1);
    expect(state.sessions[0].state).toBe('abandoned');
    expect(writeDataMock).toHaveBeenCalledTimes(1);
  });

  it('clears history in memory and on disk', async () => {
    useHistoryStore.setState({
      sessions: [makeSession('x', 'completed')],
      isLoaded: true,
    });

    await useHistoryStore.getState().clearHistory();

    expect(useHistoryStore.getState().sessions).toEqual([]);
    expect(writeDataMock).toHaveBeenCalledWith('history.json', []);
  });
});
