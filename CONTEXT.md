# Deep Work F1 — Development Context

> **Purpose of this file**: This file is a living document that tracks the current state of the Deep Work F1 project. It must be attached to every autonomous coding agent session so the agent knows exactly where the project stands, what works, what's broken, and what to do next. **Update this file after every coding session.**

---

## Last Updated

- **Date**: 2026-04-14
- **By**: AI Agent (Antigravity / Claude Sonnet 4.6 Thinking)
- **Session summary**: Completed Phase 3: State Management Stores — steps 3.1–3.4. Created `settingsStore.ts` (load/save persistence), `sessionStore.ts` (full session lifecycle + tick + regulations + penalties), `historyStore.ts` (past sessions, 100-cap, persisted). Wired persistence in `App.tsx` via `useEffect` on mount. `tsc --noEmit` passes 0 errors; `npm run build` succeeds (41 modules).

---

## 1. Current Development Phase

| Phase | Name | Status |
|-------|------|--------|
| 0 | Project Scaffolding | ✅ Complete |
| 1 | Foundation — Types, Data, Design System | ✅ Complete |
| 2 | Static Data — Tracks and Seasons | ✅ Complete |
| 3 | State Management Stores | ✅ Complete |
| 4 | Engine — Core Logic | ⬜ Not Started |
| 5 | Track Renderer Component | ⬜ Not Started |
| 6 | Setup Screen | ⬜ Not Started |
| 7 | Race Screen | ⬜ Not Started |
| 8 | Summary Screen | ⬜ Not Started |
| 9 | Settings Screen | ⬜ Not Started |
| 10 | App Shell & View Router | ⬜ Not Started |
| 11 | Polish & Bugs | ⬜ Not Started |
| 12 | Build & Package | ⬜ Not Started |

**Status legend**: ⬜ Not Started · 🔨 In Progress · ✅ Complete · ⚠️ Blocked

**Current active phase**: Phase 4 — Engine: Core Logic — **Not yet started**

**Current active sub-step**: _None — ready to begin Phase 4_

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

---

## 3. What's Partially Working

- **Rust compilation**: Cargo builds Rust successfully WITH the new Rust 1.94 toolchain, but fails due to missing system -dev packages. The Rust edition2024 compatibility issue was resolved by installing Rust 1.94.1 via rustup.

---

## 4. Known Bugs

### Active Bugs

| ID | Severity | Description | Likely Files | Status |
|----|----------|-------------|--------------|--------|
| _—_ | _—_ | _No active bugs_ | _—_ | _—_ |

### Resolved Bugs

| ID | Severity | Description | Fix Summary | Resolved Date |
|----|----------|-------------|-------------|---------------|
| BUG-R01 | 🔴 Critical | Rust 1.75 (system apt) too old — `edition2024` feature not supported by `dlopen2_derive-0.4.3` (Tauri dependency). | Installed Rust 1.94.1 via rustup (`curl https://sh.rustup.rs | sh`). New toolchain at `~/.cargo/bin/`. | 2026-04-13 |
| BUG-R02 | 🟡 Medium | `create-tauri-app --force` deleted ARCHITECTURE.md, CONTEXT.md, PROMPT.md from the project root. | Files recovered from git history using `git show HEAD:<file>`. | 2026-04-13 |
| BUG-R03 | 🟡 Medium | Invalid permission `fs:allow-app-read-write` in `capabilities/default.json` — this permission doesn't exist in tauri-plugin-fs v2.5. Build failed with "Permission not found" error. | Removed the invalid permission. `fs:default` is sufficient. | 2026-04-13 |

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

| Item | What Was Done | What Should Be Done | Priority |
|------|--------------|---------------------|----------|
| App.css as placeholder | Used a simplified App.css for Phase 0 placeholder. Not proper CSS Modules. | Replace with `src/index.css` (full design system) in Phase 1. | Phase 1 |
| App.tsx placeholder | Minimal placeholder component — not using CSS Modules pattern. | Replace with real view-router App.tsx using CSS Modules in Phase 10. | Phase 10 |

---

## 7. Dependencies & Versions

### Frontend (npm)

| Package | Installed Version | Notes |
|---------|------------------|-------|
| `react` | 19.1.0 | Via create-tauri-app scaffold |
| `react-dom` | 19.1.0 | Via create-tauri-app scaffold |
| `@tauri-apps/api` | ^2 | Via create-tauri-app scaffold |
| `@tauri-apps/plugin-opener` | ^2 | Via create-tauri-app scaffold |
| `@tauri-apps/plugin-fs` | ^2 | Installed manually (Step 0.2) |
| `zustand` | 5.0.12 | State management (Step 0.2) |
| `uuid` | 13.0.0 | UUID generation (Step 0.2) |
| `date-fns` | 4.1.0 | Date/time formatting (Step 0.2) |
| `framer-motion` | 12.38.0 | Animations (Step 0.2) |
| `typescript` | ~5.8.3 | Via create-tauri-app scaffold |
| `vite` | ^7.0.4 | Via create-tauri-app scaffold |
| `@types/uuid` | ^10.0.0 | TypeScript types for uuid (Step 0.2) |

### Backend (Cargo / Rust)

| Crate | Installed Version | Notes |
|-------|------------------|-------|
| `tauri` | 2.x | Via create-tauri-app scaffold |
| `tauri-plugin-fs` | 2.5.0 | Filesystem access (Step 0.4) |
| `tauri-plugin-opener` | 2.x | Via create-tauri-app scaffold |
| `serde` | 1.x | JSON serialization |
| `serde_json` | 1.x | JSON parsing |

### System Requirements Installed

| Tool | Version | How Installed |
|------|---------|---------------|
| Node.js | v24.11.1 | Via ~/.nvm (run: add to PATH manually on each session) |
| Rust | 1.94.1 | Via rustup (`~/.cargo/bin/rustc`) |
| Cargo | 1.94.1 | Via rustup (`~/.cargo/bin/cargo`) |

> **⚠️ Important PATH note**: Always prefix commands with `export PATH="$HOME/.nvm/versions/node/v24.11.1/bin:$HOME/.cargo/bin:$PATH"` or source `$HOME/.cargo/env` to get the correct Node 24 and Rust 1.94 versions. The system defaults are Node 18 and Rust 1.75 — both too old.

---

## 8. File Inventory

| File Path | Purpose | Status |
|-----------|---------|--------|
| `ARCHITECTURE.md` | Master architecture & build plan | Stable |
| `CONTEXT.md` | This file — development state tracker | Stable |
| `PROMPT.md` | AI session prompt template | Reference only |
| `index.html` | HTML entry point — has Google Fonts | Stable |
| `package.json` | Frontend npm dependencies | Stable |
| `vite.config.ts` | Vite build configuration | Stable (scaffold default) |
| `tsconfig.json` | TypeScript configuration | Stable (scaffold default) |
| `src/App.tsx` | Root React component — Phase 0 placeholder | Draft |
| `src/App.css` | Phase 0 placeholder styles | Draft (replaced by index.css in Phase 1) |
| `src/index.css` | Global design system — CSS variables, reset, base | ✅ Created Phase 1 |
| `src/main.tsx` | React/DOM entry point — imports index.css | Stable |
| `src/types/track.ts` | Track TypeScript interface | ✅ Created Phase 1 |
| `src/types/regulations.ts` | RegulationConfig, SeasonRuleset, PenaltyConfig types | ✅ Created Phase 1 |
| `src/types/session.ts` | Session, SessionEvent, SessionState types | ✅ Created Phase 1 |
| `src/types/settings.ts` | UserSettings type + DEFAULT_SETTINGS constant | ✅ Created Phase 1 |
| `src/utils/formatTime.ts` | Time formatting utilities (formatMMSS, formatHHMMSS, etc.) | ✅ Created Phase 1 |
| `src/utils/storage.ts` | Tauri filesystem wrapper (readData / writeData) | ✅ Created Phase 1 |
| `scripts/extract-track-paths.ts` | One-off script that extracted SVG paths from f1-circuits-svg repo | ✅ Created Phase 2 |
| `src/data/tracks/trackPaths.ts` | **Auto-generated** — 160 SVG path `d` strings keyed by layoutId (CC-BY-4.0) | ✅ Created Phase 2 |
| `src/data/tracks/trackCatalog.ts` | All 24 F1 2026 calendar tracks with full metadata | ✅ Created Phase 2 |
| `src/data/tracks/index.ts` | TRACKS array + getTrackById / getTrackByLayoutId helpers | ✅ Created Phase 2 |
| `src/data/seasons/season2026.ts` | 2026 ruleset: Boost (⚡) + Overtake (🏁) | ✅ Created Phase 2 |
| `src/data/seasons/season2025.ts` | 2025 ruleset: DRS (🔓) + Overtake (🏁) | ✅ Created Phase 2 |
| `src/data/seasons/index.ts` | SEASONS array + getSeasonByYear helper | ✅ Created Phase 2 |
| `src/stores/settingsStore.ts` | UserSettings Zustand store — load/save to settings.json | ✅ Created Phase 3 |
| `src/stores/sessionStore.ts` | Active session Zustand store — full lifecycle, tick, regulations, penalties | ✅ Created Phase 3 |
| `src/stores/historyStore.ts` | Past sessions Zustand store — load/save to history.json, 100-cap | ✅ Created Phase 3 |
| `src-tauri/tauri.conf.json` | Tauri app config (title, window size, identifier) | Stable |
| `src-tauri/Cargo.toml` | Rust dependencies | Stable |
| `src-tauri/src/lib.rs` | Tauri plugin registration | Stable |
| `src-tauri/capabilities/default.json` | Tauri permissions (fs, opener) | Stable |

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

| # | Question | Context | Answer | Answered By |
|---|----------|---------|--------|-------------|
| 1 | Should we use Node v24.11.1 (available via nvm) or wait for the user to update system Node? | System Node is 18.19.1 which is below the required >=20. The nvm version works fine. | Using nvm Node v24 via explicit PATH | Agent decision |

---

## 11. Testing Status

### Unit Tests

| Module | Tests Written | Tests Passing | Notes |
|--------|--------------|--------------|-------|
| _None_ | — | — | Unit tests planned for Phase 4 |

### Manual Testing

| Feature | Last Tested | Result | Notes |
|---------|------------|--------|-------|
| Frontend build (`npm run build`) | 2026-04-14 | ✅ Pass | 0 errors, 41 modules (Phase 3 stores included) |
| `tsc --noEmit` full type-check | 2026-04-14 | ✅ Pass | 0 errors across all Phase 2 + Phase 3 files |
| Rust `cargo check` | 2026-04-13 | ✅ Pass | All 512 crates compiled, no errors |
| `npm run tauri dev` | 2026-04-13 | ✅ Pass | App window opens, no errors, compiled in 36s |

---

## 12. Session Log

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
