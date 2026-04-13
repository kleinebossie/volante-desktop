# Deep Work F1 — Development Context

> **Purpose of this file**: This file is a living document that tracks the current state of the Deep Work F1 project. It must be attached to every autonomous coding agent session so the agent knows exactly where the project stands, what works, what's broken, and what to do next. **Update this file after every coding session.**

---

## Last Updated

- **Date**: 2026-04-13
- **By**: AI Agent (Antigravity / Claude Sonnet 4.6)
- **Session summary**: Completed Phase 0: Project Scaffolding in full (steps 0.1–0.8). `npm run tauri dev` launches successfully — the Deep Work F1 window opens with no errors.

---

## 1. Current Development Phase

| Phase | Name | Status |
|-------|------|--------|
| 0 | Project Scaffolding | ✅ Complete |
| 1 | Foundation — Types, Data, Design System | ⬜ Not Started |
| 2 | Static Data — Tracks and Seasons | ⬜ Not Started |
| 3 | State Management Stores | ⬜ Not Started |
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

**Current active phase**: Phase 1 — Foundation (Types, Data, Design System) — **Not yet started**

**Current active sub-step**: _None — ready to begin Phase 1_

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
- **Frontend build**: `npm run build` (Vite + TypeScript) compiles cleanly — 0 errors.
- **Project scaffold**: Full Tauri v2 + React 19 + TypeScript 5 project structure created.
- **Configuration**: `tauri.conf.json` configured with correct window title, size, and identifier.
- **Rust dependencies**: `tauri-plugin-fs` added to Cargo.toml and registered in `lib.rs`.
- **Capabilities**: Filesystem permissions configured in `src-tauri/capabilities/default.json`.
- **Fonts**: Google Fonts (Inter + JetBrains Mono) linked in `index.html`.
- **Boilerplate**: Default Tauri/Vite demo content replaced with F1-themed placeholder.

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
| `src/App.css` | Global styles — Phase 0 placeholder only | Draft |
| `src/main.tsx` | React/DOM entry point | Stable |
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
| Frontend build (`npm run build`) | 2026-04-13 | ✅ Pass | 0 errors, 29 modules transformed |
| Rust `cargo check` | 2026-04-13 | ✅ Pass | All 512 crates compiled, no errors |
| `npm run tauri dev` | 2026-04-13 | ✅ Pass | App window opens, no errors, compiled in 36s |

---

## 12. Session Log

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
