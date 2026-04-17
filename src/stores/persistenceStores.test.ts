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

  it('writes settings on update', async () => {
    await useSettingsStore.getState().updateSettings({ defaultSeasonYear: 2025 });

    expect(writeDataMock).toHaveBeenCalledTimes(1);
    expect(writeDataMock).toHaveBeenCalledWith(
      'settings.json',
      expect.objectContaining({ defaultSeasonYear: 2025 })
    );
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
});
