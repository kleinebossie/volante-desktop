# Deep Work F1 — Development Context (v0 Stabilization)

> **Purpose of this file**: This file tracks the active state of Deep Work F1. We are currently in the **v0 Stabilization Phase**. The goal is to fix all bugs and reach a fully stable state for a v1.0 release. **Update this file after every coding session.**

---

## Last Updated

- **Date**: 2026-04-24
- **By**: GitHub Copilot (GPT-5.3-Codex)
- **Session summary**: Expanded in-race strategy controls so Parc Ferme OFF allows add, edit, and remove bullet notes, while Parc Ferme ON keeps the strategy locked.

---

## 1. Current Phase: Bug Fixing & Stabilization

- **Goal**: Reach zero critical/medium bugs to cut the v1.0 release.
- **Current Branch**: `main` (Stable baseline)
- **Active Bug/Task**: _None currently (BUG-001 through BUG-012 resolved)_

---

## 2. Active Bugs

<!--
  Track all known bugs here. Include:
  - Bug ID (incrementing number, e.g., BUG-001)
  - Description and Steps to reproduce
  - Severity: 🔴 Critical (Crashes/blocks usage) · 🟡 Medium (Feature broken) · 🟢 Low (Cosmetic)
-->

| ID  | Severity | Description                                      | Likely Files | Status |
| --- | -------- | ------------------------------------------------ | ------------ | ------ |
| _—_ | _—_      | _List bugs here as you find them during testing_ | _—_          | _—_    |

---

## 3. Resolved Bugs (v0)

| ID      | Severity  | Description                                                                                                                                                       | Fix Summary                                                                                                                                                                                                                                                                                          | Resolved Date |
| ------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| BUG-001 | 🟡 Medium | Settings changes (e.g., default duration, Parc Fermé) were saved in settings modal but Setup screen often kept stale values (favorites updated immediately).      | Updated `SetupScreen` hydration logic to resync each setup default field from `settingsStore` whenever that specific setting changes (while no setup session exists), instead of one-time hydration. This keeps Setup UI immediately in sync with settings changes.                                  | 2026-04-20    |
| BUG-002 | 🟢 Low    | In Settings, the "Default season ruleset" dropdown rendered with a white background and very light text on Linux, making the selected value hard to read.         | Updated `SettingsScreen.module.css` select styling to force consistent custom rendering (`appearance` overrides), match input background/text colors, and apply explicit option colors so the dropdown aligns visually with session duration and idle threshold fields.                              | 2026-04-20    |
| BUG-003 | 🟢 Low    | In Settings, the Favorite Tracks list had its own inner scrollbar, so not all tracks were visible at a glance inside the section.                                 | Updated `SettingsScreen.module.css` to remove the Favorite Tracks section-level `max-height` and `overflow-y` rules, so all tracks render in full and only the main settings modal handles scrolling.                                                                                                | 2026-04-20    |
| BUG-004 | 🟡 Medium | In Settings, clearing default session duration or idle threshold immediately snapped to a minimum value, preventing users from replacing the number naturally.    | Updated `SettingsScreen.tsx` number inputs to keep local draft text during typing, show red warnings when a typed value is invalid, and only on blur clamp out-of-range values to bounds (duration: 1-600, idle threshold: 10-3600) while restoring last saved values for empty entries.             | 2026-04-20    |
| BUG-005 | 🟢 Low    | In Setup screen penalty trigger checkboxes (Pause/App Unfocus/Idle), the checked glyph looked visually off-center and rough on Linux when toggled on.             | Updated `SetupScreen.module.css` checkbox styling to use a custom centered checkmark in checked state, with smoother activated visuals (red fill + subtle glow) while preserving existing behavior and logic.                                                                                        | 2026-04-24    |
| BUG-006 | 🟢 Low    | Checkbox styling was inconsistent across screens (Setup used custom polished checked style, while Settings and Strategy Note still used default browser styling). | Updated `SettingsScreen.module.css` and `StrategyNote.module.css` checkbox styles to match the approved Setup style exactly (custom centered checkmark, active red fill, subtle glow, and focus-visible ring), creating consistent checkbox visuals across the entire app.                           | 2026-04-24    |
| BUG-007 | 🟢 Low    | All checkbox controls should be pill-shaped toggles to match the app style and maintain a clean, consistent layout.                                               | Updated checkbox styling in `SetupScreen.module.css`, `SettingsScreen.module.css`, and `StrategyNote.module.css` from square checkboxes to pill toggles (track + sliding knob), keeping the existing color palette (dark inactive, red active, blue focus) and preserving all logic.                 | 2026-04-24    |
| BUG-008 | 🟢 Low    | Track selector scrollbar thumb looked unclear (black/outlined) and could remain visible briefly over the Settings modal after interacting with it.                | Updated `TrackSelector.module.css` with high-contrast custom scrollbar track/thumb styling and added an immediate hidden state. Wired `SetupScreen.tsx` to pass settings-open state into `TrackSelector.tsx`, which now disables horizontal overflow and hides the scrollbar while Settings is open. | 2026-04-24    |
| BUG-009 | 🟢 Low    | On Ubuntu/Linux, the TrackSelector scrollbar still rendered using native themed colors despite CSS styling, so the thumb remained hard to distinguish.            | Replaced native scrollbar styling in `TrackSelector` with a custom in-app scrollbar (track + draggable thumb), hid native scrollbars in all engines for that component, and kept the existing immediate-hide behavior when Settings opens to ensure consistent rendering across systems.             | 2026-04-24    |
| BUG-010 | 🟡 Medium | Strategy Note in Setup only supported a single plain text entry, so users could not build a session plan as multiple bullet points.                               | Updated `StrategyNote.tsx` to use Enter-to-commit note capture and display committed items as bullets under the input. Stored notes in the existing `strategyNote` string as newline-separated entries, then updated Race and Summary screens to render those entries as bullet lists consistently.  | 2026-04-24    |
| BUG-011 | 🟡 Medium | Parc Ferme setting had no practical effect during race because strategy notes could not be changed in either mode.                                                | Added `updateStrategyNote` in `sessionStore` with guards to allow edits only while running/paused and only when Parc Ferme is disabled. Updated `RaceScreen` to show an Enter-to-add strategy input when unlocked and a lock hint when locked, preserving existing strategy bullet rendering.        | 2026-04-24    |
| BUG-012 | 🟡 Medium | During race with Parc Ferme OFF, users could add strategy bullets but could not edit or remove existing ones, so strategy control was still incomplete.           | Updated `RaceScreen` to add tiny per-bullet Edit and Remove controls when unlocked, plus inline edit mode (Save/Cancel, Enter to save, Escape to cancel). Controls remain hidden/disabled under Parc Ferme ON, preserving lock behavior.                                                             | 2026-04-24    |

---

## 4. Technical Debt & Shortcuts (To Fix Before v1.0)

<!-- If the AI took a shortcut that makes the app fragile, log it here so it gets fixed before release -->

| Item | What Was Done | What Should Be Done | Priority |
| ---- | ------------- | ------------------- | -------- |
| _—_  | _—_           | _—_                 | _—_      |

---

## 5. File Inventory (Core Architecture)

<!-- Quick reference map for the agent -->

| Directory/File    | Purpose                                                                 |
| ----------------- | ----------------------------------------------------------------------- |
| `ARCHITECTURE.md` | Core architectural rules — DO NOT DEVIATE from these patterns.          |
| `src/stores/`     | Zustand state stores (`sessionStore`, `settingsStore`, `historyStore`). |
| `src/engine/`     | Core pure-logic engine (`timer`, `regulations`, `penalties`).           |
| `src/components/` | Reusable UI components.                                                 |
| `src/screens/`    | Main views (`Setup`, `Race`, `Summary`).                                |

---

## 6. Environment & Setup Notes

- **OS**: Ubuntu 24.04 (Linux x86_64)
- **Node.js**: v24.11.1 (`export PATH="$HOME/.nvm/versions/node/v24.11.1/bin:$PATH"`)
- **Rust/Cargo**: 1.94.1 (`source "$HOME/.cargo/env"`)
- **Dev Command**: `npm run tauri dev`
- **Build Command**: `npm run build` then `npm run tauri build`

---

## 7. Session Log (Stabilization)

<!-- Add entries chronologically -->

- **2026-04-20** — Fixed BUG-001 (Settings sync inconsistency)
  - Traced issue to `src/screens/SetupScreen/SetupScreen.tsx`: local setup form state was only hydrated once from settings due to a one-time guard.
  - Implemented targeted fix: split hydration into per-field effects (`duration`, `season`, `parc ferme`, `penalty triggers`) that react to settings changes immediately when no setup session is active.
  - Verified behavior via test/build commands in this session.

- **2026-04-20** — Fixed BUG-002 (Settings season dropdown contrast)
  - Traced issue to `src/screens/SettingsScreen/SettingsScreen.module.css`: the season `<select>` was using native Linux rendering for parts of the control, producing a white field with low-contrast text.
  - Implemented focused fix: added select appearance overrides and explicit select/option color styling so the control matches the session duration and idle threshold field visuals.
  - Verified stability with `npm run build` (successful).

- **2026-04-20** — Fixed BUG-003 (Favorite tracks inner scrolling)
  - Traced issue to `src/screens/SettingsScreen/SettingsScreen.module.css`: `.favoriteTracksGrid` used `max-height: 180px` plus `overflow-y: auto`, creating a nested scrollbar inside the settings modal.
  - Implemented focused fix: removed section-level scroll constraints so all favorite track options are visible at once, with scrolling handled only by the main settings modal.
  - Verified stability with `npm run build` (successful).

- **2026-04-20** — Fixed BUG-004 (Settings numeric input editing)
  - Traced issue to `src/screens/SettingsScreen/SettingsScreen.tsx`: both number inputs were controlled directly by store values and clamped on every keystroke, so deleting text immediately snapped to minimum values.
  - Implemented focused fix: introduced local draft string state for both fields so users can clear/type naturally, auto-persisted only valid values within required ranges (1-600 minutes, 10-3600 seconds), and restored previous saved value on blur when input is left empty/invalid.
  - Verified stability with `npm run build` (successful).

- **2026-04-20** — Follow-up tweak for BUG-004 (Out-of-range snapping)
  - Updated `src/screens/SettingsScreen/SettingsScreen.tsx` so entered values below minimum now snap to min and values above maximum snap to max for both numeric fields.
  - Preserved clear-to-edit behavior and empty-input fallback to last saved value on blur.
  - Verified stability with `npm run build` (successful).

- **2026-04-20** — Follow-up tweak for BUG-004 (Blur-only correction + warnings)
  - Updated `src/screens/SettingsScreen/SettingsScreen.tsx` to stop clamping while typing so users can freely edit textbox values.
  - Added inline red validation warnings for invalid values in both numeric settings fields via `src/screens/SettingsScreen/SettingsScreen.module.css`.
  - Kept correction behavior on blur only: below-min values snap to min, above-max values snap to max, and empty entries restore last saved values.
  - Verified stability with `npm run build` (successful).

- **2026-04-24** — Fixed BUG-005 (Penalty trigger checkbox checked-state visuals)
  - Traced issue to `src/screens/SetupScreen/SetupScreen.module.css`: native checkbox checked glyph rendering on Linux appeared visually off-center.
  - Implemented focused CSS-only fix: custom centered checkmark for checked state, plus subtle active red glow, with no logic/state changes.
  - Verified stability with `npm run build` (successful).

- **2026-04-24** — Fixed BUG-006 (Global checkbox style consistency)
  - Traced inconsistency to `src/screens/SettingsScreen/SettingsScreen.module.css` and `src/components/StrategyNote/StrategyNote.module.css`: these checkboxes were still using default browser rendering.
  - Implemented focused CSS-only fix: applied the exact approved checkbox style from Setup screen to all remaining checkbox classes for full UI consistency.
  - Verified stability with `npm run build` (successful).

- **2026-04-24** — Fixed BUG-007 (Convert all checkboxes to pill toggles)
  - Traced all checkbox usages to `src/screens/SetupScreen/SetupScreen.tsx`, `src/screens/SettingsScreen/SettingsScreen.tsx`, and `src/components/StrategyNote/StrategyNote.tsx`, all bound to `.checkbox` styles.
  - Implemented focused CSS-only fix in each corresponding module file: replaced square checkbox visuals with pill-shaped toggle tracks and sliding knobs, while preserving the existing red accent, dark backgrounds, blue focus outline, and all interaction logic.
  - Verified stability with `npm run build` (successful).

- **2026-04-24** — Fixed BUG-008 (Track selector scrollbar clarity + modal transition artifact)
  - Traced issue to `src/components/TrackSelector/TrackSelector.module.css` and `src/components/TrackSelector/TrackSelector.tsx`: horizontal scrollbar relied on low-contrast defaults and remained visible briefly during settings modal open after active drag interaction.
  - Implemented focused fix: added a clear high-contrast custom scrollbar style (solid visible track + red/orange thumb) and a `scrollAreaHidden` state that removes horizontal overflow and hides the scrollbar instantly.
  - Wired `src/screens/SetupScreen/SetupScreen.tsx` to pass `hideScrollbar={isSettingsOpen}` so opening Settings immediately hides the track-selector scrollbar.
  - Verified stability with `npm run build` (successful).

- **2026-04-24** — Fixed BUG-009 (Ubuntu/Linux native scrollbar theming override)
  - Traced follow-up issue to Linux WebKit/GTK native scrollbar rendering in `src/components/TrackSelector/TrackSelector.module.css`: pseudo-element styling was not consistently respected on Ubuntu, causing low-visibility thumb colors.
  - Implemented focused cross-platform fix in `src/components/TrackSelector/TrackSelector.tsx` and `src/components/TrackSelector/TrackSelector.module.css`: hide native scrollbar in this component and render a deterministic custom scrollbar with a high-contrast track and draggable thumb.
  - Preserved the BUG-008 behavior by continuing to hide the scrollbar immediately whenever Settings is open.
  - Verified stability with `npm run build` (successful).

- **2026-04-24** — Fixed BUG-010 (Strategy Note multi-bullet support)
  - Traced issue to `src/components/StrategyNote/StrategyNote.tsx`: input was bound directly to a single string value, with no way to commit and display multiple note items.
  - Implemented focused fix: introduced a local draft input and Enter-to-commit behavior that appends each note as a newline-separated item in the existing `strategyNote` field, then renders committed notes as bullet points below the input.
  - Updated `src/screens/RaceScreen/RaceScreen.tsx` and `src/screens/SummaryScreen/SummaryScreen.tsx` to display newline-separated strategy notes as bullet lists for consistent session readouts.
  - Verified stability with `npm run build` (successful).

- **2026-04-24** — Fixed BUG-011 (Parc Ferme strategy edit behavior)
  - Traced issue to `src/screens/RaceScreen/RaceScreen.tsx` and `src/stores/sessionStore.ts`: strategy notes were display-only during race, so Parc Ferme ON/OFF produced no behavior difference.
  - Implemented focused fix in store and UI: added `updateStrategyNote` action with runtime guards (allowed only in running/paused and only when Parc Ferme is OFF), plus an Enter-to-add race strategy input shown only when unlocked.
  - Added regression coverage in `src/stores/sessionStore.test.ts` for both allowed (Parc Ferme OFF) and blocked (Parc Ferme ON) updates.
  - Verified stability with `npm run test -- src/stores/sessionStore.test.ts` and `npm run build` (successful).

- **2026-04-24** — Fixed BUG-012 (In-race strategy edit/remove controls)
  - Traced limitation in `src/screens/RaceScreen/RaceScreen.tsx`: race strategy supported add-only behavior and did not allow modifying previously entered bullets while unlocked.
  - Implemented focused UI fix: each strategy bullet now shows tiny Edit and Remove buttons when Parc Ferme is OFF, with inline edit mode and keyboard shortcuts (Enter save, Escape cancel).
  - Added guarded note-list update paths that continue to rely on `sessionStore.updateStrategyNote`, so Parc Ferme ON still blocks mutation.
  - Verified stability with `npm run test -- src/stores/sessionStore.test.ts` and `npm run build` (successful).

---

## 8. Agent Instructions (Stabilization Workflow)

1. **Fix, Don't Refactor**: We are trying to stabilize existing code. Do NOT undertake massive rewrites of the core engine or state stores just to fix a single bug, unless the current implementation is fundamentally broken.
2. **Follow the Architecture**: Ensure any bug fixes strictly adhere to the patterns established in `ARCHITECTURE.md`.
3. **Branch Awareness**: We should be working on a dedicated `fix/*` branch. If we break something worse, we can abort the branch.
4. **Update this Context**: Move fixed bugs from the "Active Bugs" table to the "Resolved Bugs" table. Add any new bugs discovered during testing. Add a session log entry at the end of your work.
5. **No New Features**: Do not add new features, UI components, or settings during this phase. Focus entirely on stability and correctness.
