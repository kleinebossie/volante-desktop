# Deep Work F1 — Development Context (Day 2)

> **Purpose of this file**: This file tracks the active state of Deep Work F1 post-v1.0. It must be attached to every autonomous coding agent session. **Update this file after every coding session.**

---

## Last Updated

- **Date**: _Not yet started_
- **By**: _N/A_
- **Session summary**: _N/A_

---

## 1. Active Feature Development

<!-- 
  Update this section to reflect the current feature being built from ROADMAP.md.
  If you are just fixing a bug, write "Bug Fixing" here.
-->

- **Current Branch**: `main` (Stable)
- **Active Feature**: _None currently_
- **Status**: ⬜ Not Started

**Current Sub-tasks:**
- [ ] Task 1
- [ ] Task 2

---

## 2. Active Bugs

<!--
  Track all known bugs here. Include:
  - Bug ID (incrementing number, e.g., BUG-101)
  - Description and Steps to reproduce
  - Severity: 🔴 Critical · 🟡 Medium · 🟢 Low
-->

| ID | Severity | Description | Likely Files | Status |
|----|----------|-------------|--------------|--------|
| _—_ | _—_ | _No known bugs in v1.0_ | _—_ | _—_ |

---

## 3. Technical Debt & Shortcuts (To Fix Later)

| Item | What Was Done | What Should Be Done | Priority |
|------|--------------|---------------------|----------|
| _—_ | _—_ | _—_ | _—_ |

---

## 4. File Inventory (Core Architecture)

<!-- Quick reference map for the agent -->

| Directory/File | Purpose |
|----------------|---------|
| `ARCHITECTURE.md` | Core architectural rules — DO NOT DEVIATE from these patterns. |
| `ROADMAP.md` | Feature backlog and priority list. |
| `src/stores/` | Zustand state stores (`sessionStore`, `settingsStore`, `historyStore`). |
| `src/engine/` | Core pure-logic engine (`timer`, `regulations`, `penalties`). |
| `src/components/` | Reusable UI components. |
| `src/screens/` | Main views (`Setup`, `Race`, `Summary`). |

---

## 5. Environment & Setup Notes

- **OS**: Ubuntu 24.04 (Linux x86_64)
- **Node.js**: v24.11.1 (`export PATH="$HOME/.nvm/versions/node/v24.11.1/bin:$PATH"`)
- **Rust/Cargo**: 1.94.1 (`source "$HOME/.cargo/env"`)
- **Dev Command**: `npm run tauri dev`
- **Build Command**: `npm run build` then `npm run tauri build`

---

## 6. Questions & Decisions Pending

| # | Question | Context | Answer | Answered By |
|---|----------|---------|--------|-------------|
| _—_ | _No questions yet_ | _—_ | _—_ | _—_ |

---

## 7. Session Log (Post v1.0)

<!-- Add entries chronologically -->

_No post-v1.0 sessions yet._

---

## 8. Agent Instructions (Day 2 Workflow)

1. **Protect the Baseline**: We are working on a stable v1.0 application. Do NOT refactor core state management (`sessionStore`) or core engine logic unless absolutely required by the new feature.
2. **Follow the Architecture**: Ensure any new features strictly adhere to the patterns established in `ARCHITECTURE.md` (Zustand for state, CSS Modules for styling, modular hooks).
3. **Branch Awareness**: We should be working on a dedicated `feature/*` branch. If we break something, we can abort the branch.
4. **Update this Context**: Update the Active Feature sub-tasks, bugs, and add a session log entry at the end of your work.
5. **No Hallucinated Packages**: Do not add new npm dependencies without explicit user permission.
