/**
 * usePenaltyDetection.ts — React hook that wires penalty detection to the session store.
 *
 * This hook sets up two penalty detectors and connects them to the
 * session store's `applyPenalty()` method:
 *
 *   1. **Unfocus detector** — monitors whether the app window has focus.
 *      If the user switches to another app for more than 3 seconds,
 *      a penalty is applied.
 *
 *   2. **Idle detector** — monitors for user inactivity (no mouse/keyboard).
 *      If the user does nothing for too long, a penalty is applied.
 *
 * Penalties are only applied when:
 *   - The session is in 'running' state
 *   - The specific penalty trigger is enabled for this session
 *
 * The hook also handles the extra "interruption penalty" — if a regulation
 * is active when the penalty fires, the penalty amount is multiplied by
 * the regulation's interruption penalty multiplier. This makes getting
 * distracted while using Boost or Overtake extra costly.
 *
 * Note: The "pause" penalty is NOT handled here — it's applied directly
 * by the pause action in the session store or the UI component that
 * calls pauseSession().
 *
 * From ARCHITECTURE.md §9.6 and Phase 4 step 4.8.
 */

import { useEffect, useRef } from 'react';
import { useSessionStore } from '../stores/sessionStore';
import { useSettingsStore } from '../stores/settingsStore';
import { getSeasonByYear } from '../data/seasons';
import {
  createIdleDetector,
  createUnfocusDetector,
  getPenaltyAmount,
  isPenaltyEnabled,
  type IdleDetector,
  type UnfocusDetector,
} from '../engine/penaltyDetector';
import {
  calculateInterruptionPenalty,
  getRegulationConfig,
} from '../engine/regulationsEngine';
import type { PenaltyTrigger } from '../types/regulations';

/**
 * React hook that sets up unfocus and idle penalty detection.
 *
 * Call this once in the RaceScreen component. It automatically:
 *   - Creates the detectors when the component mounts
 *   - Starts/stops them based on session state (running vs paused)
 *   - Applies penalties via the session store when triggered
 *   - Cleans up on unmount
 *
 * No return value — it works entirely through side effects.
 */
export function usePenaltyDetection(): void {
  // Refs to hold detector instances across renders
  const idleDetectorRef = useRef<IdleDetector | null>(null);
  const unfocusDetectorRef = useRef<UnfocusDetector | null>(null);

  // Read session state (for starting/stopping detectors)
  const sessionState = useSessionStore((s) => s.session?.state ?? null);

  // Create and destroy detectors based on whether we have a running session
  useEffect(() => {
    // Helper: handle a penalty trigger
    const handlePenalty = (trigger: PenaltyTrigger) => {
      const session = useSessionStore.getState().session;
      if (!session || session.state !== 'running') return;

      // Check if this penalty trigger is enabled for this session
      if (!isPenaltyEnabled(trigger, session.enabledPenaltyTriggers)) return;

      // Get season ruleset for penalty amounts
      const ruleset = getSeasonByYear(session.seasonYear);
      if (!ruleset) return;

      // Calculate the base penalty amount
      let penaltySec = getPenaltyAmount(trigger, ruleset.penaltyConfig);

      // If a regulation is active, apply the interruption multiplier
      // (getting distracted during a regulation is extra costly)
      if (session.activeRegulation) {
        const regConfig = getRegulationConfig(session.activeRegulation, ruleset);
        if (regConfig) {
          penaltySec = calculateInterruptionPenalty(
            penaltySec,
            regConfig.interruptionPenaltyMultiplier
          );

          // Also log a regulation_interrupted event and deactivate it
          useSessionStore.getState().addEvent({
            type: 'regulation_interrupted',
            metadata: {
              regulationType: session.activeRegulation,
              trigger,
              penaltySec,
            },
          });
          useSessionStore.getState().deactivateRegulation();
        }
      }

      // Apply the penalty
      useSessionStore.getState().applyPenalty(trigger, penaltySec);
    };

    // Get idle threshold from settings
    const settings = useSettingsStore.getState().settings;
    const idleThresholdMs = settings.idleThresholdSec * 1000;

    // Create detectors
    idleDetectorRef.current = createIdleDetector(idleThresholdMs, handlePenalty);
    unfocusDetectorRef.current = createUnfocusDetector(undefined, handlePenalty);

    // Clean up on unmount
    return () => {
      if (idleDetectorRef.current) {
        idleDetectorRef.current.destroy();
        idleDetectorRef.current = null;
      }
      if (unfocusDetectorRef.current) {
        unfocusDetectorRef.current.destroy();
        unfocusDetectorRef.current = null;
      }
    };
  }, []); // Create once on mount

  // Start/stop detectors based on session state
  useEffect(() => {
    const idle = idleDetectorRef.current;
    const unfocus = unfocusDetectorRef.current;

    if (sessionState === 'running') {
      // Session is running — start both detectors
      idle?.start();
      unfocus?.start();
    } else {
      // Session is paused, completed, or doesn't exist — stop detectors
      idle?.stop();
      unfocus?.stop();
    }
  }, [sessionState]);
}
