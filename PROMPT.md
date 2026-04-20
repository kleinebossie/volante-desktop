# Deep Work F1 — Prompt Template & Vibe Coding Guide (v0 Stabilization)

> **Who is this for?** You — Joe. We are currently in the **v0 Stabilization Phase**. The core architecture is built, but it is NOT stable yet. Your goal right now is to fix bugs, squash errors, and get the app fully working before we officially stamp it as v1.0.

---

## Table of Contents

- [Part 1: The "Bug Fix" Prompt Template](#part-1-the-bug-fix-prompt-template)
- [Part 2: The Stabilization Workflow](#part-2-the-stabilization-workflow)
- [Part 3: Avoiding Regressions](#part-3-avoiding-regressions)

---

# Part 1: The "Bug Fix" Prompt Template

Copy everything between the `---START---` and `---END---` markers below, fill in the blanks, and paste it into your AI coding agent.

---START---

## Role

You are an expert software engineer stabilizing and debugging a desktop application called **Deep Work F1**. 

## Project Context

This is a cross-platform desktop deep-work timer app. We are currently in the **v0 stabilization phase**. The core features are built according to `ARCHITECTURE.md`, but the app is currently buggy and unstable. **Our sole focus is fixing bugs to reach a stable v1.0 release.** We are NOT adding new features right now.

Attached are:
1. `CONTEXT.md` (Read first to see our active bug list and current state).
2. `ARCHITECTURE.md` (Read to understand our established patterns: Zustand, CSS Modules, Tauri).

## Your Task

We are debugging and fixing a specific issue. 

**The Bug to fix:**
_[Describe the bug clearly. e.g., "When I click the Boost button, the timer speeds up but the cooldown bar never resets."]_

**Expected outcome for this session:**
_[e.g., "The cooldown bar should smoothly empty and the button should become clickable again after the cooldown period."]_

## Critical Stabilization Rules

1. **Fix, Don't Rewrite**: Do not rewrite or refactor entire files just to fix a small bug. Keep your footprint as small as possible.
2. **Follow Existing Patterns**: Maintain the patterns defined in `ARCHITECTURE.md`. Do not introduce new libraries or state management paradigms to solve a bug.
3. **Trace the Logic**: If the bug is in the engine, trace the state from the React component -> the Zustand store (`sessionStore.ts`) -> the engine logic files. 
4. **Update `CONTEXT.md`** at the end of your work with:
   - Move the bug from "Active Bugs" to "Resolved Bugs" with a summary of the fix.
   - Any new bugs you noticed while testing.
   - A session log entry.

## Additional Notes / Error Logs

_[Paste any terminal errors, console warnings, or extra context here. Delete this section if not needed.]_

---END---

---

# Part 2: The Stabilization Workflow

During this phase, you are a detective. You are looking for edge cases, race conditions, and logic errors.

### Step 1: Reproduce the Bug
Before you ask the AI to fix it, make sure you know exactly how to trigger the bug. "It crashes sometimes" is hard for the AI to fix. "It crashes when I click Pause twice rapidly" is easy.

### Step 2: Create a Fix Branch
Don't fix bugs directly on `main`. 
```bash
git checkout main
git checkout -b fix/describe-the-bug
```

### Step 3: Vibe Code the Fix
Feed the AI the prompt above. Let it trace the code and implement a fix. Test it heavily.

### Step 4: Verify and Merge
**If the bug is fixed and nothing else broke:**
```bash
git add .
git commit -m "Fixed [bug description]"
git checkout main
git merge fix/describe-the-bug
```

**If the AI breaks the app worse trying to fix it:**
```bash
git checkout main
git branch -D fix/describe-the-bug 
# Try again from scratch with a different AI model or prompt.
```

---

# Part 3: Avoiding Regressions

A "regression" is when fixing Bug A accidentally creates Bug B. This is the biggest risk during stabilization.

1. **Ask for an explanation first**: Prompt the AI: *"I want to fix [Bug]. Read ARCHITECTURE.md and the relevant files, and tell me exactly what is causing the bug and how you plan to fix it. Do not write code yet."* 
2. **Test the Core**: Whenever the AI fixes a bug, test the whole app, not just the fix. Start a normal race session, let the timer run, use a penalty, use a boost. Ensure the core app is still stable.
3. **Commit often**: `git commit -m "Partial fix working"` is your best friend.
