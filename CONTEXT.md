# Deep Work F1 — Development Context (v0 Stabilization)

> **Purpose of this file**: This file tracks the active state of Deep Work F1. We are currently in the **v0 Stabilization Phase**. The goal is to fix all bugs and reach a fully stable state for a v1.0 release. **Update this file after every coding session.**

---

## Last Updated

- **Date**: 2026-04-20
- **By**: GitHub Copilot (GPT-5.3-Codex)
- **Session summary**: Fixed Favorite Tracks selector in Settings to show all tracks without an inner scrollbar; scrolling is now handled only by the main settings modal.

---

## 1. Current Phase: Bug Fixing & Stabilization

- **Goal**: Reach zero critical/medium bugs to cut the v1.0 release.
- **Current Branch**: `main` (Stable baseline)
- **Active Bug/Task**: _None currently (BUG-001, BUG-002, and BUG-003 resolved)_

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

| ID      | Severity  | Description                                                                                                                                                  | Fix Summary                                                                                                                                                                                                                                                             | Resolved Date |
| ------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| BUG-001 | 🟡 Medium | Settings changes (e.g., default duration, Parc Fermé) were saved in settings modal but Setup screen often kept stale values (favorites updated immediately). | Updated `SetupScreen` hydration logic to resync each setup default field from `settingsStore` whenever that specific setting changes (while no setup session exists), instead of one-time hydration. This keeps Setup UI immediately in sync with settings changes.     | 2026-04-20    |
| BUG-002 | 🟢 Low    | In Settings, the "Default season ruleset" dropdown rendered with a white background and very light text on Linux, making the selected value hard to read.    | Updated `SettingsScreen.module.css` select styling to force consistent custom rendering (`appearance` overrides), match input background/text colors, and apply explicit option colors so the dropdown aligns visually with session duration and idle threshold fields. | 2026-04-20    |
| BUG-003 | 🟢 Low    | In Settings, the Favorite Tracks list had its own inner scrollbar, so not all tracks were visible at a glance inside the section.                            | Updated `SettingsScreen.module.css` to remove the Favorite Tracks section-level `max-height` and `overflow-y` rules, so all tracks render in full and only the main settings modal handles scrolling.                                                                   | 2026-04-20    |

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

---

## 8. Agent Instructions (Stabilization Workflow)

1. **Fix, Don't Refactor**: We are trying to stabilize existing code. Do NOT undertake massive rewrites of the core engine or state stores just to fix a single bug, unless the current implementation is fundamentally broken.
2. **Follow the Architecture**: Ensure any bug fixes strictly adhere to the patterns established in `ARCHITECTURE.md`.
3. **Branch Awareness**: We should be working on a dedicated `fix/*` branch. If we break something worse, we can abort the branch.
4. **Update this Context**: Move fixed bugs from the "Active Bugs" table to the "Resolved Bugs" table. Add any new bugs discovered during testing. Add a session log entry at the end of your work.
5. **No New Features**: Do not add new features, UI components, or settings during this phase. Focus entirely on stability and correctness.
