# Deep Work F1 — Development Context (v0 Stabilization)

> **Purpose of this file**: This file tracks the active state of Deep Work F1. We are currently in the **v0 Stabilization Phase**. The goal is to fix all bugs and reach a fully stable state for a v1.0 release. **Update this file after every coding session.**

---

## Last Updated

- **Date**: _Not yet started_
- **By**: _N/A_
- **Session summary**: _N/A_

---

## 1. Current Phase: Bug Fixing & Stabilization

- **Goal**: Reach zero critical/medium bugs to cut the v1.0 release.
- **Current Branch**: `main` (Stable baseline)
- **Active Bug/Task**: _None currently_

---

## 2. Active Bugs

<!--
  Track all known bugs here. Include:
  - Bug ID (incrementing number, e.g., BUG-001)
  - Description and Steps to reproduce
  - Severity: 🔴 Critical (Crashes/blocks usage) · 🟡 Medium (Feature broken) · 🟢 Low (Cosmetic)
-->

| ID | Severity | Description | Likely Files | Status |
|----|----------|-------------|--------------|--------|
| _—_ | _—_ | _List bugs here as you find them during testing_ | _—_ | _—_ |

---

## 3. Resolved Bugs (v0)

| ID | Severity | Description | Fix Summary | Resolved Date |
|----|----------|-------------|-------------|---------------|
| _—_ | _—_ | _—_ | _—_ | _—_ |

---

## 4. Technical Debt & Shortcuts (To Fix Before v1.0)

<!-- If the AI took a shortcut that makes the app fragile, log it here so it gets fixed before release -->

| Item | What Was Done | What Should Be Done | Priority |
|------|--------------|---------------------|----------|
| _—_ | _—_ | _—_ | _—_ |

---

## 5. File Inventory (Core Architecture)

<!-- Quick reference map for the agent -->

| Directory/File | Purpose |
|----------------|---------|
| `ARCHITECTURE.md` | Core architectural rules — DO NOT DEVIATE from these patterns. |
| `src/stores/` | Zustand state stores (`sessionStore`, `settingsStore`, `historyStore`). |
| `src/engine/` | Core pure-logic engine (`timer`, `regulations`, `penalties`). |
| `src/components/` | Reusable UI components. |
| `src/screens/` | Main views (`Setup`, `Race`, `Summary`). |

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

_No stabilization sessions yet._

---

## 8. Agent Instructions (Stabilization Workflow)

1. **Fix, Don't Refactor**: We are trying to stabilize existing code. Do NOT undertake massive rewrites of the core engine or state stores just to fix a single bug, unless the current implementation is fundamentally broken.
2. **Follow the Architecture**: Ensure any bug fixes strictly adhere to the patterns established in `ARCHITECTURE.md`.
3. **Branch Awareness**: We should be working on a dedicated `fix/*` branch. If we break something worse, we can abort the branch.
4. **Update this Context**: Move fixed bugs from the "Active Bugs" table to the "Resolved Bugs" table. Add any new bugs discovered during testing. Add a session log entry at the end of your work.
5. **No New Features**: Do not add new features, UI components, or settings during this phase. Focus entirely on stability and correctness.
