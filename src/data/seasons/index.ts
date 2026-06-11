import type { SeasonRuleset } from '../../types/regulations';
import type { Session } from '../../types/session';
import { useSettingsStore } from '../../stores/settingsStore';
import { season2025 } from './season2025';
import { season2026 } from './season2026';

export const SEASONS: SeasonRuleset[] = [season2026, season2025];

export function getSeasonByYear(year: number, session?: Session): SeasonRuleset | undefined {
  const baseSeason = SEASONS.find(s => s.seasonYear === year);
  if (!baseSeason) return undefined;

  const settings = useSettingsStore.getState().settings;
  const sessionDurationSec = session
    ? session.targetDurationSec
    : settings.defaultDurationMin * 60;

  // Clone regulations to avoid mutating global/static objects
  const regulations = baseSeason.regulations.map((reg) => {
    let durationSec = reg.durationSec;
    let cooldownSec = reg.cooldownSec;
    let maxUsesPerSession = reg.maxUsesPerSession;

    if (reg.type === 'boost' || reg.type === 'drs') {
      maxUsesPerSession = 3;
      if (settings.regulationDurationType === 'relative') {
        durationSec = Math.round((settings.boostRelativePercent / 100) * sessionDurationSec);
      } else {
        durationSec = settings.boostAbsoluteSec;
      }
      cooldownSec = durationSec; // Cooldown same duration as boost/drs duration
    } else if (reg.type === 'overtake') {
      maxUsesPerSession = 1;
      if (settings.regulationDurationType === 'relative') {
        durationSec = Math.round((settings.overtakeRelativePercent / 100) * sessionDurationSec);
      } else {
        durationSec = settings.overtakeAbsoluteSec;
      }
    }

    return {
      ...reg,
      durationSec,
      cooldownSec,
      maxUsesPerSession,
    };
  });

  // Safety clamp: Boost/DRS duration must not exceed Overtake duration if both are present
  const boostReg = regulations.find((r) => r.type === 'boost' || r.type === 'drs');
  const overtakeReg = regulations.find((r) => r.type === 'overtake');
  if (boostReg && overtakeReg && boostReg.durationSec > overtakeReg.durationSec) {
    boostReg.durationSec = overtakeReg.durationSec;
    boostReg.cooldownSec = overtakeReg.durationSec;
  }

  return {
    ...baseSeason,
    regulations,
  };
}

export const DEFAULT_SEASON_YEAR = 2026;
