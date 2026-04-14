/**
 * sessionStateMachine.ts — Pure session state-transition helpers.
 *
 * This module defines the valid transitions for a session's state and
 * provides helper functions to query them. It is a pure-logic module
 * with no side effects, no store imports, and no React dependencies.
 *
 * State machine (from ARCHITECTURE.md §9.4.1):
 *
 *   setup  ──start()──▶  running
 *   running ──pause()──▶  paused
 *   running ──complete()──▶  completed   (auto, when progress reaches 100%)
 *   running ──abandon()──▶  abandoned
 *   paused  ──resume()──▶  running
 *   paused  ──abandon()──▶  abandoned
 *
 * All other transitions are invalid and silently rejected.
 */

import type { SessionState } from '../types/session';

// ---------------------------------------------------------------------------
// Transition map — defines every allowed state change.
// ---------------------------------------------------------------------------

/**
 * A lookup table of valid transitions.
 *
 * Each key is a "from" state, and the value is the list of states you
 * can move TO from that state. If a state is not listed as a key (like
 * 'completed' or 'abandoned'), it has no outgoing transitions — it's a
 * terminal/final state.
 */
const VALID_TRANSITIONS: Partial<Record<SessionState, SessionState[]>> = {
  setup:   ['running'],
  running: ['paused', 'completed', 'abandoned'],
  paused:  ['running', 'abandoned'],
};

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

/**
 * Check whether transitioning from one state to another is allowed.
 *
 * @param from  The session's current state
 * @param to    The state you want to move to
 * @returns     `true` if the transition is valid, `false` otherwise
 *
 * @example
 * canTransition('setup', 'running');  // true  — user clicks START
 * canTransition('paused', 'completed'); // false — must resume first
 */
export function canTransition(from: SessionState, to: SessionState): boolean {
  const allowed = VALID_TRANSITIONS[from] ?? [];
  return allowed.includes(to);
}

/**
 * Get every state that can be reached from the given state.
 *
 * Useful for UI to know which buttons to enable/disable.
 *
 * @param from  The session's current state
 * @returns     Array of reachable states (may be empty for terminal states)
 *
 * @example
 * getValidTransitions('running');  // ['paused', 'completed', 'abandoned']
 * getValidTransitions('completed'); // []
 */
export function getValidTransitions(from: SessionState): SessionState[] {
  return VALID_TRANSITIONS[from] ?? [];
}

/**
 * Check whether the given state is a terminal (final) state.
 *
 * Terminal states have no outgoing transitions — the session is done.
 *
 * @param state  The session state to check
 * @returns      `true` if completed or abandoned
 */
export function isTerminalState(state: SessionState): boolean {
  return !VALID_TRANSITIONS[state] || VALID_TRANSITIONS[state]!.length === 0;
}

/**
 * Check whether the session is in an active state (can still be ticked).
 *
 * An "active" session is one that is either running or paused — it hasn't
 * ended yet, but it may or may not be ticking the timer.
 *
 * @param state  The session state to check
 * @returns      `true` if running or paused
 */
export function isActiveState(state: SessionState): boolean {
  return state === 'running' || state === 'paused';
}

/**
 * Check whether the timer should be ticking in this state.
 *
 * The timer only advances when the session is 'running' — not when
 * paused, not in setup, and not when finished.
 *
 * @param state  The session state to check
 * @returns      `true` only if state is 'running'
 */
export function isTickingState(state: SessionState): boolean {
  return state === 'running';
}
