/**
 * sessionStore.ts — Zustand store for the active deep-work session.
 *
 * This is the "brain" of the app at runtime. It owns:
 *   - The current Session object (or null when no session is active).
 *   - All actions that transition session state (create, start, pause, etc.).
 *   - The `tick()` method called every animation frame by the timer hook.
 *   - Regulation activation/deactivation logic.
 *   - Penalty application.
 *   - Event logging.
 *
 * The store does NOT call filesystem APIs — that is the history store's job.
 * When a session completes or is abandoned, call historyStore.addSession().
 */

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Session, SessionEvent, SessionState } from '../types/session';
import type { RegulationType, PenaltyTrigger } from '../types/regulations';

// ---------------------------------------------------------------------------
// Helper — create a SessionEvent
// ---------------------------------------------------------------------------

function makeEvent(
  type: SessionEvent['type'],
  metadata: Record<string, unknown> = {}
): SessionEvent {
  return {
    id: uuidv4(),
    timestamp: Date.now(),
    type,
    metadata,
  };
}

// ---------------------------------------------------------------------------
// Helper — build the initial cooldowns / usageCounts records
// Every RegulationType starts at 0 (no cooldown, no uses).
// ---------------------------------------------------------------------------

function emptyRegulationRecord<V>(value: V): Record<RegulationType, V> {
  return { boost: value, overtake: value, drs: value };
}

// ---------------------------------------------------------------------------
// Store shape
// ---------------------------------------------------------------------------

interface CreateSessionParams {
  trackId: string;
  seasonYear: number;
  durationSec: number;
  strategyNote: string;
  parcFerme: boolean;
  penaltyTriggers: PenaltyTrigger[];
}

interface SessionStore {
  /** The active session — null when on the Setup screen between sessions. */
  session: Session | null;

  // ------------------------------------------------------------------
  // Lifecycle actions
  // ------------------------------------------------------------------

  /** Build a new session object and put it in 'setup' state. */
  createSession: (params: CreateSessionParams) => void;

  /** Transition: setup → running. Records a session_start event. */
  startSession: () => void;

  /** Transition: running → paused. Records a session_pause event. */
  pauseSession: () => void;

  /** Transition: paused → running. Records a session_resume event. */
  resumeSession: () => void;

  /** Transition: running/paused → completed. Records session_complete. */
  completeSession: () => void;

  /** Transition: running/paused → abandoned. Records session_abandon. */
  abandonSession: () => void;

  /** Discard the session — go back to a blank slate (null). */
  clearSession: () => void;

  // ------------------------------------------------------------------
  // Timer
  // ------------------------------------------------------------------

  /**
   * Called every animation frame with the elapsed milliseconds since the
   * last frame. Updates wall-clock time, effective progress, checks for
   * regulation expiry, and auto-completes the session when progress hits 100%.
   */
  tick: (deltaMs: number) => void;

  // ------------------------------------------------------------------
  // Regulations
  // ------------------------------------------------------------------

  /** Activate a regulation type (Boost / Overtake / DRS). */
  activateRegulation: (type: RegulationType) => void;

  /** Deactivate the currently active regulation (e.g., timer expired). */
  deactivateRegulation: () => void;

  // ------------------------------------------------------------------
  // Penalties
  // ------------------------------------------------------------------

  /**
   * Subtract `penaltySec` seconds from effective progress and log the event.
   * `trigger` identifies what caused the penalty (pause / unfocus / idle).
   */
  applyPenalty: (trigger: PenaltyTrigger, penaltySec: number) => void;

  // ------------------------------------------------------------------
  // Event log
  // ------------------------------------------------------------------

  /** Append a raw event to the session's event log. */
  addEvent: (event: Omit<SessionEvent, 'id' | 'timestamp'>) => void;
}

// ---------------------------------------------------------------------------
// Valid state transitions guard
// ---------------------------------------------------------------------------

/**
 * Returns true if transitioning from `from` to `to` is allowed by the state
 * machine defined in ARCHITECTURE.md §9.4.1.
 */
function canTransition(from: SessionState, to: SessionState): boolean {
  const allowed: Partial<Record<SessionState, SessionState[]>> = {
    setup:   ['running'],
    running: ['paused', 'completed', 'abandoned'],
    paused:  ['running', 'abandoned'],
  };
  return (allowed[from] ?? []).includes(to);
}

// ---------------------------------------------------------------------------
// Store implementation
// ---------------------------------------------------------------------------

export const useSessionStore = create<SessionStore>((set, get) => ({
  session: null,

  // --------------------------------------------------
  // createSession
  // --------------------------------------------------
  createSession({ trackId, seasonYear, durationSec, strategyNote, parcFerme, penaltyTriggers }) {
    const now = Date.now();
    const session: Session = {
      id: uuidv4(),
      createdAt: now,
      state: 'setup',
      selectedTrackId: trackId,
      seasonYear,
      targetDurationSec: durationSec,
      strategyNote,
      parcFermeEnabled: parcFerme,

      // Runtime state — starts at zero
      elapsedWallTimeSec: 0,
      effectiveProgressSec: 0,
      currentPaceMultiplier: 1.0,
      lapsCompleted: 0,
      totalPenaltySec: 0,

      // Regulation state — nothing active
      activeRegulation: null,
      regulationEndTime: null,
      cooldowns: emptyRegulationRecord(0),
      usageCounts: emptyRegulationRecord(0),

      // Penalty preferences
      enabledPenaltyTriggers: penaltyTriggers,

      // Event log
      events: [],

      // Not yet completed
      completedAt: null,
    };

    set({ session });
  },

  // --------------------------------------------------
  // startSession
  // --------------------------------------------------
  startSession() {
    const { session } = get();
    if (!session || !canTransition(session.state, 'running')) return;

    const event = makeEvent('session_start');
    set({
      session: {
        ...session,
        state: 'running',
        events: [...session.events, event],
      },
    });
  },

  // --------------------------------------------------
  // pauseSession
  // --------------------------------------------------
  pauseSession() {
    const { session } = get();
    if (!session || !canTransition(session.state, 'paused')) return;

    const event = makeEvent('session_pause');
    set({
      session: {
        ...session,
        state: 'paused',
        events: [...session.events, event],
      },
    });
  },

  // --------------------------------------------------
  // resumeSession
  // --------------------------------------------------
  resumeSession() {
    const { session } = get();
    if (!session || !canTransition(session.state, 'running')) return;

    const event = makeEvent('session_resume');
    set({
      session: {
        ...session,
        state: 'running',
        events: [...session.events, event],
      },
    });
  },

  // --------------------------------------------------
  // completeSession
  // --------------------------------------------------
  completeSession() {
    const { session } = get();
    if (!session || !canTransition(session.state, 'completed')) return;

    const now = Date.now();
    const event = makeEvent('session_complete');
    set({
      session: {
        ...session,
        state: 'completed',
        activeRegulation: null,
        regulationEndTime: null,
        currentPaceMultiplier: 1.0,
        completedAt: now,
        events: [...session.events, event],
      },
    });
  },

  // --------------------------------------------------
  // abandonSession
  // --------------------------------------------------
  abandonSession() {
    const { session } = get();
    if (!session || !canTransition(session.state, 'abandoned')) return;

    const now = Date.now();
    const event = makeEvent('session_abandon');
    set({
      session: {
        ...session,
        state: 'abandoned',
        activeRegulation: null,
        regulationEndTime: null,
        currentPaceMultiplier: 1.0,
        completedAt: now,
        events: [...session.events, event],
      },
    });
  },

  // --------------------------------------------------
  // clearSession — returns to blank state
  // --------------------------------------------------
  clearSession() {
    set({ session: null });
  },

  // --------------------------------------------------
  // tick — called every animation frame
  // --------------------------------------------------
  tick(deltaMs: number) {
    const { session } = get();
    // Only tick when running
    if (!session || session.state !== 'running') return;

    const deltaSec = deltaMs / 1000;
    const now = Date.now();

    let { activeRegulation, regulationEndTime, cooldowns, currentPaceMultiplier, events } =
      session;

    // Check if the active regulation timer has expired
    if (activeRegulation !== null && regulationEndTime !== null && now >= regulationEndTime) {
      // Deactivate it: reset multiplier, start cooldown
      const deactivateEvent = makeEvent('regulation_deactivate', {
        regulationType: activeRegulation,
      });
      events = [...events, deactivateEvent];

      cooldowns = {
        ...cooldowns,
        // Cooldown is set in activateRegulation along with regulationEndTime;
        // here we just note it has expired naturally. The actual cooldown end
        // time was pre-computed in activateRegulation — it stays as-set.
      };

      activeRegulation = null;
      regulationEndTime = null;
      currentPaceMultiplier = 1.0;
    }

    // Advance progress
    const newElapsedWallTimeSec = session.elapsedWallTimeSec + deltaSec;
    const newEffectiveProgressSec =
      session.effectiveProgressSec + deltaSec * currentPaceMultiplier;

    // Auto-complete when effective progress reaches target
    if (newEffectiveProgressSec >= session.targetDurationSec) {
      const completeEvent = makeEvent('session_complete');
      set({
        session: {
          ...session,
          elapsedWallTimeSec: newElapsedWallTimeSec,
          effectiveProgressSec: session.targetDurationSec, // cap at 100%
          currentPaceMultiplier,
          activeRegulation,
          regulationEndTime,
          cooldowns,
          state: 'completed',
          completedAt: now,
          events: [...events, completeEvent],
        },
      });
      return;
    }

    set({
      session: {
        ...session,
        elapsedWallTimeSec: newElapsedWallTimeSec,
        effectiveProgressSec: newEffectiveProgressSec,
        currentPaceMultiplier,
        activeRegulation,
        regulationEndTime,
        cooldowns,
        events,
      },
    });
  },

  // --------------------------------------------------
  // activateRegulation
  // --------------------------------------------------
  activateRegulation(type: RegulationType) {
    const { session } = get();
    if (!session || session.state !== 'running') return;

    // Guard: nothing else may be active
    if (session.activeRegulation !== null) return;

    // Guard: must not be on cooldown
    const now = Date.now();
    const cooldownExpiry = session.cooldowns[type] ?? 0;
    if (now < cooldownExpiry) return;

    // Guard: usage limit (enforced by caller / regulations engine; store records it)
    // (The regulations engine canActivateRegulation() is called by the UI hook
    //  before calling this action — so here we trust the call is valid.)

    // We need the durationSec and cooldownSec for this regulation type.
    // Those come from the season ruleset, which the caller must provide.
    // Since the store doesn't import seasons data, we store regulation end time
    // using a known convention: the UI layer must call this method with
    // the regulation config attached via a separate parameter approach.
    //
    // DESIGN NOTE: Rather than importing season data into the store (which
    // would create a circular dependency with the UI), we expose
    // activateRegulationWithConfig below. This action is kept for direct
    // low-level use; the hook useRegulations calls activateRegulationWithConfig.
    //
    // For now this simpler version sets a 30-second default if called directly.
    const DEFAULT_DURATION_SEC = 30;
    const DEFAULT_COOLDOWN_SEC = 120;

    const regulationEndTime = now + DEFAULT_DURATION_SEC * 1000;
    const cooldownEndTime = now + DEFAULT_DURATION_SEC * 1000 + DEFAULT_COOLDOWN_SEC * 1000;

    const event = makeEvent('regulation_activate', { regulationType: type });

    set({
      session: {
        ...session,
        activeRegulation: type,
        regulationEndTime,
        currentPaceMultiplier: 2.0, // default multiplier
        cooldowns: { ...session.cooldowns, [type]: cooldownEndTime },
        usageCounts: {
          ...session.usageCounts,
          [type]: (session.usageCounts[type] ?? 0) + 1,
        },
        events: [...session.events, event],
      },
    });
  },

  // --------------------------------------------------
  // deactivateRegulation
  // --------------------------------------------------
  deactivateRegulation() {
    const { session } = get();
    if (!session || session.activeRegulation === null) return;

    const event = makeEvent('regulation_deactivate', {
      regulationType: session.activeRegulation,
    });

    set({
      session: {
        ...session,
        activeRegulation: null,
        regulationEndTime: null,
        currentPaceMultiplier: 1.0,
        events: [...session.events, event],
      },
    });
  },

  // --------------------------------------------------
  // applyPenalty
  // --------------------------------------------------
  applyPenalty(trigger: PenaltyTrigger, penaltySec: number) {
    const { session } = get();
    if (!session) return;

    // Don't deduct below zero
    const newEffectiveProgressSec = Math.max(
      0,
      session.effectiveProgressSec - penaltySec
    );

    const event = makeEvent('penalty_applied', {
      trigger,
      penaltySec,
      effectiveProgressAfter: newEffectiveProgressSec,
    });

    set({
      session: {
        ...session,
        effectiveProgressSec: newEffectiveProgressSec,
        totalPenaltySec: session.totalPenaltySec + penaltySec,
        events: [...session.events, event],
      },
    });
  },

  // --------------------------------------------------
  // addEvent
  // --------------------------------------------------
  addEvent(partial: Omit<SessionEvent, 'id' | 'timestamp'>) {
    const { session } = get();
    if (!session) return;
    const event = makeEvent(partial.type, partial.metadata);
    set({
      session: {
        ...session,
        events: [...session.events, event],
      },
    });
  },
}));

// ---------------------------------------------------------------------------
// Convenience: activate a regulation using its full config from the season.
// Call this from useRegulations hook rather than activateRegulation().
// ---------------------------------------------------------------------------

export function activateRegulationWithConfig(
  type: RegulationType,
  paceMultiplier: number,
  durationSec: number,
  cooldownSec: number
): void {
  const { session } = useSessionStore.getState();
  if (!session || session.state !== 'running') return;
  if (session.activeRegulation !== null) return;

  const now = Date.now();
  const cooldownExpiry = session.cooldowns[type] ?? 0;
  if (now < cooldownExpiry) return;

  const regulationEndTime = now + durationSec * 1000;
  // Cooldown starts when the regulation ENDS, not when it starts.
  const cooldownEndTime = regulationEndTime + cooldownSec * 1000;

  const event = makeEvent('regulation_activate', {
    regulationType: type,
    paceMultiplier,
    durationSec,
  });

  useSessionStore.setState({
    session: {
      ...session,
      activeRegulation: type,
      regulationEndTime,
      currentPaceMultiplier: paceMultiplier,
      cooldowns: { ...session.cooldowns, [type]: cooldownEndTime },
      usageCounts: {
        ...session.usageCounts,
        [type]: (session.usageCounts[type] ?? 0) + 1,
      },
      events: [...session.events, event],
    },
  });
}
