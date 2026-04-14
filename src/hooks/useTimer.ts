/**
 * useTimer.ts — React hook that wires the timer engine to the session store.
 *
 * This hook is the bridge between two things:
 *   1. The timer engine (`createTimer`) that fires ~60 times per second
 *   2. The session store's `tick()` method that advances the session
 *
 * It automatically:
 *   - Starts the timer when the session enters 'running' state
 *   - Pauses the timer when the session enters 'paused' state
 *   - Stops the timer when the session finishes (completed / abandoned)
 *   - Cleans up (stops the timer) when the component unmounts
 *
 * Usage: just call `useTimer()` inside the RaceScreen component.
 * It handles everything — no return value needed.
 *
 * From ARCHITECTURE.md §9.4.2 and Phase 4 step 4.6.
 */

import { useEffect, useRef } from 'react';
import { useSessionStore } from '../stores/sessionStore';
import { createTimer, type Timer } from '../engine/timer';

/**
 * Hook that manages the requestAnimationFrame timer loop for the active session.
 *
 * Reacts to session state changes:
 *   - 'running' → starts/resumes the timer
 *   - 'paused' → pauses the timer
 *   - 'completed' / 'abandoned' / null → stops the timer
 *
 * Call this once in the RaceScreen component. That's it — it does the rest.
 */
export function useTimer(): void {
  // Keep a stable reference to the timer across re-renders.
  // We create the timer once and reuse it for the lifetime of the component.
  const timerRef = useRef<Timer | null>(null);

  // Get the session state and tick action from the store.
  // We subscribe to just the state (not the whole session) to avoid
  // unnecessary re-renders — we only care about state transitions.
  const sessionState = useSessionStore((s) => s.session?.state ?? null);
  const tick = useSessionStore((s) => s.tick);

  // Create the timer on first mount, destroy on unmount
  useEffect(() => {
    // Create the timer with the store's tick() as the callback.
    // Each animation frame, the timer calls tick(deltaMs), which
    // advances the session's wall time, effective progress, etc.
    timerRef.current = createTimer((deltaMs) => {
      // Always read the latest tick function from the store
      // (tick is stable because Zustand actions don't change identity,
      // but using the ref ensures we're always safe)
      useSessionStore.getState().tick(deltaMs);
    });

    // Clean up: stop the timer when the component unmounts
    return () => {
      if (timerRef.current) {
        timerRef.current.stop();
        timerRef.current = null;
      }
    };
  }, []); // Empty deps — create once, clean up on unmount

  // React to session state changes: start/pause/stop the timer
  useEffect(() => {
    const timer = timerRef.current;
    if (!timer) return;

    switch (sessionState) {
      case 'running':
        // Session is running — make sure the timer is going
        if (!timer.isRunning()) {
          timer.start();
        } else if (timer.isPaused()) {
          timer.resume();
        }
        break;

      case 'paused':
        // Session is paused — pause the timer (keeps the loop alive
        // but stops calling tick, and resets the timestamp baseline)
        if (timer.isRunning() && !timer.isPaused()) {
          timer.pause();
        }
        break;

      case 'completed':
      case 'abandoned':
      case null:
        // Session is over or doesn't exist — stop completely
        timer.stop();
        break;

      default:
        // 'setup' state — timer shouldn't be running yet
        timer.stop();
        break;
    }
  }, [sessionState, tick]);
}
