/**
 * penaltyDetector.ts — Logic for detecting penalty-triggering events.
 *
 * In Deep Work F1, penalties subtract progress when the user does
 * something that breaks their focus:
 *
 *   1. **Pause penalty** — user clicks the pause button
 *   2. **Unfocus penalty** — user switches to another app (window loses focus)
 *   3. **Idle penalty** — user stops interacting for too long (no mouse/keyboard)
 *
 * This module provides the detection logic but does NOT directly modify
 * the session store. Instead, it provides:
 *   - A `createIdleDetector()` function that tracks user activity
 *   - A `createUnfocusDetector()` function that tracks window focus
 *   - Helper functions for calculating penalties
 *
 * The React hook `usePenaltyDetection` (Phase 4.8) will wire these
 * detectors up to the session store's `applyPenalty()` method.
 *
 * From ARCHITECTURE.md §9.6.
 */

import type { PenaltyTrigger, PenaltyConfig } from '../types/regulations';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Grace period for unfocus events (in milliseconds).
 *
 * If the user switches away from the app but comes back within 3 seconds,
 * no penalty is applied. This prevents accidental "bumps" from triggering
 * penalties (e.g. a notification stealing focus briefly).
 */
export const UNFOCUS_GRACE_PERIOD_MS = 3000;

// ---------------------------------------------------------------------------
// Penalty amount calculation
// ---------------------------------------------------------------------------

/**
 * Get the penalty amount (in seconds) for a given trigger type.
 *
 * Each penalty type has a different severity, defined in the season's
 * PenaltyConfig. For example, pausing might cost 15 seconds while
 * going idle costs 20.
 *
 * @param trigger       What caused the penalty (pause, unfocus, or idle)
 * @param penaltyConfig The season's penalty settings
 * @returns             How many seconds to deduct from progress
 */
export function getPenaltyAmount(
  trigger: PenaltyTrigger,
  penaltyConfig: PenaltyConfig
): number {
  switch (trigger) {
    case 'pause':
      return penaltyConfig.pausePenaltySec;
    case 'unfocus':
      return penaltyConfig.unfocusPenaltySec;
    case 'idle':
      return penaltyConfig.idlePenaltySec;
    default:
      return 0;
  }
}

/**
 * Check whether a specific penalty trigger is enabled for the session.
 *
 * The user can choose which penalties to activate during setup.
 * For example, they might enable pause + unfocus but not idle detection.
 *
 * @param trigger          The trigger to check
 * @param enabledTriggers  The list of triggers the user enabled
 * @returns                Whether this trigger should fire penalties
 */
export function isPenaltyEnabled(
  trigger: PenaltyTrigger,
  enabledTriggers: PenaltyTrigger[]
): boolean {
  return enabledTriggers.includes(trigger);
}

// ---------------------------------------------------------------------------
// Idle Detector
// ---------------------------------------------------------------------------

/**
 * Callback signature for when a penalty event is detected.
 */
export type PenaltyCallback = (trigger: PenaltyTrigger) => void;

/**
 * An idle detector that tracks user activity (mouse, keyboard, clicks).
 *
 * When the user hasn't interacted for longer than the idle threshold,
 * it fires the callback with the 'idle' trigger. The detector keeps
 * firing every `idleThresholdSec` as long as the user remains idle.
 *
 * Call `start()` when the session begins running.
 * Call `stop()` when the session is paused or completed.
 * Call `destroy()` to permanently clean up all listeners.
 */
export interface IdleDetector {
  /** Start monitoring for idle. Call when session is 'running'. */
  start: () => void;
  /** Stop monitoring temporarily. Call when session is 'paused'. */
  stop: () => void;
  /** Remove all event listeners permanently. Call on component unmount. */
  destroy: () => void;
}

/**
 * Create an idle detector.
 *
 * It listens for `mousemove`, `keydown`, and `click` events on the
 * document. Every time the user does something, a countdown timer resets.
 * If the countdown reaches zero (meaning the user hasn't done anything
 * for `idleThresholdMs` milliseconds), the callback fires.
 *
 * @param idleThresholdMs  How long (in ms) before considering the user idle
 * @param onIdle           Callback fired when idle is detected
 * @returns                An IdleDetector with start/stop/destroy methods
 */
export function createIdleDetector(
  idleThresholdMs: number,
  onIdle: PenaltyCallback
): IdleDetector {
  let timerId: ReturnType<typeof setTimeout> | null = null;
  let isRunning = false;

  // Reset the idle countdown — called on every user interaction
  const resetTimer = () => {
    if (!isRunning) return;

    // Clear existing countdown
    if (timerId !== null) {
      clearTimeout(timerId);
    }

    // Start a new countdown
    timerId = setTimeout(() => {
      if (isRunning) {
        onIdle('idle');
        // Keep repeating — if the user stays idle, fire again
        resetTimer();
      }
    }, idleThresholdMs);
  };

  // The activity events we listen for
  const activityEvents: Array<keyof DocumentEventMap> = [
    'mousemove',
    'keydown',
    'click',
  ];

  // Add listeners
  const addListeners = () => {
    for (const event of activityEvents) {
      document.addEventListener(event, resetTimer, { passive: true });
    }
  };

  // Remove listeners
  const removeListeners = () => {
    for (const event of activityEvents) {
      document.removeEventListener(event, resetTimer);
    }
  };

  return {
    start() {
      if (isRunning) return;
      isRunning = true;
      addListeners();
      resetTimer(); // Start the first countdown
    },
    stop() {
      isRunning = false;
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }
    },
    destroy() {
      this.stop();
      removeListeners();
    },
  };
}

// ---------------------------------------------------------------------------
// Unfocus Detector
// ---------------------------------------------------------------------------

/**
 * An unfocus detector that monitors whether the app window has focus.
 *
 * When the window loses focus (user switches to another app) and the
 * user doesn't come back within the grace period (3 seconds), the
 * callback fires with the 'unfocus' trigger.
 *
 * Uses the Tauri `getCurrentWindow().onFocusChanged()` API for native
 * window focus monitoring.
 *
 * Call `start()` when the session begins running.
 * Call `stop()` when the session is paused or completed.
 * Call `destroy()` to permanently clean up all listeners.
 */
export interface UnfocusDetector {
  /** Start monitoring for unfocus. Call when session is 'running'. */
  start: () => void;
  /** Stop monitoring temporarily. Call when session is 'paused'. */
  stop: () => void;
  /** Remove all event listeners permanently. Call on component unmount. */
  destroy: () => void;
}

/**
 * Create an unfocus detector.
 *
 * It sets up listeners for window blur/focus events. When the window
 * blurs, a grace period timer starts. If the window regains focus
 * before the grace period expires, nothing happens. If the grace
 * period expires while the window is still blurred, the penalty fires.
 *
 * @param gracePeriodMs  How long to wait before penalizing (default: 3000ms)
 * @param onUnfocus      Callback fired when unfocus penalty should apply
 * @returns              An UnfocusDetector with start/stop/destroy methods
 */
export function createUnfocusDetector(
  gracePeriodMs: number = UNFOCUS_GRACE_PERIOD_MS,
  onUnfocus: PenaltyCallback
): UnfocusDetector {
  let graceTimerId: ReturnType<typeof setTimeout> | null = null;
  let isRunning = false;
  let unlistenTauri: (() => void) | null = null;
  let tauriListenerSetUp = false;

  const handleFocusChange = (focused: boolean) => {
    if (!isRunning) return;

    if (!focused) {
      // Window lost focus — start the grace period
      if (graceTimerId !== null) {
        clearTimeout(graceTimerId);
      }
      graceTimerId = setTimeout(() => {
        if (isRunning) {
          onUnfocus('unfocus');
        }
        graceTimerId = null;
      }, gracePeriodMs);
    } else {
      // Window regained focus — cancel any pending grace period
      if (graceTimerId !== null) {
        clearTimeout(graceTimerId);
        graceTimerId = null;
      }
    }
  };

  // Set up the Tauri window focus listener (async)
  const setupTauriListener = async () => {
    if (tauriListenerSetUp) return;
    tauriListenerSetUp = true;

    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const currentWindow = getCurrentWindow();
      unlistenTauri = await currentWindow.onFocusChanged(({ payload: focused }) => {
        handleFocusChange(focused);
      });
    } catch {
      // Fallback: use browser focus/blur events (for dev mode without Tauri)
      const handleBrowserBlur = () => handleFocusChange(false);
      const handleBrowserFocus = () => handleFocusChange(true);
      window.addEventListener('blur', handleBrowserBlur);
      window.addEventListener('focus', handleBrowserFocus);
      unlistenTauri = () => {
        window.removeEventListener('blur', handleBrowserBlur);
        window.removeEventListener('focus', handleBrowserFocus);
      };
    }
  };

  return {
    start() {
      if (isRunning) return;
      isRunning = true;
      setupTauriListener();
    },
    stop() {
      isRunning = false;
      if (graceTimerId !== null) {
        clearTimeout(graceTimerId);
        graceTimerId = null;
      }
    },
    destroy() {
      this.stop();
      if (unlistenTauri) {
        unlistenTauri();
        unlistenTauri = null;
      }
      tauriListenerSetUp = false;
    },
  };
}
