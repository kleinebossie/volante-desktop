/**
 * useRegulations.ts — React hook for regulation button interactions.
 *
 * This hook provides everything the UI needs to render and interact
 * with regulation buttons (Boost, Overtake, DRS):
 *
 *   - Which regulations are available in the current season
 *   - Whether each button can be pressed right now
 *   - The current state of each button (available / active / cooldown / etc.)
 *   - Cooldown progress for the cooldown bar animation
 *   - Remaining uses (for limited-use regulations like Overtake)
 *   - An `activate(type)` function to press a regulation button
 *   - A `deactivate()` function to cancel the active regulation
 *
 * It reads from the session store and season data, calls the pure
 * regulations engine for logic, and dispatches to the store when
 * the user activates a regulation.
 *
 * From ARCHITECTURE.md §9.5 and Phase 4 step 4.7.
 */

import { useMemo, useCallback } from 'react';
import { useSessionStore, activateRegulationWithConfig } from '../stores/sessionStore';
import { getSeasonByYear } from '../data/seasons';
import {
  canActivateRegulation,
  getRegulationState,
  getCooldownRemainingSec,
  getCooldownProgress,
  getActiveRegulationRemainingSec,
  getActiveRegulationProgress,
  getRemainingUses,
  getRegulationConfig,
  type RegulationState,
  type ActivationCheck,
} from '../engine/regulationsEngine';
import type { RegulationType, RegulationConfig, SeasonRuleset } from '../types/regulations';

// ---------------------------------------------------------------------------
// Types returned by the hook
// ---------------------------------------------------------------------------

/**
 * Information about a single regulation button, ready for the UI to render.
 */
export interface RegulationInfo {
  /** The regulation type identifier */
  type: RegulationType;
  /** Full config from the season ruleset */
  config: RegulationConfig;
  /** Current visual state of the button */
  state: RegulationState;
  /** Whether the user can press this button right now */
  canActivate: ActivationCheck;
  /** Remaining cooldown in seconds (0 if not on cooldown) */
  cooldownRemainingSec: number;
  /** Cooldown progress fraction (1.0 = full bar, 0.0 = done) */
  cooldownProgress: number;
  /** Remaining seconds on the active regulation timer (0 if not active) */
  activeRemainingSec: number;
  /** Active regulation progress fraction (1.0 = just started, 0.0 = expiring) */
  activeProgress: number;
  /** Remaining uses (null if unlimited) */
  remainingUses: number | null;
}

/**
 * Everything the hook returns — regulation info + actions.
 */
export interface UseRegulationsResult {
  /** The season ruleset (null if season not found) */
  ruleset: SeasonRuleset | null;
  /** Info for each regulation in the current season */
  regulations: RegulationInfo[];
  /** The type of the currently active regulation (null if none) */
  activeRegulation: RegulationType | null;
  /** Activate a regulation button */
  activate: (type: RegulationType) => void;
  /** Deactivate the currently active regulation (e.g., manual cancel) */
  deactivate: () => void;
}

// ---------------------------------------------------------------------------
// Hook implementation
// ---------------------------------------------------------------------------

/**
 * React hook that provides regulation button state and actions.
 *
 * Call this in the RaceScreen component. It gives you everything needed
 * to render each regulation button with the correct state, cooldown bars,
 * usage counters, and click handlers.
 *
 * @returns Regulation info and action handlers
 */
export function useRegulations(): UseRegulationsResult {
  // Read session data from the store
  const session = useSessionStore((s) => s.session);
  const deactivateRegulation = useSessionStore((s) => s.deactivateRegulation);

  // Look up the season ruleset for the current session
  const ruleset = useMemo(() => {
    if (!session) return null;
    return getSeasonByYear(session.seasonYear) ?? null;
  }, [session?.seasonYear]);

  // Build info for each regulation in the current season
  const regulations: RegulationInfo[] = useMemo(() => {
    if (!session || !ruleset) return [];

    return ruleset.regulations.map((config) => {
      const type = config.type;
      return {
        type,
        config,
        state: getRegulationState(type, session, ruleset),
        canActivate: canActivateRegulation(type, session, ruleset),
        cooldownRemainingSec: getCooldownRemainingSec(type, session),
        cooldownProgress: getCooldownProgress(type, session, config),
        activeRemainingSec: session.activeRegulation === type
          ? getActiveRegulationRemainingSec(session)
          : 0,
        activeProgress: session.activeRegulation === type
          ? getActiveRegulationProgress(session, config)
          : 0,
        remainingUses: getRemainingUses(type, session, config),
      };
    });
  }, [session, ruleset]);

  // Activate a regulation — validates via the engine then dispatches to store
  const activate = useCallback(
    (type: RegulationType) => {
      if (!session || !ruleset) return;
      if (session.state !== 'running') return;

      // Look up the config for this regulation
      const config = getRegulationConfig(type, ruleset);
      if (!config) return;

      // Check if activation is allowed
      const check = canActivateRegulation(type, session, ruleset);
      if (!check.allowed) return;

      // Use the store's activateRegulationWithConfig helper — it sets
      // the correct end time, cooldown, multiplier, and logs the event
      activateRegulationWithConfig(
        type,
        config.paceMultiplier,
        config.durationSec,
        config.cooldownSec
      );
    },
    [session, ruleset]
  );

  // Deactivate — wraps the store action
  const deactivate = useCallback(() => {
    deactivateRegulation();
  }, [deactivateRegulation]);

  return {
    ruleset,
    regulations,
    activeRegulation: session?.activeRegulation ?? null,
    activate,
    deactivate,
  };
}
