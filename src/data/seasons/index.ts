import type { SeasonRuleset } from '../../types/regulations';
import { season2025 } from './season2025';
import { season2026 } from './season2026';

export const SEASONS: SeasonRuleset[] = [season2026, season2025];

export function getSeasonByYear(year: number): SeasonRuleset | undefined {
  return SEASONS.find(s => s.seasonYear === year);
}

export const DEFAULT_SEASON_YEAR = 2026;
