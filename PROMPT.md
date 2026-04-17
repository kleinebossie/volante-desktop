# Deep Work F1 — Prompt Template & Vibe Coding Guide (Day 2)

> **Who is this for?** You — Joe. You have successfully finished v1.0. This is your new prompt template and workflow guide for adding features (Day 2 operations) safely without breaking your stable app.

---

## Table of Contents

- [Part 1: The "Day 2" Prompt Template](#part-1-the-day-2-prompt-template)
- [Part 2: The Branching Workflow](#part-2-the-branching-workflow)
- [Part 3: Avoiding Regressions](#part-3-avoiding-regressions)

---

# Part 1: The "Day 2" Prompt Template

Copy everything between the `---START---` and `---END---` markers below, fill in the blanks, and paste it into your AI coding agent.

---START---

## Role

You are an expert software engineer maintaining and extending a stable, completed desktop application called **Deep Work F1**.

## Project Context

This is a cross-platform desktop deep-work timer app. We have already reached v1.0, meaning the core engine, UI, and state management are **stable and working perfectly**.

Attached are:

1. `CONTEXT.md` (Read first to see our active feature branch status).
2. `ARCHITECTURE.md` (Read to understand our established patterns: Zustand, CSS Modules, Tauri).

## Your Task

We are implementing a new feature safely on a dedicated git branch.

**The Feature to build:**
_[Describe the feature from your ROADMAP.md, e.g., "Implement Sound Effects for regulations and penalties"]_

**Expected outcome for this session:**
_[e.g., "The app should play a success sound when the timer finishes, without breaking any existing timer logic."]_

## Critical Day-2 Rules

1. **Do NOT break v1.0**: Do not rewrite, refactor, or delete existing core logic (`sessionStore`, `timer` engine, state machines) unless absolutely 100% required for this feature.
2. **Follow Existing Patterns**: If you add a new store, use Zustand. If you add UI, use CSS Modules matching `index.css`.
3. **Keep it isolated**: If possible, build the new feature as an independent React hook or utility that plugs into the existing architecture rather than mangling the core engine.
4. **Update `CONTEXT.md`** at the end of your work with:
   - Updated Active Feature checklist.
   - Any new bugs discovered.
   - A session log entry.
5. **Explain your plan first** if the feature touches multiple core files.

## Additional Notes

_[Any extra context, preferences, or observations. Delete this section if not needed.]_

---END---

---

# Part 2: The Branching Workflow

Now that v1.0 is done, you MUST stop working directly on the `main` branch.

### Step 1: Create a feature branch

Before touching any code, open your terminal:

```bash
git checkout main
git pull
git checkout -b feature/name-of-your-feature
```

### Step 2: Vibe Code

Feed the AI the prompt above. Let it build the feature. Test it heavily.

### Step 3: Success or Abort?

**If it works perfectly:**

```bash
git add .
git commit -m "Added name-of-your-feature"
git checkout main
git merge feature/name-of-your-feature
```

**If the AI breaks the app and gets hopelessly confused:**

```bash
git checkout main
# Delete the branch and the mess
git branch -D feature/name-of-your-feature
# You are now back to stable v1.0! Try again from scratch.
```

---

# Part 3: Avoiding Regressions

A "regression" is when adding a new feature accidentally breaks an old feature that used to work.

1. **The "Plan First" Rule**: If a feature sounds complex, prompt the AI: _"I want to build [Feature]. Read ARCHITECTURE.md and list exactly which files you plan to modify. Do not write code yet."_ Review the plan. If it's touching files it shouldn't, tell it to find a less intrusive way.
2. **Small Commits**: Commit within your feature branch. If the AI gets 50% of the feature working, `git commit -m "Feature half working"`. Then ask it to finish the rest.
3. **Test the Core**: Whenever the AI finishes a feature, don't just test the feature. Start a normal race session, let the timer run, use a penalty, use a boost. Ensure the core app didn't break.
