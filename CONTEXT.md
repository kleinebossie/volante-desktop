# Deep Work F1 — Development Context

> **Purpose of this file**: This file is a living document that tracks the current state of the Deep Work F1 project. It must be attached to every autonomous coding agent session so the agent knows exactly where the project stands, what works, what's broken, and what to do next. **Update this file after every coding session.**

---

## Last Updated

- **Date**: _Not yet started_
- **By**: _N/A_
- **Session summary**: _N/A_

---

## 1. Current Development Phase

<!-- 
  Update this section to reflect which build phase the project is currently in.
  Phases are defined in ARCHITECTURE.md Section 11 (Build Order).
  Mark the current phase and note any sub-steps completed.
-->

| Phase | Name | Status |
|-------|------|--------|
| 0 | Project Scaffolding | ⬜ Not Started |
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

**Current active phase**: _None — project not yet started_

**Current active sub-step**: _None_

---

## 2. What Works Right Now

<!--
  List every feature/component that is currently functional and verified.
  Be specific — "Setup screen renders" is better than "UI works."
  Remove items if they break later.
-->

- _Nothing yet — project not started_

---

## 3. What's Partially Working

<!--
  List features that are in progress or partially implemented.
  Note exactly what part works and what part doesn't.
-->

- _Nothing yet — project not started_

---

## 4. Known Bugs

<!--
  Track all known bugs here. Include:
  - Bug ID (incrementing number, e.g., BUG-001)
  - Description of the bug
  - Steps to reproduce (if known)
  - Severity: 🔴 Critical (blocks progress) · 🟡 Medium (needs fix before release) · 🟢 Low (cosmetic/minor)
  - Which file(s) are likely involved
  - Status: Open / Investigating / Fixed
  
  When a bug is fixed, move it to Section 4b (Resolved Bugs) with a note on the fix.
-->

### Active Bugs

| ID | Severity | Description | Likely Files | Status |
|----|----------|-------------|--------------|--------|
| _—_ | _—_ | _No bugs yet_ | _—_ | _—_ |

### Resolved Bugs

| ID | Severity | Description | Fix Summary | Resolved Date |
|----|----------|-------------|-------------|---------------|
| _—_ | _—_ | _No bugs yet_ | _—_ | _—_ |

---

## 5. Known Errors & Warnings

<!--
  Track compilation errors, console warnings, linter issues, etc.
  These are different from bugs — they're problems the developer/agent sees in the terminal
  or browser console, not user-facing issues.
-->

### Build/Compile Errors

- _None_

### Console Warnings

- _None_

### Linter Issues

- _None_

---

## 6. Technical Debt & Shortcuts

<!--
  Track any shortcuts, hacks, or "good enough for now" decisions made during development.
  These are things that work but should be improved later.
  Include why the shortcut was taken and what the ideal solution would be.
-->

| Item | What Was Done | What Should Be Done | Priority |
|------|--------------|---------------------|----------|
| _—_ | _—_ | _—_ | _—_ |

---

## 7. Dependencies & Versions

<!--
  Track the exact versions of all installed dependencies.
  Update this after every `npm install` or `cargo add`.
  This helps debug version conflicts.
-->

### Frontend (npm)

| Package | Installed Version | Notes |
|---------|------------------|-------|
| _Not installed yet_ | _—_ | _—_ |

### Backend (Cargo / Rust)

| Crate | Installed Version | Notes |
|-------|------------------|-------|
| _Not installed yet_ | _—_ | _—_ |

---

## 8. File Inventory

<!--
  List all project files that have been created or significantly modified.
  This gives the agent a quick map of what exists.
  Format: file path · purpose · status (draft / stable / needs-rework)
-->

| File Path | Purpose | Status |
|-----------|---------|--------|
| `ARCHITECTURE.md` | Master architecture & build plan | Stable |
| `CONTEXT.md` | This file — development state tracker | Stable |
| `idea.md` | Original project idea | Reference only |
| `product-spec-v1.0.md` | Product specification v1.0 | Reference only |

---

## 9. Environment & Setup Notes

<!--
  Any notes about the development environment, OS-specific quirks,
  paths, or configuration that the agent needs to know.
-->

- **OS**: _To be filled in_
- **Node.js version**: _To be filled in_
- **Rust version**: _To be filled in_
- **Tauri CLI version**: _To be filled in_
- **IDE**: VS Code + GitHub Copilot
- **Special setup steps**: _None yet_

---

## 10. Questions & Decisions Pending

<!--
  Track any open questions or decisions that need human input.
  The autonomous agent should list questions here rather than guessing.
-->

| # | Question | Context | Answer | Answered By |
|---|----------|---------|--------|-------------|
| _—_ | _No questions yet_ | _—_ | _—_ | _—_ |

---

## 11. Testing Status

<!--
  Track what's been tested and how.
-->

### Unit Tests

| Module | Tests Written | Tests Passing | Notes |
|--------|--------------|--------------|-------|
| _—_ | _—_ | _—_ | _—_ |

### Manual Testing

| Feature | Last Tested | Result | Notes |
|---------|------------|--------|-------|
| _—_ | _—_ | _—_ | _—_ |

---

## 12. Session Log

<!--
  After each coding session, add a brief entry here.
  This creates a chronological record of development progress.
  Format:
  
  ### Session [N] — [Date]
  **Duration**: ~X hours
  **Phase**: [Phase number and name]
  **What was done**:
  - Item 1
  - Item 2
  **What's next**:
  - Next item 1
  - Next item 2
  **Issues encountered**:
  - Issue 1 (and how it was resolved, or if it's still open)
-->

_No sessions yet._

---

## 13. Agent Instructions

<!--
  Standing instructions for the autonomous coding agent.
  These should be followed every time this file is loaded.
-->

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
