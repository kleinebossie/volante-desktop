# Deep Work F1 — Development Context (Day 2)

> **Purpose of this file**: This file tracks the active state of Deep Work F1 post-v0.1. It must be attached to every autonomous coding agent session. **Update this file after every coding session.**

---

## Last Updated

- **Date**: 2026-04-17
- **By**: GitHub Copilot (GPT-5.3-Codex)
- **Session summary**: Fixed circuit ordering so tracks now follow catalog/calendar order in the selector while still pinning favorites first; verified via build and dev launch.

---

## 1. Active Feature Development

<!--
  Update this section to reflect the current feature being built from ROADMAP.md.
  If you are just fixing a bug, write "Bug Fixing" here.
-->

- **Current Branch**: `main` (Stable)
- **Active Feature**: Bug Fixing
- **Status**: ✅ Completed

**Current Sub-tasks:**

- [x] Fix circuit ordering in `TrackSelector` to preserve catalog/calendar order
- [x] Verify with `npm run build`
- [x] Verify launch with `npm run tauri dev`

---

## 2. Active Bugs

<!--
  Track all known bugs here. Include:
  - Bug ID (incrementing number, e.g., BUG-101)
  - Description and Steps to reproduce
  - Severity: 🔴 Critical · 🟡 Medium · 🟢 Low
-->

| ID      | Severity  | Description                                                                                                             | Likely Files                                     | Status |
| ------- | --------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------ |
| BUG-101 | 🟢 Low    | Tauri warns that bundle identifier ends with `.app`, which may conflict with macOS bundle naming recommendations.       | `src-tauri/tauri.conf.json`                      | Open   |
| BUG-102 | 🟢 Low    | Vite warns that the main JS chunk is over 500 kB after minification. Not a runtime failure, but worth optimizing later. | `vite.config.ts`, `src/App.tsx`                  | Open   |
| BUG-103 | 🟡 Medium | Circuit order in the track selector was incorrect (alphabetical instead of catalog/calendar order).                     | `src/components/TrackSelector/TrackSelector.tsx` | Fixed  |

---

## 3. Technical Debt & Shortcuts (To Fix Later)

| Item   | What Was Done                                                              | What Should Be Done                                                                       | Priority |
| ------ | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | -------- |
| TD-101 | Generated additional iOS/Android icon assets during Tauri icon generation. | Decide whether to keep cross-platform icon folders in git or prune to Linux-only outputs. | Low      |

---

## 4. File Inventory (Core Architecture)

<!-- Quick reference map for the agent -->

| Directory/File    | Purpose                                                                 |
| ----------------- | ----------------------------------------------------------------------- |
| `ARCHITECTURE.md` | Core architectural rules — DO NOT DEVIATE from these patterns.          |
| `ROADMAP.md`      | Feature backlog and priority list.                                      |
| `src/stores/`     | Zustand state stores (`sessionStore`, `settingsStore`, `historyStore`). |
| `src/engine/`     | Core pure-logic engine (`timer`, `regulations`, `penalties`).           |
| `src/components/` | Reusable UI components.                                                 |
| `src/screens/`    | Main views (`Setup`, `Race`, `Summary`).                                |

---

## 5. Environment & Setup Notes

- **OS**: Ubuntu 24.04 (Linux x86_64)
- **Node.js**: v24.11.1 (`export PATH="$HOME/.nvm/versions/node/v24.11.1/bin:$PATH"`)
- **Rust/Cargo**: 1.94.1 (`source "$HOME/.cargo/env"`)
- **Dev Command**: `npm run tauri dev`
- **Build Command**: `npm run build` then `npm run tauri build`

---

## 6. Questions & Decisions Pending

| #   | Question           | Context | Answer | Answered By |
| --- | ------------------ | ------- | ------ | ----------- |
| _—_ | _No questions yet_ | _—_     | _—_    | _—_         |

---

## 7. Session Log (Post v0.1)

<!-- Add entries chronologically -->

- **2026-04-17 — Circuit order bugfix (by Copilot):**
  - Root cause: selector logic sorted tracks alphabetically when favorites were equal.
  - Fix: changed ordering logic to preserve `TRACKS` catalog order and only pin favorites to the top.
  - File changed: `src/components/TrackSelector/TrackSelector.tsx`.
  - Verification:
    - `npm run build` -> success.
    - `npm run tauri dev` -> Vite + Tauri startup successful.

- **2026-04-17 — Phase 12 Build & Package completed (by Copilot):**
  - Ran `npm run tauri build` successfully.
  - Produced bundles:
    - `src-tauri/target/release/bundle/deb/Deep Work F1_0.1.0_amd64.deb`
    - `src-tauri/target/release/bundle/rpm/Deep Work F1-0.1.0-1.x86_64.rpm`
    - `src-tauri/target/release/bundle/appimage/Deep Work F1_0.1.0_amd64.AppImage`
  - Verified startup of built binaries with timed smoke runs (release binary and AppImage both stayed alive during checks).
  - Regenerated icons with `npm run tauri icon src-tauri/icons/icon.png`.
  - Verification rerun results:
    - `npm run test` -> 20/20 tests passed.
    - `npm run build` -> success.
    - `npm run tauri dev` -> Vite + Tauri startup successful.

---

## 9. Phase Status (Current)

| Phase | Step | Description                                      | Status  |
| ----- | ---- | ------------------------------------------------ | ------- |
| 12    | 12.1 | Production package build (`npm run tauri build`) | ✅ Done |
| 12    | 12.2 | Launch verification of built app                 | ✅ Done |
| 12    | 12.3 | Production smoke testing (non-dev path)          | ✅ Done |
| 12    | 12.4 | App icon generation                              | ✅ Done |

---

## 10. New Files Created This Session

| Path                        | Reason                                        |
| --------------------------- | --------------------------------------------- |
| `src-tauri/icons/64x64.png` | Generated by Tauri icon tool                  |
| `src-tauri/icons/android/`  | Android icon set generated by Tauri icon tool |
| `src-tauri/icons/ios/`      | iOS icon set generated by Tauri icon tool     |

---

## 8. Agent Instructions (Day 2 Workflow)

1. **Protect the Baseline**: We are working on a stable v0.1 application. Do NOT refactor core state management (`sessionStore`) or core engine logic unless absolutely required by the new feature.
2. **Follow the Architecture**: Ensure any new features strictly adhere to the patterns established in `ARCHITECTURE.md` (Zustand for state, CSS Modules for styling, modular hooks).
3. **Branch Awareness**: We should be working on a dedicated `feature/*` branch. If we break something, we can abort the branch.
4. **Update this Context**: Update the Active Feature sub-tasks, bugs, and add a session log entry at the end of your work.
5. **No Hallucinated Packages**: Do not add new npm dependencies without explicit user permission.
