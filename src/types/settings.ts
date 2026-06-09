import type { PenaltyTrigger } from './regulations';

export interface UserSettings {
  // Display
  defaultSeasonYear: number;
  favoriteTrackIds: string[];

  // Penalty defaults
  defaultPenaltyTriggers: PenaltyTrigger[];
  idleThresholdSec: number;

  // Session defaults
  defaultDurationMin: number;          // Default timer duration in minutes
  parcFermeDefault: boolean;

  // Audio (future)
  soundEnabled: boolean;

  // UI
  showLapCounter: boolean;
  showPenaltyFeed: boolean;

  // Regulation Durations
  regulationDurationType: 'relative' | 'absolute';
  boostRelativePercent: number;
  boostAbsoluteSec: number;
  overtakeRelativePercent: number;
  overtakeAbsoluteSec: number;
}

export const DEFAULT_SETTINGS: UserSettings = {
  defaultSeasonYear: 2026,
  favoriteTrackIds: [],
  defaultPenaltyTriggers: ['pause', 'unfocus'],
  idleThresholdSec: 120,
  defaultDurationMin: 25,
  parcFermeDefault: false,
  soundEnabled: true,
  showLapCounter: true,
  showPenaltyFeed: true,
  regulationDurationType: 'relative',
  boostRelativePercent: 5,
  boostAbsoluteSec: 120,
  overtakeRelativePercent: 10,
  overtakeAbsoluteSec: 240,
};

