/**
 * historyStore.ts — Zustand store for past completed/abandoned sessions.
 *
 * Responsibilities:
 *   - Keep an in-memory list of past Session objects.
 *   - Load the list from "history.json" on app start.
 *   - Append a session when it completes or is abandoned.
 *   - Enforce a 100-session cap (prune oldest) to keep the file small.
 *
 * Usage:
 *   const history = useHistoryStore(s => s.sessions);
 *   await useHistoryStore.getState().loadHistory();     // once at startup
 *   await useHistoryStore.getState().addSession(session); // after session ends
 */

import { create } from 'zustand';
import type { Session } from '../types/session';
import { readData, writeData } from '../utils/storage';
import { sanitizeHistory } from '../utils/validatePersisted';

/** Filename used in the Tauri app-data directory. */
const HISTORY_FILE = 'history.json';

/** Maximum number of past sessions we keep. Oldest are pruned on overflow. */
const MAX_HISTORY_ENTRIES = 100;

// ---------------------------------------------------------------------------
// Store shape
// ---------------------------------------------------------------------------

interface HistoryStore {
  /** All past sessions, most recent first. */
  sessions: Session[];

  /** True once we've attempted to load from disk. */
  isLoaded: boolean;

  /**
   * Load session history from disk.
   * Call once at app startup.
   * If the file does not exist (first launch), the list stays empty.
   */
  loadHistory: () => Promise<void>;

  /**
   * Append a session to history and persist the updated list to disk.
   * The session should be in `completed` or `abandoned` state.
   * Only one session with the same `id` is kept (idempotent).
   */
  addSession: (session: Session) => Promise<void>;

  /**
   * Remove all history (clears both memory and the file on disk).
   * Useful for debugging / settings "clear history" button in the future.
   */
  clearHistory: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Store implementation
// ---------------------------------------------------------------------------

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  sessions: [],
  isLoaded: false,

  // -------------------------------------------------------------------------
  // loadHistory
  // -------------------------------------------------------------------------
  async loadHistory() {
    const saved = await readData<unknown>(HISTORY_FILE);

    // Validate before trusting on-disk data: drop any malformed entries and
    // clamp numeric fields rather than rendering corrupt sessions (see
    // sanitizeHistory). Also enforce the entry cap in case the file was
    // hand-edited beyond it.
    const sessions = sanitizeHistory(saved).slice(0, MAX_HISTORY_ENTRIES);
    if (sessions.length > 0) {
      set({ sessions, isLoaded: true });
    } else {
      set({ isLoaded: true });
    }
  },

  // -------------------------------------------------------------------------
  // addSession
  // -------------------------------------------------------------------------
  async addSession(session: Session) {
    const current = get().sessions;

    // Deduplicate: find if the session already exists to avoid double-saving.
    const existingIndex = current.findIndex(s => s.id === session.id);

    let updated: Session[];
    if (existingIndex === -1) {
      // New session: prepend and prune to the cap.
      updated = [session, ...current].slice(0, MAX_HISTORY_ENTRIES);
    } else {
      // Existing session: remove from current position and move to front.
      // Since it was already in the list, we don't need to slice again
      // as the length will remain <= MAX_HISTORY_ENTRIES.
      updated = [...current];
      updated.splice(existingIndex, 1);
      updated.unshift(session);
    }

    set({ sessions: updated });
    await writeData(HISTORY_FILE, updated);
  },

  // -------------------------------------------------------------------------
  // clearHistory
  // -------------------------------------------------------------------------
  async clearHistory() {
    set({ sessions: [] });
    await writeData(HISTORY_FILE, []);
  },
}));
