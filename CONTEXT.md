# Deep Work F1 — Development Context

> **Purpose of this file**: This file is a living document that tracks the current state of the Deep Work F1 project. It must be attached to every autonomous coding agent session so the agent knows exactly where the project stands, what works, what's broken, and what to do next. **Update this file after every coding session.**

---

## Last Updated

- **Date**: 2026-04-17
- **By**: AI Agent (GitHub Copilot)
- **Session summary**: Completed Phase 7 steps 7.1 to 7.6. Created `Timer`, `LapCounter`, `CooldownBar`, `RegulationButton`, `PenaltyIndicator`, and assembled `RaceScreen` with `TrackRenderer` and derived session progress data. Verified repeatedly with `npm run build` (0 errors each run) and `npm run tauri dev` startup checks.

---

## 1. Current Development Phase

| Phase | Name                                    | Status         |
| ----- | --------------------------------------- | -------------- |
| 0     | Project Scaffolding                     | ✅ Complete    |
| 1     | Foundation — Types, Data, Design System | ✅ Complete    |
| 2     | Static Data — Tracks and Seasons        | ✅ Complete    |
| 3     | State Management Stores                 | ✅ Complete    |
| 4     | Engine — Core Logic                     | ✅ Complete    |
| 5     | Track Renderer Component                | ✅ Complete    |
| 6     | Setup Screen                            | ✅ Complete    |
| 7     | Race Screen                             | 🔨 In Progress |
| 8     | Summary Screen                          | ⬜ Not Started |
| 9     | Settings Screen                         | ⬜ Not Started |
| 10    | App Shell & View Router                 | ⬜ Not Started |
| 11    | Polish & Bugs                           | ⬜ Not Started |
| 12    | Build & Package                         | ⬜ Not Started |

**Status legend**: ⬜ Not Started · 🔨 In Progress · ✅ Complete · ⚠️ Blocked

**Current active phase**: Phase 7 — Race Screen — **In Progress**

**Current active sub-step**: _7.6 complete — next: 7.7 (`useTimer` wiring)_

**Phase 7 sub-step status**:

- [x] 7.1 Create `Timer` component (large countdown display)
- [x] 7.2 Create `LapCounter` component
- [x] 7.3 Create `RegulationButton` component (with cooldown bar)
- [x] 7.4 Create `CooldownBar` sub-component
- [x] 7.5 Create `PenaltyIndicator` component (penalty feed)
- [x] 7.6 Create `RaceScreen` assembling all components + `TrackRenderer`
- [ ] 7.7 Wire up `useTimer` hook — start the `requestAnimationFrame` loop
- [ ] 7.8 Wire up `useRegulations` hook — button clicks
- [ ] 7.9 Wire up `usePenaltyDetection` hook — unfocus/idle detection
- [ ] 7.10 Add PAUSE/RESUME functionality
- [ ] 7.11 Add ABANDON with confirmation dialog
- [ ] 7.12 Style regulation buttons with state-dependent visual feedback
- [ ] 7.13 Add animation effects (regulation activation glow, penalty flash)

**Phase 6 sub-step status** (all complete):

- [x] 6.1 Create `TrackSelector` component (scrollable card grid)
- [x] 6.2 Create `DurationPicker` component
- [x] 6.3 Create `StrategyNote` component
- [x] 6.4 Create `SetupScreen` assembling all sub-components
- [x] 6.5 Wire up to session store's `createSession`
- [x] 6.6 Style everything per design system
- [x] 6.7 Add season selector dropdown
- [x] 6.8 Add penalty trigger toggles
- [x] 6.9 Add START RACE button with validation
- [x] Verified: `npm run build` 0 errors; `npm run tauri dev` launches successfully.

**Phase 5 sub-step status** (all complete):

- [x] 5.1 Create `src/components/TrackRenderer/TrackRenderer.tsx` — SVG track rendering with invisible measurement path, glow+outline+racing-line path layers
- [x] 5.2 Implement car position via `useTrackProgress` hook → `getPointAtLength` SVG DOM API
- [x] 5.3 Add car rotation — `rotate(angle)` in SVG transform so car always faces forward
- [x] 5.4 Track styled: outer glow layer (18px semi-transparent), track outline (8px white-15%), racing line (2px accent color)
- [x] 5.5 Glow/shadow effects via CSS `filter: drop-shadow` on car; glow path layer on track
- [x] 5.6 Tested with hardcoded 10s animation loop in `App.tsx` — visual confirmed ✅ car moves around Silverstone
- [x] Verified: `tsc --noEmit` 0 errors; `npm run build` succeeds — 46 modules

**Phase 4 sub-step status** (all complete):

- [x] 4.1 Create `src/engine/sessionStateMachine.ts` — Pure state-transition map + helpers: `canTransition()`, `getValidTransitions()`, `isTerminalState()`, `isActiveState()`, `isTickingState()`
- [x] 4.2 Create `src/engine/progressCalculator.ts` — `calculateEffectiveProgress()`, `calculateLapInfo()` (with `BASE_LAP_SECONDS=300`), `calculateOverallProgress()`, `calculateRemainingSec()`
- [x] 4.3 Create `src/engine/regulationsEngine.ts` — `canActivateRegulation()`, `getRegulationState()`, `getCooldownRemainingSec()`, `getCooldownProgress()`, `getActiveRegulationRemainingSec()`, `getActiveRegulationProgress()`, `getRemainingUses()`, `calculateInterruptionPenalty()`, `getRegulationConfig()`
- [x] 4.4 Create `src/engine/penaltyDetector.ts` — `createIdleDetector()` (document event listeners with auto-repeat), `createUnfocusDetector()` (Tauri `onFocusChanged` with 3s grace period + browser fallback), `getPenaltyAmount()`, `isPenaltyEnabled()`
- [x] 4.5 Create `src/engine/timer.ts` — `createTimer()` factory returning start/stop/pause/resume controls, rAF-based loop with 1s deltaMs safety cap
- [x] 4.6 Create `src/hooks/useTimer.ts` — React hook bridging rAF timer to session store `tick()`; auto-starts/pauses/stops based on session state
- [x] 4.7 Create `src/hooks/useRegulations.ts` — React hook providing `RegulationInfo[]` (button state, cooldowns, uses) + `activate()` / `deactivate()` actions
- [x] 4.8 Create `src/hooks/usePenaltyDetection.ts` — React hook wiring idle + unfocus detectors to `applyPenalty()`; handles regulation interruption penalties
- [x] 4.9 Create `src/hooks/useTrackProgress.ts` — React hook computing car (x, y, angle) from SVG path ref + lap progress fraction
- [x] 4.10 Create `src/utils/interpolatePath.ts` — `getPointAtProgress()` (x/y/angle via SVG `getPointAtLength`), `getStartPoint()`, `getPathLength()`, `getTrailPoints()` (for progress trail)
- [x] Verified: `tsc --noEmit` 0 errors; `npm run build` succeeds — 41 modules

**Phase 3 sub-step status** (all complete):

- [x] 3.1 Create `src/stores/settingsStore.ts` — UserSettings store with `loadSettings()` / `updateSettings()` / `resetSettings()`, persisted to `settings.json`
- [x] 3.2 Create `src/stores/sessionStore.ts` — Full session lifecycle (create/start/pause/resume/complete/abandon), `tick()` for timer advancement, `activateRegulation()` / `deactivateRegulation()`, `applyPenalty()`, `addEvent()`; bonus helper `activateRegulationWithConfig()` exported for Phase 4 hooks
- [x] 3.3 Create `src/stores/historyStore.ts` — Past sessions array, persisted to `history.json`, 100-session cap with oldest-first pruning
- [x] 3.4 Wired persistence in `App.tsx` — `useEffect` on mount calls `loadSettings()` + `loadHistory()` asynchronously; placeholder UI preserved for Phase 10
- [x] Verified: `tsc --noEmit` 0 errors; `npm run build` succeeds — 41 modules transformed

**Phase 2 sub-step status** (all complete):

- [x] 2.1 Clone `julesr0y/f1-circuits-svg` to `/tmp/f1-circuits-svg`
- [x] 2.2 Create `scripts/extract-track-paths.ts`
- [x] 2.3 Run extraction script → generated `src/data/tracks/trackPaths.ts` (160 circuits, all 24 required layouts present)
- [x] 2.4 Delete cloned repo (`rm -rf /tmp/f1-circuits-svg`)
- [x] 2.5 Create `src/data/tracks/trackCatalog.ts` (all 24 tracks with metadata)
- [x] 2.6 Create `src/data/tracks/index.ts` (TRACKS array + getTrackById / getTrackByLayoutId helpers)
- [x] 2.7 Create `src/data/seasons/season2026.ts` (Boost + Overtake)
- [x] 2.8 Create `src/data/seasons/season2025.ts` (DRS + Overtake)
- [x] 2.9 Create `src/data/seasons/index.ts` (SEASONS registry + getSeasonByYear + DEFAULT_SEASON_YEAR)
- [x] 2.10 Verified: `tsc --noEmit` passes 0 errors; `npm run build` succeeds

**Phase 1 sub-step status** (all complete):

- [x] 1.1 Create `src/types/track.ts`
- [x] 1.2 Create `src/types/regulations.ts`
- [x] 1.3 Create `src/types/session.ts`
- [x] 1.4 Create `src/types/settings.ts`
- [x] 1.5 Create `src/index.css` with full design system (colors, typography, reset)
- [x] 1.6 Create `src/utils/formatTime.ts`
- [x] 1.7 Create `src/utils/storage.ts` (Tauri filesystem wrapper)
- [x] 1.8 Verify types compile with `npm run build` — ✅ 0 errors, 30 modules transformed

**Phase 0 sub-step status** (all complete):

- [x] 0.1 Run `create-tauri-app` with react-ts template
- [x] 0.2 Install additional npm packages (`zustand`, `uuid`, `date-fns`, `framer-motion`, `@types/uuid`, `@tauri-apps/plugin-fs`)
- [x] 0.3 Configure `tauri.conf.json` (window size 1100×750, title "Deep Work F1", min 900×650)
- [x] 0.4 Add `tauri-plugin-fs` to Cargo.toml and register in `lib.rs`
- [x] 0.5 Configure Tauri capabilities/permissions for filesystem access (`fs:default`, `fs:allow-app-read-write`)
- [x] 0.6 Add Google Fonts link to `index.html` (Inter + JetBrains Mono)
- [x] 0.7 Verify `npm run tauri dev` launches successfully — ✅ Window opens, no errors, `Finished` in 36s
- [x] 0.8 Clean up scaffolded boilerplate (placeholder App.tsx and App.css)

---

## 2. What Works Right Now

- **`npm run tauri dev` launches**: App window opens with title "Deep Work F1", dark background, 🏎 placeholder — confirmed working.
- **Frontend build**: `npm run build` (Vite + TypeScript) compiles cleanly — 0 errors, 41 modules.
- **Project scaffold**: Full Tauri v2 + React 19 + TypeScript 5 project structure created.
- **Configuration**: `tauri.conf.json` configured with correct window title, size, and identifier.
- **Rust dependencies**: `tauri-plugin-fs` added to Cargo.toml and registered in `lib.rs`.
- **Capabilities**: Filesystem permissions configured in `src-tauri/capabilities/default.json`.
- **Fonts**: Google Fonts (Inter + JetBrains Mono) linked in `index.html`.
- **Boilerplate**: Default Tauri/Vite demo content replaced with F1-themed placeholder.
- **TypeScript types**: All 4 type definition files created (`track.ts`, `regulations.ts`, `session.ts`, `settings.ts`).
- **Design system CSS**: `src/index.css` created with full CSS variables, reset, and base styles.
- **Utility modules**: `formatTime.ts` (time formatting) and `storage.ts` (Tauri fs wrapper) created.
- **State stores**: `settingsStore.ts`, `sessionStore.ts`, `historyStore.ts` — all created and wired. Settings and history auto-load from disk on app start.
- **Engine modules**: `sessionStateMachine.ts` (state transitions), `progressCalculator.ts` (lap/progress math), `regulationsEngine.ts` (activation logic, cooldowns, button states), `penaltyDetector.ts` (idle + unfocus detection), `timer.ts` (rAF timer loop).
- **Utility modules (Phase 4)**: `interpolatePath.ts` (SVG path point interpolation for car positioning).
- **React hooks**: `useTimer.ts` (timer ↔ store bridge), `useRegulations.ts` (regulation button state + actions), `usePenaltyDetection.ts` (penalty detection wiring), `useTrackProgress.ts` (car position calculation).
- **Race UI components (Phase 7.1–7.6)**: `Timer`, `LapCounter`, `CooldownBar`, `RegulationButton`, `PenaltyIndicator`, and `RaceScreen` assembly with `TrackRenderer` are implemented and compiling cleanly.

---

## 3. What's Partially Working

- **Rust compilation**: Cargo builds Rust successfully WITH the new Rust 1.94 toolchain, but fails due to missing system -dev packages. The Rust edition2024 compatibility issue was resolved by installing Rust 1.94.1 via rustup.

---

## 4. Known Bugs

### Active Bugs

| ID  | Severity | Description      | Likely Files | Status |
| --- | -------- | ---------------- | ------------ | ------ |
| _—_ | _—_      | _No active bugs_ | _—_          | _—_    |

### Resolved Bugs

| ID      | Severity    | Description                                                                                                                                                                          | Fix Summary                                                                                                                                              | Resolved Date |
| ------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| BUG-R01 | 🔴 Critical | Rust 1.75 (system apt) too old — `edition2024` feature not supported by `dlopen2_derive-0.4.3` (Tauri dependency).                                                                   | Installed Rust 1.94.1 via rustup. New toolchain at `~/.cargo/bin/`.                                                                                      | 2026-04-13    |
| BUG-R02 | 🟡 Medium   | `create-tauri-app --force` deleted ARCHITECTURE.md, CONTEXT.md, PROMPT.md from the project root.                                                                                     | Files recovered from git history using `git show HEAD:<file>`.                                                                                           | 2026-04-13    |
| BUG-R03 | 🟡 Medium   | Invalid permission `fs:allow-app-read-write` in `capabilities/default.json` — this permission doesn't exist in tauri-plugin-fs v2.5. Build failed with "Permission not found" error. | Removed the invalid permission. `fs:default` is sufficient.                                                                                              | 2026-04-13    |
| BUG-R04 | 🟡 Medium   | Progress trail behind the car is drawn with jagged, angled lines across corners instead of following the track curve perfectly.                                                      | Replaced `getTrailPoints` polyline calculation with an identical SVG `<path>` using `stroke-dasharray` and `stroke-dashoffset` for pixel-perfect curves. | 2026-04-14    |

---

## 5. Known Errors & Warnings

### Build/Compile Errors

- None — all cleared.

### Console Warnings

- None

### Linter Issues

- None

---

## 6. Technical Debt & Shortcuts

| Item                   | What Was Done                                                              | What Should Be Done                                                  | Priority |
| ---------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------- | -------- |
| App.css as placeholder | Used a simplified App.css for Phase 0 placeholder. Not proper CSS Modules. | Replace with `src/index.css` (full design system) in Phase 1.        | Phase 1  |
| App.tsx placeholder    | Minimal placeholder component — not using CSS Modules pattern.             | Replace with real view-router App.tsx using CSS Modules in Phase 10. | Phase 10 |

---

## 7. Dependencies & Versions

### Frontend (npm)

| Package                     | Installed Version | Notes                                |
| --------------------------- | ----------------- | ------------------------------------ |
| `react`                     | 19.1.0            | Via create-tauri-app scaffold        |
| `react-dom`                 | 19.1.0            | Via create-tauri-app scaffold        |
| `@tauri-apps/api`           | ^2                | Via create-tauri-app scaffold        |
| `@tauri-apps/plugin-opener` | ^2                | Via create-tauri-app scaffold        |
| `@tauri-apps/plugin-fs`     | ^2                | Installed manually (Step 0.2)        |
| `zustand`                   | 5.0.12            | State management (Step 0.2)          |
| `uuid`                      | 13.0.0            | UUID generation (Step 0.2)           |
| `date-fns`                  | 4.1.0             | Date/time formatting (Step 0.2)      |
| `framer-motion`             | 12.38.0           | Animations (Step 0.2)                |
| `typescript`                | ~5.8.3            | Via create-tauri-app scaffold        |
| `vite`                      | ^7.0.4            | Via create-tauri-app scaffold        |
| `@types/uuid`               | ^10.0.0           | TypeScript types for uuid (Step 0.2) |

### Backend (Cargo / Rust)

| Crate                 | Installed Version | Notes                         |
| --------------------- | ----------------- | ----------------------------- |
| `tauri`               | 2.x               | Via create-tauri-app scaffold |
| `tauri-plugin-fs`     | 2.5.0             | Filesystem access (Step 0.4)  |
| `tauri-plugin-opener` | 2.x               | Via create-tauri-app scaffold |
| `serde`               | 1.x               | JSON serialization            |
| `serde_json`          | 1.x               | JSON parsing                  |

### System Requirements Installed

| Tool    | Version  | How Installed                                          |
| ------- | -------- | ------------------------------------------------------ |
| Node.js | v24.11.1 | Via ~/.nvm (run: add to PATH manually on each session) |
| Rust    | 1.94.1   | Via rustup (`~/.cargo/bin/rustc`)                      |
| Cargo   | 1.94.1   | Via rustup (`~/.cargo/bin/cargo`)                      |

> **⚠️ Important PATH note**: Always prefix commands with `export PATH="$HOME/.nvm/versions/node/v24.11.1/bin:$HOME/.cargo/bin:$PATH"` or source `$HOME/.cargo/env` to get the correct Node 24 and Rust 1.94 versions. The system defaults are Node 18 and Rust 1.75 — both too old.

---

## 8. File Inventory

| File Path                                                     | Purpose                                                                     | Status                                   |
| ------------------------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------- |
| `ARCHITECTURE.md`                                             | Master architecture & build plan                                            | Stable                                   |
| `CONTEXT.md`                                                  | This file — development state tracker                                       | Stable                                   |
| `PROMPT.md`                                                   | AI session prompt template                                                  | Reference only                           |
| `index.html`                                                  | HTML entry point — has Google Fonts                                         | Stable                                   |
| `package.json`                                                | Frontend npm dependencies                                                   | Stable                                   |
| `vite.config.ts`                                              | Vite build configuration                                                    | Stable (scaffold default)                |
| `tsconfig.json`                                               | TypeScript configuration                                                    | Stable (scaffold default)                |
| `src/App.tsx`                                                 | Root React component — Phase 0 placeholder                                  | Draft                                    |
| `src/App.css`                                                 | Phase 0 placeholder styles                                                  | Draft (replaced by index.css in Phase 1) |
| `src/index.css`                                               | Global design system — CSS variables, reset, base                           | ✅ Created Phase 1                       |
| `src/main.tsx`                                                | React/DOM entry point — imports index.css                                   | Stable                                   |
| `src/types/track.ts`                                          | Track TypeScript interface                                                  | ✅ Created Phase 1                       |
| `src/types/regulations.ts`                                    | RegulationConfig, SeasonRuleset, PenaltyConfig types                        | ✅ Created Phase 1                       |
| `src/types/session.ts`                                        | Session, SessionEvent, SessionState types                                   | ✅ Created Phase 1                       |
| `src/types/settings.ts`                                       | UserSettings type + DEFAULT_SETTINGS constant                               | ✅ Created Phase 1                       |
| `src/utils/formatTime.ts`                                     | Time formatting utilities (formatMMSS, formatHHMMSS, etc.)                  | ✅ Created Phase 1                       |
| `src/utils/storage.ts`                                        | Tauri filesystem wrapper (readData / writeData)                             | ✅ Created Phase 1                       |
| `scripts/extract-track-paths.ts`                              | One-off script that extracted SVG paths from f1-circuits-svg repo           | ✅ Created Phase 2                       |
| `src/data/tracks/trackPaths.ts`                               | **Auto-generated** — 160 SVG path `d` strings keyed by layoutId (CC-BY-4.0) | ✅ Created Phase 2                       |
| `src/data/tracks/trackCatalog.ts`                             | All 24 F1 2026 calendar tracks with full metadata                           | ✅ Created Phase 2                       |
| `src/data/tracks/index.ts`                                    | TRACKS array + getTrackById / getTrackByLayoutId helpers                    | ✅ Created Phase 2                       |
| `src/data/seasons/season2026.ts`                              | 2026 ruleset: Boost (⚡) + Overtake (🏁)                                    | ✅ Created Phase 2                       |
| `src/data/seasons/season2025.ts`                              | 2025 ruleset: DRS (🔓) + Overtake (🏁)                                      | ✅ Created Phase 2                       |
| `src/data/seasons/index.ts`                                   | SEASONS array + getSeasonByYear helper                                      | ✅ Created Phase 2                       |
| `src/stores/settingsStore.ts`                                 | UserSettings Zustand store — load/save to settings.json                     | ✅ Created Phase 3                       |
| `src/stores/sessionStore.ts`                                  | Active session Zustand store — full lifecycle, tick, regulations, penalties | ✅ Created Phase 3                       |
| `src/stores/historyStore.ts`                                  | Past sessions Zustand store — load/save to history.json, 100-cap            | ✅ Created Phase 3                       |
| `src/engine/sessionStateMachine.ts`                           | Pure state-transition helpers (canTransition, isTerminal, etc.)             | ✅ Created Phase 4                       |
| `src/engine/progressCalculator.ts`                            | Lap calculation, overall progress, remaining time math                      | ✅ Created Phase 4                       |
| `src/engine/regulationsEngine.ts`                             | Activation checks, button states, cooldowns, interruption penalties         | ✅ Created Phase 4                       |
| `src/engine/penaltyDetector.ts`                               | Idle + unfocus detection with Tauri window API + browser fallback           | ✅ Created Phase 4                       |
| `src/engine/timer.ts`                                         | requestAnimationFrame-based timer loop with start/stop/pause/resume         | ✅ Created Phase 4                       |
| `src/utils/interpolatePath.ts`                                | SVG path point interpolation for car positioning on track                   | ✅ Created Phase 4                       |
| `src/hooks/useTimer.ts`                                       | React hook bridging rAF timer to session store tick()                       | ✅ Created Phase 4                       |
| `src/hooks/useRegulations.ts`                                 | React hook for regulation button state + activate/deactivate                | ✅ Created Phase 4                       |
| `src/hooks/usePenaltyDetection.ts`                            | React hook wiring idle/unfocus detectors to penalty system                  | ✅ Created Phase 4                       |
| `src/hooks/useTrackProgress.ts`                               | React hook computing car position from SVG path + progress                  | ✅ Created Phase 4                       |
| `src/components/TrackRenderer/TrackRenderer.tsx`              | SVG track renderer + animated car component                                 | ✅ Created Phase 5                       |
| `src/components/TrackRenderer/TrackRenderer.module.css`       | CSS Module: track glow, racing line, car drop-shadow, progress trail        | ✅ Created Phase 5                       |
| `src-tauri/tauri.conf.json`                                   | Tauri app config (title, window size, identifier)                           | Stable                                   |
| `src-tauri/Cargo.toml`                                        | Rust dependencies                                                           | Stable                                   |
| `src-tauri/src/lib.rs`                                        | Tauri plugin registration                                                   | Stable                                   |
| `src-tauri/capabilities/default.json`                         | Tauri permissions (fs, opener)                                              | Stable                                   |
| `src/components/TrackSelector/TrackSelector.tsx`              | Horizontal scrollable grid of track cards                                   | ✅ Created Phase 6                       |
| `src/components/TrackSelector/TrackSelector.module.css`       | TrackSelector styles                                                        | ✅ Created Phase 6                       |
| `src/components/DurationPicker/DurationPicker.tsx`            | Duration increment/decrement input                                          | ✅ Created Phase 6                       |
| `src/components/DurationPicker/DurationPicker.module.css`     | DurationPicker styles                                                       | ✅ Created Phase 6                       |
| `src/components/StrategyNote/StrategyNote.tsx`                | Strategy note text input + Parc Fermé toggle                                | ✅ Created Phase 6                       |
| `src/components/StrategyNote/StrategyNote.module.css`         | StrategyNote styles                                                         | ✅ Created Phase 6                       |
| `src/screens/SetupScreen/SetupScreen.tsx`                     | Complete Setup view combining all Phase 6 components                        | ✅ Created Phase 6                       |
| `src/screens/SetupScreen/SetupScreen.module.css`              | SetupScreen layout styles                                                   | ✅ Created Phase 6                       |
| `src/components/Timer/Timer.tsx`                              | Large mono countdown display component for race sessions                    | ✅ Created Phase 7.1                     |
| `src/components/Timer/Timer.module.css`                       | Timer component styles                                                      | ✅ Created Phase 7.1                     |
| `src/components/LapCounter/LapCounter.tsx`                    | Lap readout component (`current/total`)                                     | ✅ Created Phase 7.2                     |
| `src/components/LapCounter/LapCounter.module.css`             | LapCounter styles                                                           | ✅ Created Phase 7.2                     |
| `src/components/CooldownBar/CooldownBar.tsx`                  | Cooldown progress bar sub-component                                         | ✅ Created Phase 7.4                     |
| `src/components/CooldownBar/CooldownBar.module.css`           | CooldownBar styles                                                          | ✅ Created Phase 7.4                     |
| `src/components/RegulationButton/RegulationButton.tsx`        | Regulation action button (state text, timer, uses, cooldown bar)            | ✅ Created Phase 7.3                     |
| `src/components/RegulationButton/RegulationButton.module.css` | RegulationButton styles                                                     | ✅ Created Phase 7.3                     |
| `src/components/PenaltyIndicator/PenaltyIndicator.tsx`        | Penalty feed component from session events                                  | ✅ Created Phase 7.5                     |
| `src/components/PenaltyIndicator/PenaltyIndicator.module.css` | PenaltyIndicator styles                                                     | ✅ Created Phase 7.5                     |
| `src/screens/RaceScreen/RaceScreen.tsx`                       | Race screen assembling all Phase 7 components + TrackRenderer               | ✅ Created Phase 7.6                     |
| `src/screens/RaceScreen/RaceScreen.module.css`                | RaceScreen layout and responsive styles                                     | ✅ Created Phase 7.6                     |

---

## 9. Environment & Setup Notes

- **OS**: Ubuntu 24.04 (Linux x86_64)
- **Node.js version**: v24.11.1 (at `~/.nvm/versions/node/v24.11.1/bin/node`)
  - System Node is v18.19.1 — too old, do NOT use
  - To activate: `export PATH="$HOME/.nvm/versions/node/v24.11.1/bin:$PATH"`
- **Rust version**: 1.94.1 (at `~/.cargo/bin/rustc`)
  - System Rust is 1.75.0 — too old for Tauri v2 deps, do NOT use
  - To activate: `source "$HOME/.cargo/env"` or `export PATH="$HOME/.cargo/bin:$PATH"`
- **Tauri CLI version**: @tauri-apps/cli ^2 (npm)
- **IDE**: VS Code + GitHub Copilot
- **Special setup steps**:
  1. Run `export PATH="$HOME/.nvm/versions/node/v24.11.1/bin:$PATH"` before any npm commands
  2. Run `source "$HOME/.cargo/env"` before any cargo commands
  3. **PENDING USER ACTION**: Run `sudo apt-get install -y libwebkit2gtk-4.1-dev librsvg2-dev libgtk-3-dev libgdk-pixbuf-2.0-dev libssl-dev libayatana-appindicator3-dev libxdo-dev` to enable Tauri compilation

---

## 10. Questions & Decisions Pending

| #   | Question                                                                                    | Context                                                                              | Answer                               | Answered By    |
| --- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------ | -------------- |
| 1   | Should we use Node v24.11.1 (available via nvm) or wait for the user to update system Node? | System Node is 18.19.1 which is below the required >=20. The nvm version works fine. | Using nvm Node v24 via explicit PATH | Agent decision |

---

## 11. Testing Status

### Unit Tests

| Module | Tests Written | Tests Passing | Notes                          |
| ------ | ------------- | ------------- | ------------------------------ |
| _None_ | —             | —             | Unit tests planned for Phase 4 |

### Manual Testing

| Feature                            | Last Tested | Result  | Notes                                                                                        |
| ---------------------------------- | ----------- | ------- | -------------------------------------------------------------------------------------------- |
| Frontend build (`npm run build`)   | 2026-04-17  | ✅ Pass | Re-run after each Phase 7.1–7.6 major step; 0 errors every run                               |
| `tsc --noEmit` full type-check     | 2026-04-14  | ✅ Pass | 0 errors across all Phase 1–5 files                                                          |
| Visual: TrackRenderer car movement | 2026-04-14  | ✅ Pass | Red car moves smoothly around Silverstone; lap% counter updating                             |
| Rust `cargo check`                 | 2026-04-13  | ✅ Pass | All 512 crates compiled, no errors                                                           |
| `npm run tauri dev`                | 2026-04-17  | ✅ Pass | Re-run after each Phase 7.1–7.6 major step; startup reached `Running target/debug/tauri-app` |

---

## 12. Session Log

### Session 10 — 2026-04-17

**Duration**: ~25 minutes
**Phase**: Phase 7 — Race Screen (steps 7.1 to 7.6) — **PARTIAL PHASE COMPLETE**
**What was done**:

- Step 7.1: Created `src/components/Timer/Timer.tsx` and `Timer.module.css` with large monospace countdown display using `formatMMSS()`.
- Step 7.2: Created `src/components/LapCounter/LapCounter.tsx` and `LapCounter.module.css`.
- Steps 7.3 + 7.4: Created `src/components/RegulationButton/RegulationButton.tsx` and `src/components/CooldownBar/CooldownBar.tsx` plus both CSS modules. Regulation button supports visual states (`available`, `active`, `cooldown`, `depleted`, `locked`, `unavailable`), status text, countdown, uses-left display, and cooldown bar rendering.
- Step 7.5: Created `src/components/PenaltyIndicator/PenaltyIndicator.tsx` and CSS module. It reads `SessionEvent[]` and renders recent penalty feed entries.
- Step 7.6: Created `src/screens/RaceScreen/RaceScreen.tsx` and CSS module to assemble all new Phase 7 components with `TrackRenderer`, progress bar, strategy line, and conditional lap/penalty visibility from settings.
- Reused existing pure engine helpers in `progressCalculator` and `regulationsEngine` to derive lap, progress, timer, and regulation display state (without jumping ahead into Phase 7.7+ hook wiring).
- Verified after each major step with `npm run build` and `npm run tauri dev` startup checks.

**What's next**:

- Continue Phase 7 from step 7.7:
  - Wire `useTimer` into `RaceScreen`
  - Wire `useRegulations` button actions
  - Wire `usePenaltyDetection`
  - Implement pause/resume, abandon confirmation, and interaction animations

**Issues encountered**:

- None blocking. All newly created Phase 7.1–7.6 files compile successfully.

### Session 9 — 2026-04-17

**Duration**: ~10 minutes
**Phase**: Phase 6 — Setup Screen — **PHASE COMPLETE**
**What was done**:

- Steps 6.1 to 6.3: Created individual components `TrackSelector`, `DurationPicker`, and `StrategyNote` along with their `.module.css` files inside `src/components/`. Track selector renders all 24 tracks from `TRACKS`. Duration picker allows increment/decrement by 5 min.
- Steps 6.4 to 6.9: Created `src/screens/SetupScreen/SetupScreen.tsx` (and CSS). Assembled the sub-components. Added season selector dropdown and penalty trigger toggles mapping to the store's settings. Wired the `START RACE` button to `sessionStore.createSession()` and `startSession()`. Added recent sessions list pulling from `historyStore`.
- Verified steps 6.5 to 6.9: Ensured `SetupScreen` calls `createSession`, styled all elements with design system variables, confirmed Season dropdown maps `SEASONS`, confirmed Penalty toggles work, and added `disabled={!selectedTrackId}` validation for the Start Race button.
- Removed unused `React` imports to resolve TypeScript lint errors.
- Verified: `npm run build` succeeds (0 errors).
- Verified: `npm run tauri dev` launches application successfully.

**What's next**:

- Begin Phase 7: Race Screen
  - Create `Timer` component
  - Create `LapCounter` component
  - Create `RegulationButton` with `CooldownBar` sub-component
  - Create `PenaltyIndicator` component
  - Assemble `RaceScreen`

**Issues encountered**:

- TS6133 unused `React` import errors after file creation since React 17 automatic runtime is used. Easily resolved by removing `import React from 'react';` from new components.

---

### Session 8 — 2026-04-14

**Duration**: ~20 minutes
**Phase**: Phase 5 — Track Renderer Component — **PHASE COMPLETE**
**What was done**:

- Step 5.1 + 5.4: Created `src/components/TrackRenderer/TrackRenderer.module.css` — CSS Module with `.trackGlow` (18px faint outer halo), `.trackPath` (8px semi-transparent white track surface), `.racingLine` (2px accent color), `.progressTrail` (3px colored lap trail), `.startFinishLine` (perpendicular white cross-line), `.car` (drop-shadow glow filter), `.testLabel` (debug text). Verified with `tsc --noEmit` 0 errors.
- Step 5.1–5.5: Created `src/components/TrackRenderer/TrackRenderer.tsx` — Full component with 5 visual SVG layers: (1) invisible measurement path for `getPointAtLength` queries; (2) glow halo path; (3) white track outline; (4) accent-colored racing line; (5) progress trail polyline behind the car. Car is an SVG `<rect>` with cockpit highlight rectangle. Start/finish line is computed from path position 0. All positions computed via `useTrackProgress` hook (already built in Phase 4). Props: `pathD`, `lapProgress`, `accentColor`, `showDebugLabel`.
- Step 5.2: Car position uses `useTrackProgress(pathElement, lapProgress)` which calls `getPointAtProgress()` → SVG `getPointAtLength()` → exact {x, y, angle} at current lap fraction.
- Step 5.3: Car rotation implemented with SVG `transform="translate(x,y) rotate(angle) translate(-w/2,-h/2)"` — centers the car body on the path point and rotates it to face forward.
- Step 5.5: Glow effects via CSS `filter: drop-shadow(0 0 6px var(--color-accent-red)) drop-shadow(0 0 12px rgba(...))` on the car group; separate wide stroke glow path under the track.
- Step 5.6: Updated `App.tsx` to use animated `requestAnimationFrame` loop cycling `lapProgress` from 0→1 over 10 seconds. Also updated `App.css` `.app-shell` to column flex layout. Visual test confirmed: Silverstone circuit renders correctly with red car moving at 57.7% in screenshot 1, 38.6% in screenshot 2 (different cycle points). Trail visible behind car.
- Corrected track layout ID from `silverstone-2010` → `silverstone-8` (the correct key from `trackCatalog.ts`).
- **Phase 5 is now 100% complete** — all 6 sub-steps done.

**What's next**:

- Begin Phase 6: Setup Screen
  - Create `TrackSelector` component (scrollable card grid)
  - Create `DurationPicker` component
  - Create `StrategyNote` component
  - Assemble into `SetupScreen`, wire to `sessionStore.createSession()`

**Issues encountered**:

- Minor: Layout ID guessed wrong (`silverstone-2010` doesn't exist). Fixed by checking `trackCatalog.ts`. No impact.
- Layout: Track SVG renders in upper-left in the test view. This is expected — the Phase 0 `App.css` shell uses centered flexbox not well-suited for column layouts. Updated `.app-shell` to flex-direction column. This will be fully resolved in Phase 10.
- Bug: Progress trail drawn with `getTrailPoints` and `<polyline>` was jagged. Fixed by rendering a duplicate `<path>` utilizing `stroke-dasharray` and `stroke-dashoffset` to ensure flawlessly smooth, pixel-perfect curve tracking (BUG-R04).

---

### Session 7 — 2026-04-14

**Duration**: ~10 minutes
**Phase**: Phase 4 — Engine: Core Logic (steps 4.6–4.9) — **PHASE COMPLETE**
**What was done**:

- Step 4.6: Created `src/hooks/useTimer.ts` — React hook that bridges the rAF timer engine to the session store. Creates a `Timer` instance on mount, auto-starts/resumes when session is 'running', pauses when 'paused', stops when completed/abandoned/null. Cleans up on unmount. Uses `useRef` for stable timer reference. Subscribes to `session.state` only (minimal re-renders). Verified with `tsc --noEmit` 0 errors.
- Step 4.7: Created `src/hooks/useRegulations.ts` — React hook providing `UseRegulationsResult` with: `ruleset` (season lookup), `regulations` (array of `RegulationInfo` per button — state, canActivate, cooldown, active timer, remaining uses), `activeRegulation`, `activate(type)` (validates via engine then calls `activateRegulationWithConfig`), `deactivate()`. Uses `useMemo` for derived data and `useCallback` for stable handlers. Verified with `tsc --noEmit` 0 errors.
- Step 4.8: Created `src/hooks/usePenaltyDetection.ts` — React hook that creates idle + unfocus detectors on mount, starts/stops them based on session state, and applies penalties via `applyPenalty()`. Handles regulation interruption: if a regulation is active when a penalty fires, applies the enhanced penalty (base × multiplier), logs a `regulation_interrupted` event, and deactivates the regulation. Reads idle threshold from settings store. Verified with `tsc --noEmit` 0 errors.
- Step 4.9: Created `src/hooks/useTrackProgress.ts` — React hook that takes an SVG `<path>` ref + lap progress (0–1) and returns `{ x, y, angle }` for car positioning. Uses `useMemo` wrapping `getPointAtProgress()` from interpolatePath. Returns safe defaults when path ref is null. Verified with `tsc --noEmit` 0 errors.
- Full build verified: `npm run build` succeeds — 41 modules, 0 errors.
- **Phase 4 is now 100% complete** — all 10 sub-steps done.

**What's next**:

- Begin Phase 5: Track Renderer Component
  - Create `TrackRenderer` component with SVG rendering
  - Implement car position interpolation using `getPointAtLength`
  - Add car rotation, track styling, glow effects

**Issues encountered**:

- None. Steps 4.6–4.9 were clean.

---

### Session 6 — 2026-04-14

**Duration**: ~10 minutes
**Phase**: Phase 4 — Engine: Core Logic (steps 4.4, 4.5, 4.10)
**What was done**:

- Step 4.4: Created `src/engine/penaltyDetector.ts` — Penalty detection module with two factory functions. `createIdleDetector(thresholdMs, callback)` listens for `mousemove`, `keydown`, `click` on `document`; fires callback when user idles past threshold; auto-repeats while idle; has start/stop/destroy lifecycle. `createUnfocusDetector(graceMs, callback)` uses Tauri `getCurrentWindow().onFocusChanged()` API (with browser `blur`/`focus` fallback for dev mode); 3-second grace period before firing penalty. Also exports `getPenaltyAmount(trigger, config)` and `isPenaltyEnabled(trigger, enabledTriggers)` helper functions. Verified with `tsc --noEmit` 0 errors.
- Step 4.5: Created `src/engine/timer.ts` — requestAnimationFrame-based timer loop. `createTimer(onTick)` returns a Timer object with `start()`, `stop()`, `pause()`, `resume()`, `isRunning()`, `isPaused()`. On each frame, computes `deltaMs` since last frame and calls `onTick(deltaMs)`. Safety cap of 1000ms on deltaMs to prevent huge jumps (e.g. tab backgrounded). Pause keeps the rAF loop alive but skips processing and resets the timestamp baseline so resume doesn't get a massive delta. Verified with `tsc --noEmit` 0 errors.
- Step 4.10: Created `src/utils/interpolatePath.ts` — SVG path interpolation utilities for car positioning. `getPointAtProgress(pathElement, progress)` returns `{x, y, angle}` using `getPointAtLength()` + angle calculation via a 2-unit look-ahead. Also: `getStartPoint()` (position at 0), `getPathLength()`, `getTrailPoints(from, to, numPoints)` (generates point array for the progress trail behind the car). Verified with `tsc --noEmit` 0 errors.
- Full build verified: `npm run build` succeeds — 41 modules, 0 errors.

**What's next**:

- Continue Phase 4: steps 4.6–4.9
  - Create React hooks (`useTimer`, `useRegulations`, `usePenaltyDetection`, `useTrackProgress`)

**Issues encountered**:

- None. Steps 4.4, 4.5, 4.10 were clean.

---

### Session 5 — 2026-04-14

**Duration**: ~10 minutes
**Phase**: Phase 4 — Engine: Core Logic (steps 4.1–4.3)
**What was done**:

- Step 4.1: Created `src/engine/sessionStateMachine.ts` — Pure state-transition module. Defines a `VALID_TRANSITIONS` lookup table matching ARCHITECTURE.md §9.4.1 exactly (setup→running, running→paused/completed/abandoned, paused→running/abandoned). Exports: `canTransition(from, to)`, `getValidTransitions(from)`, `isTerminalState(state)`, `isActiveState(state)`, `isTickingState(state)`. No side effects. Verified with `tsc --noEmit` 0 errors.
- Step 4.2: Created `src/engine/progressCalculator.ts` — Pure math module for session progress. Constants: `BASE_LAP_SECONDS = 300` (a 25-min session on a factor-1.0 track yields 5 laps). Exports: `calculateEffectiveProgress()` (converts elapsed time + multiplier – penalties → effective seconds), `calculateLapInfo()` (returns currentLap, totalLaps, lapProgress 0–1), `calculateOverallProgress()` (overall 0–1 fraction), `calculateRemainingSec()`. Verified with `tsc --noEmit` 0 errors.
- Step 4.3: Created `src/engine/regulationsEngine.ts` — Pure regulations logic. Core: `canActivateRegulation(type, session, ruleset)` checks 5 conditions (season availability, active regulation, cooldown, usage limit, lockout matrix) and returns `{ allowed, reason? }`. Also exports: `getRegulationState()` (button visual state: available/active/cooldown/depleted/locked/unavailable), `getCooldownRemainingSec()`, `getCooldownProgress()` (for cooldown bar), `getActiveRegulationRemainingSec()`, `getActiveRegulationProgress()`, `getRemainingUses()`, `calculateInterruptionPenalty()`, `getRegulationConfig()`. Verified with `tsc --noEmit` 0 errors.
- Full build verified: `npm run build` succeeds — 41 modules, 0 errors.

**What's next**:

- Continue Phase 4: steps 4.4–4.10
  - Create `src/engine/penaltyDetector.ts`
  - Create `src/engine/timer.ts`
  - Create React hooks (`useTimer`, `useRegulations`, `usePenaltyDetection`, `useTrackProgress`)
  - Create `src/utils/interpolatePath.ts`

**Issues encountered**:

- None. Steps 4.1–4.3 were clean.

---

### Session 4 — 2026-04-14

**Duration**: ~20 minutes
**Phase**: Phase 3 — State Management Stores
**What was done**:

- Step 3.1: Created `src/stores/settingsStore.ts` — Zustand store for `UserSettings`. Implements `loadSettings()` (reads `settings.json`, merges over `DEFAULT_SETTINGS`), `updateSettings(partial)` (partial merge + persist), `resetSettings()` (restore defaults + persist). Verified with `tsc --noEmit` 0 errors.
- Step 3.2: Created `src/stores/sessionStore.ts` — Zustand store holding the active `Session | null`. Implements: `createSession()` (builds a fresh Session in 'setup' state with UUIDs, empty cooldowns/usageCounts/events), `startSession()` / `pauseSession()` / `resumeSession()` / `completeSession()` / `abandonSession()` (all guarded by a `canTransition()` state-machine check), `tick(deltaMs)` (called every animation frame — advances wall time, effective progress at current pace multiplier, checks for regulation expiry, auto-completes session at 100%), `activateRegulation()` / `deactivateRegulation()`, `applyPenalty(trigger, penaltySec)`, `addEvent()`. Bonus: exported `activateRegulationWithConfig()` helper for Phase 4 hooks so they can supply real durationSec/cooldownSec from season data.
- Step 3.3: Created `src/stores/historyStore.ts` — Zustand store for `Session[]`. Implements `loadHistory()` (reads `history.json`), `addSession(session)` (deduplicates by id, prepends new session, prunes to 100 entries, persists), `clearHistory()`.
- Step 3.4: Updated `src/App.tsx` — Added `useEffect(() => { loadSettings(); loadHistory(); }, [])` at the top of `App()`. Both are async fire-and-forget calls; they don't block rendering. Placeholder UI kept for Phase 10.
- Verified: `tsc --noEmit` 0 errors; `npm run build` succeeds — 41 modules transformed.

**What's next**:

- Begin Phase 4: Engine — Core Logic
  - Create `src/engine/sessionStateMachine.ts` (pure state-transition helpers)
  - Create `src/engine/progressCalculator.ts`
  - Create `src/engine/regulationsEngine.ts`
  - Create `src/engine/penaltyDetector.ts`
  - Create `src/engine/timer.ts`
  - Create React hooks (`useTimer`, `useRegulations`, `usePenaltyDetection`, `useTrackProgress`)
  - Create `src/utils/interpolatePath.ts`

**Issues encountered**:

- None. Phase 3 was clean.

---

### Session 3 — 2026-04-14

**Duration**: ~15 minutes
**Phase**: Phase 2 — Static Data (Tracks and Seasons)
**What was done**:

- Step 2.1: Cloned `julesr0y/f1-circuits-svg` repo to `/tmp/f1-circuits-svg`
- Step 2.2: Created `scripts/extract-track-paths.ts` (as specified in ARCHITECTURE.md §9.2.2)
- Step 2.3: Ran extraction via `npx ts-node scripts/extract-track-paths.ts` → generated `src/data/tracks/trackPaths.ts` with 160 circuit layouts; all 24 required 2026 calendar layouts confirmed present
- Step 2.4: Deleted cloned repo (`rm -rf /tmp/f1-circuits-svg`)
- Step 2.5: Created `src/data/tracks/trackCatalog.ts` — all 24 tracks with id, layoutId, name, countryId, countryName, flagEmoji, lapTimeFactor, accentColor
- Step 2.6: Created `src/data/tracks/index.ts` — TRACKS array, getTrackById(), getTrackByLayoutId()
- Step 2.7: Created `src/data/seasons/season2026.ts` — Boost (2x, 30s, unlimited) + Overtake (2.5x, 20s, 3 max)
- Step 2.8: Created `src/data/seasons/season2025.ts` — DRS (1.5x, 45s, unlimited) + Overtake (2.5x, 20s, 3 max)
- Step 2.9: Created `src/data/seasons/index.ts` — SEASONS[], getSeasonByYear(), DEFAULT_SEASON_YEAR=2026
- Step 2.10: `tsc --noEmit` passes 0 errors; `npm run build` succeeds
- **Bug fixed**: `src/types/track.ts` Phase 1 had simplified fields (country, city, svgPath, svgViewBox) that didn't match ARCHITECTURE.md §7.1. Updated to spec (layoutId, countryId, countryName, svgPathD).

**What's next**:

- Begin Phase 3: State Management Stores
  - Create `src/stores/settingsStore.ts`, `sessionStore.ts`, `historyStore.ts`
  - Wire persistence: settings load on app start, save on change

**Issues encountered**:

- Track type mismatch: Phase 1 built a simpler Track interface. Updated to match the full spec in ARCHITECTURE.md §7.1.

---

### Session 2 — 2026-04-14

**Duration**: ~20 minutes
**Phase**: Phase 1 — Foundation (Types, Data, Design System)
**What was done**:

- Created `src/types/track.ts` — Track and TrackPoint interfaces (step 1.1)
- Created `src/types/regulations.ts` — RegulationConfig, SeasonRuleset, PenaltyConfig, PenaltyTrigger types (step 1.2)
- Created `src/types/session.ts` — Session, SessionEvent, SessionState, SessionEventType types (step 1.3)
- Created `src/types/settings.ts` — UserSettings interface + DEFAULT_SETTINGS constant (step 1.4)
- Created `src/index.css` — full design system with CSS variables (colors, spacing, typography, shadows, transitions), global CSS reset, base body/input/button styles (step 1.5)
- Added `import './index.css'` to `src/main.tsx` so design system loads globally (step 1.5)
- Created `src/utils/formatTime.ts` — formatMMSS, formatHHMMSS, formatPenalty, formatMinutes, minutesToSeconds, secondsToMinutes (step 1.6)
- Created `src/utils/storage.ts` — readData/writeData using @tauri-apps/plugin-fs v2 API with BaseDirectory.AppData (step 1.7)
- Ran `npm run build` — 0 TypeScript errors, 30 modules, build successful (step 1.8)

**What's next**:

- Begin Phase 2: Static Data (Tracks and Seasons)

**Issues encountered**:

- None. Phase 1 was clean.

---

### Session 1 — 2026-04-13

**Duration**: ~1 hour
**Phase**: Phase 0 — Project Scaffolding
**What was done**:

- Ran `create-tauri-app` with `--force` flag to scaffold into existing directory (steps 0.1)
  - Note: `--force` deleted ARCHITECTURE.md, CONTEXT.md, PROMPT.md → recovered from git history
- Installed npm packages: zustand, uuid, date-fns, framer-motion, @types/uuid, @tauri-apps/plugin-fs (step 0.2)
- Updated `tauri.conf.json` with correct window title, size (1100×750), min size (900×650), identifier (step 0.3)
- Added `tauri-plugin-fs` to Cargo.toml via `cargo add` and registered in `lib.rs` (step 0.4)
- Updated `capabilities/default.json` to add `fs:default` and `fs:allow-app-read-write` (step 0.5)
- Added Google Fonts (Inter + JetBrains Mono) to `index.html`, updated page title (step 0.6)
- Cleaned up boilerplate — replaced default App.tsx demo content with F1 placeholder (step 0.8)
- Discovered system Rust (1.75) is too old → installed Rust 1.94.1 via rustup (bug BUG-R01 resolved)
- Discovered system dev packages missing (`libwebkit2gtk-4.1-dev` etc.) → BUG-001, user action needed

**What's next**:

- Begin Phase 1: Foundation (Types, Design System)
  - Create `src/types/track.ts`, `regulations.ts`, `session.ts`, `settings.ts`
  - Create `src/index.css` with full design system (CSS variables, fonts, reset)
  - Create `src/utils/formatTime.ts` and `src/utils/storage.ts`

**Issues encountered**:

- `create-tauri-app --force` deleted existing project files → recovered from git (BUG-R02)
- System Rust 1.75 incompatible with Tauri v2 → installed rustup + Rust 1.94 (BUG-R01)
- Invalid permission `fs:allow-app-read-write` in capabilities → removed it (BUG-R03)
- System dev packages (`libwebkit2gtk-4.1-dev` etc.) missing → user ran sudo apt-get install ✅

---

## 13. Agent Instructions

1. **Always read `ARCHITECTURE.md` first** if you need to understand the project structure, tech stack, data models, or build order. That file is the single source of truth for how to build this app.

2. **Check this file (`CONTEXT.md`) second** to understand what's already been done, what's broken, and what to work on next.

3. **Update this file at the end of every session**:
   - Update the "Last Updated" section at the top.
   - Update the phase table in Section 1.
   - Add/remove items from Sections 2-6 as needed.
   - Add a session log entry in Section 12.

4. **Do not skip phases**. Follow the build order in `ARCHITECTURE.md` Section 11 sequentially. Each phase depends on the previous one.

5. **When you encounter a bug**: Add it to Section 4 immediately with all known details. Don't wait until the end of the session.

6. **When you make a shortcut**: Add it to Section 6. Future you (or a future agent) will thank you.

7. **When you have a question for the human developer**: Add it to Section 10. Don't guess at product decisions.

8. **Test after every phase**. At minimum, verify the app still compiles and launches after each phase. Note the result in Section 11.

9. **Don't modify `idea.md` or `product-spec-v1.0.md`**. Those are reference documents.

10. **Don't modify `ARCHITECTURE.md`** unless you discover a genuine architectural issue that blocks development. If you must change it, document the change and rationale in a session log entry.

11. **PATH note for ALL commands**:
    - For npm/node: `export PATH="$HOME/.nvm/versions/node/v24.11.1/bin:$PATH"`
    - For cargo/rust: `source "$HOME/.cargo/env"` or `export PATH="$HOME/.cargo/bin:$PATH"`
    - The system-default Node (18) and Rust (1.75) are both too old and MUST NOT be used.
