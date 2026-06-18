/**
 * settingsStore.ts — Zustand store for user preferences.
 *
 * Responsibilities:
 *   - Hold the current UserSettings in memory so any component can read them.
 *   - Load settings from "settings.json" on app start (call `loadSettings()`).
 *   - Save settings to "settings.json" every time a value changes.
 *
 * Usage:
 *   const settings = useSettingsStore(s => s.settings);
 *   const update   = useSettingsStore(s => s.updateSettings);
 *   await useSettingsStore.getState().loadSettings();  // called once at startup
 */

import { create } from 'zustand';
import { DEFAULT_SETTINGS, UserSettings } from '../types/settings';
import { readData, writeData } from '../utils/storage';
import { sanitizeSettings } from '../utils/validatePersisted';

/** The filename we store settings under in the Tauri app-data directory. */
const SETTINGS_FILE = 'settings.json';

// ---------------------------------------------------------------------------
// Store shape
// ---------------------------------------------------------------------------

interface SettingsStore {
  /** The current user settings. Starts with the hard-coded defaults. */
  settings: UserSettings;

  /** Loaded flag — true once we've attempted to load from disk. */
  isLoaded: boolean;

  /**
   * Load settings from disk.
   * Call this once when the app starts.
   * If the file does not exist (first launch) the defaults stay in place.
   */
  loadSettings: () => Promise<void>;

  /**
   * Merge a partial update into the current settings, then persist to disk.
   * Example: updateSettings({ defaultDurationMin: 50 })
   */
  updateSettings: (partial: Partial<UserSettings>) => Promise<void>;

  /**
   * Reset all settings back to the hard-coded defaults, then persist.
   */
  resetSettings: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Store implementation
// ---------------------------------------------------------------------------

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: { ...DEFAULT_SETTINGS },
  isLoaded: false,

  // -------------------------------------------------------------------------
  // loadSettings — read from disk; merge over defaults (handles partial files)
  // -------------------------------------------------------------------------
  async loadSettings() {
    const saved = await readData<unknown>(SETTINGS_FILE);

    if (saved != null) {
      // Validate and sanitize before trusting on-disk data: corrupt or tampered
      // files are clamped to safe ranges and unknown/ill-typed fields fall back
      // to defaults (see sanitizeSettings). New fields added in future versions
      // also automatically get their default value.
      set({ settings: sanitizeSettings(saved), isLoaded: true });
    } else {
      // First launch or missing file — use defaults as-is.
      set({ isLoaded: true });
    }
  },

  // -------------------------------------------------------------------------
  // updateSettings — partial merge + persist
  // -------------------------------------------------------------------------
  async updateSettings(partial: Partial<UserSettings>) {
    const updated = { ...get().settings, ...partial };
    set({ settings: updated });
    await writeData(SETTINGS_FILE, updated);
  },

  // -------------------------------------------------------------------------
  // resetSettings — back to defaults + persist
  // -------------------------------------------------------------------------
  async resetSettings() {
    const defaults = { ...DEFAULT_SETTINGS };
    set({ settings: defaults });
    await writeData(SETTINGS_FILE, defaults);
  },
}));
