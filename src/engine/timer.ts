/**
 * timer.ts — The requestAnimationFrame-based timer loop.
 *
 * This is the "heartbeat" of a deep-work session. Instead of using
 * `setInterval` (which can drift and isn't smooth), we use the browser's
 * `requestAnimationFrame` API, which fires ~60 times per second and
 * stays perfectly in sync with the display.
 *
 * How it works:
 *   1. Each frame, we compute how many milliseconds passed since the last frame.
 *   2. We pass that `deltaMs` value to a callback (the session store's `tick()` method).
 *   3. `tick()` updates the timer, progress, regulations, etc.
 *
 * The timer does NOT know anything about sessions, regulations, or progress —
 * it just measures time and calls a callback. All the smart logic lives in
 * the session store's `tick()` method.
 *
 * From ARCHITECTURE.md §9.4.2.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * The callback that gets called every animation frame.
 *
 * @param deltaMs  How many milliseconds passed since the last frame.
 *                 Typically ~16ms at 60fps, but can be larger if the
 *                 system is busy.
 */
export type TickCallback = (deltaMs: number) => void;

/**
 * A timer instance with start/stop/pause/resume controls.
 *
 * Create one using `createTimer()`. The timer starts in the STOPPED state.
 */
export interface Timer {
  /** Start the animation frame loop. The callback will begin firing. */
  start: () => void;

  /** Stop the loop completely. Resets internal timestamp tracking. */
  stop: () => void;

  /** Pause the loop — frames still fire but the callback is not called. */
  pause: () => void;

  /** Resume after a pause — the callback starts firing again. */
  resume: () => void;

  /** Whether the timer loop is currently active (started and not stopped). */
  isRunning: () => boolean;

  /** Whether the timer is currently paused. */
  isPaused: () => boolean;
}

// ---------------------------------------------------------------------------
// Timer implementation
// ---------------------------------------------------------------------------

/**
 * Create a new timer that calls `onTick` every animation frame with the
 * time elapsed since the previous frame.
 *
 * Think of it like a metronome — it ticks steadily and tells you exactly
 * how much time passed between each tick. The session store then uses
 * that information to advance the timer, move the car, check for
 * regulation expiry, etc.
 *
 * @param onTick  Function called each frame with `deltaMs`
 * @returns       A Timer object with start/stop/pause/resume controls
 *
 * @example
 * ```ts
 * const timer = createTimer((deltaMs) => {
 *   sessionStore.tick(deltaMs);
 * });
 *
 * timer.start();   // Begin ticking
 * timer.pause();   // Temporarily stop (e.g., user paused the session)
 * timer.resume();  // Continue ticking
 * timer.stop();    // Done — clean up
 * ```
 */
export function createTimer(onTick: TickCallback): Timer {
  // Internal state
  let animationFrameId: number | null = null;
  let lastTimestamp: number | null = null;
  let running = false;
  let paused = false;

  /**
   * The core loop function. Called by `requestAnimationFrame` each frame.
   *
   * @param timestamp  High-resolution timestamp provided by the browser
   *                   (via `performance.now()` under the hood)
   */
  const loop = (timestamp: number) => {
    // If we've been stopped, don't continue the loop
    if (!running) return;

    // Schedule the next frame immediately so we don't miss it
    animationFrameId = requestAnimationFrame(loop);

    // If paused, skip processing but keep the loop alive
    // (so we can resume instantly without a new start)
    if (paused) {
      // Reset lastTimestamp so that when we unpause, the first frame
      // doesn't have a huge deltaMs covering the entire pause duration
      lastTimestamp = null;
      return;
    }

    // First frame after start/resume — no delta to report yet
    if (lastTimestamp === null) {
      lastTimestamp = timestamp;
      return;
    }

    // Calculate time elapsed since last frame
    const deltaMs = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    // Safety: cap deltaMs at 1 second to prevent huge jumps
    // (this can happen if the tab was backgrounded or system was frozen)
    const safeDeltaMs = Math.min(deltaMs, 1000);

    // Call the tick callback with the elapsed time
    onTick(safeDeltaMs);
  };

  return {
    start() {
      if (running) return;
      running = true;
      paused = false;
      lastTimestamp = null;
      animationFrameId = requestAnimationFrame(loop);
    },

    stop() {
      running = false;
      paused = false;
      lastTimestamp = null;
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    },

    pause() {
      if (!running || paused) return;
      paused = true;
      // Don't stop the rAF loop — just skip processing in the loop.
      // lastTimestamp is reset inside the loop when paused, so that
      // the first frame after resume doesn't get a massive delta.
    },

    resume() {
      if (!running || !paused) return;
      paused = false;
      // lastTimestamp is already null (set in the paused branch of
      // the loop), so the next frame will establish a new baseline.
    },

    isRunning() {
      return running;
    },

    isPaused() {
      return paused;
    },
  };
}
