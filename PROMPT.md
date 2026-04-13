# Deep Work F1 — Prompt Template & Vibe Coding Guide

> **Who is this for?** You — Joe, a solo vibe-coder who wants to use AI coding agents effectively. This file has two parts:
> 1. A **fill-in-the-blank prompt template** you copy-paste into any AI agent session
> 2. A **complete guide** to vibe coding best practices, model selection, and workflow optimization

---

## Table of Contents

- [Part 1: Prompt Template](#part-1-prompt-template)
- [Part 2: What to Attach](#part-2-what-to-attach)
- [Part 3: Vibe Coding Best Practices](#part-3-vibe-coding-best-practices)
- [Part 4: Model Selection Guide](#part-4-model-selection-guide)
- [Part 5: Optimal Workflow](#part-5-optimal-workflow)
- [Part 6: Avoiding Model Limits](#part-6-avoiding-model-limits)
- [Part 7: Common Mistakes & How to Avoid Them](#part-7-common-mistakes--how-to-avoid-them)

---

# Part 1: Prompt Template

Copy everything between the `---START---` and `---END---` markers below, fill in the blanks, and paste it into your AI coding agent.

---START---

## Role

You are an expert software engineer building a desktop application called **Deep Work F1**. You are working with a solo developer who has little programming knowledge. Explain any technical decisions you make in simple terms.

## Project Context

This is a cross-platform desktop deep-work timer app themed around Formula 1 racing. The full architecture and technical specification is in `ARCHITECTURE.md`. The current development state is tracked in `CONTEXT.md`. Both files are attached.

**Read `CONTEXT.md` first** to understand what has already been built, what's broken, and where we are in the build process. Then reference `ARCHITECTURE.md` for all technical decisions, data models, and implementation details.

## Your Task

<!-- 
  FILL THIS IN — Be as specific as possible about what you want done.
  Good: "Implement Phase 4 of the build order (Engine - Core Logic). Create all 5 engine files and 4 hook files as specified in ARCHITECTURE.md Section 9."
  Bad: "Build the engine."
  
  Delete whichever examples below don't apply, and fill in your own:
-->

**What to build/fix/change:**
_[Describe exactly what you want done. Reference phase numbers and section numbers from ARCHITECTURE.md if applicable.]_

**Expected outcome when you're done:**
_[What should work when you're finished? E.g., "The app should launch and show the Setup Screen with all 6 track cards visible." or "Clicking the Boost button should activate a 2x pace multiplier for 30 seconds."]_

**Priority:**
_[What matters most if you run into time/complexity tradeoffs?]_

## Rules

1. **Follow `ARCHITECTURE.md` exactly** for all technical decisions — tech stack, file locations, data models, state management, styling approach. Do not deviate unless something is genuinely broken or impossible.
2. **Do NOT modify** `idea.md`, `product-spec-v1.0.md`, or `ARCHITECTURE.md`.
3. **Update `CONTEXT.md`** at the end of your work with:
   - Updated phase status table
   - Any new bugs discovered (with details)
   - Any new files created
   - A session log entry
4. **Test your work.** At minimum, verify the app compiles (`npm run build`) and launches (`npm run tauri dev`) after every major change.
5. **If something is unclear or requires a product decision**, add a question to `CONTEXT.md` Section 10 and move on to other work. Don't guess.
6. **Keep changes small and incremental.** Don't rewrite multiple files at once. Make one change, verify it works, then move to the next.
7. **Explain what you did** at the end in simple terms that a non-programmer can understand.

## Known Issues

<!--
  FILL THIS IN — Copy any active bugs or issues from CONTEXT.md Section 4, or note any specific problems you've observed.
  If there are no known issues, write "None currently."
-->

_[List any current bugs, errors, or issues the agent should be aware of, or write "None currently."]_

## Additional Notes

<!--
  FILL THIS IN (optional) — Anything else the agent should know.
  Examples:
  - "I tried doing X myself and it broke, here's the error: ..."
  - "I want the track cards to look like cards with rounded corners and a subtle glow"
  - "Don't worry about the Settings screen yet, focus only on the Race screen"
  - "The app currently crashes when I click the Boost button"
-->

_[Any extra context, preferences, or observations. Delete this section if not needed.]_

---END---

---

# Part 2: What to Attach

Every time you start a conversation with an AI coding agent, you need to give it the right context. Think of it like briefing a new contractor — they need the blueprints and the status report.

## Always Attach These Files

| File | Why | How |
|------|-----|-----|
| **`CONTEXT.md`** | Tells the agent what's already built, what's broken, where you are | Attach as file or paste contents |
| **`ARCHITECTURE.md`** | The complete blueprint — the agent references this for every decision | Attach as file or paste contents |

## Attach These When Relevant

| File | When to attach |
|------|---------------|
| **The specific file(s) you want changed** | When you're asking for changes to existing code. E.g., if you want to fix a bug in `RaceScreen.tsx`, attach that file. |
| **Error messages / screenshots** | When something is broken. Copy the full error from the terminal or take a screenshot. |
| **Files that are related to the change** | If you want to change the timer, also attach the session store. The agent needs to see how things connect. |

## When NOT to Attach Everything

- **Don't dump your entire codebase** into the chat. The agent gets overwhelmed and confused. Only attach what's relevant to the current task.
- **Don't attach `idea.md` or `product-spec-v1.0.md`** unless you're asking the agent to revisit a product decision. All the useful info from those files is already baked into `ARCHITECTURE.md`.

## Quick Reference: What to Attach Per Task Type

| Task Type | Attach |
|-----------|--------|
| "Start building Phase N" | `CONTEXT.md` + `ARCHITECTURE.md` |
| "Fix a bug" | `CONTEXT.md` + `ARCHITECTURE.md` + broken file(s) + error message |
| "Improve the UI of X screen" | `CONTEXT.md` + `ARCHITECTURE.md` + screen file + its CSS module |
| "Something looks wrong but I don't know what" | `CONTEXT.md` + `ARCHITECTURE.md` + screenshot + any error from terminal |
| "Review my code" | `CONTEXT.md` + the file(s) you want reviewed |

---

# Part 3: Vibe Coding Best Practices

## What is "Vibe Coding"?

Vibe coding means you're building software by describing what you want in plain English and letting an AI write the actual code. You're the **creative director and project manager** — the AI is your programmer. You don't need to understand every line of code, but you DO need to:

1. Know what you want
2. Describe it clearly
3. Test if it worked
4. Guide corrections when it didn't

## The Golden Rules

### Rule 1: One Thing at a Time

**The #1 mistake** vibe coders make is asking for too much at once. When you say "Build the entire Race Screen with all the buttons and the timer and the track and the penalties," the AI will:
- Try to do everything
- Make mistakes in multiple places
- Create a tangled mess that's hard to debug

**Instead**: Ask for one piece at a time:
1. "Create the Timer component that counts down from a given number of seconds"
2. "Now create the RegulationButton component"  
3. "Now create the RaceScreen that uses both"

Each step is small enough that if something goes wrong, you know exactly where.

### Rule 2: Always Test After Each Change

After the AI makes changes:
1. Run the app (`npm run tauri dev`)
2. Does it launch? 
3. Does the new thing work?
4. Did anything else break?

If the answer to any of these is "no," tell the AI immediately. Don't keep building on top of broken code. **Fix problems the moment they appear.**

### Rule 3: Describe the WHAT, Not the HOW

You don't need to tell the AI which JavaScript function to use. Tell it what you want to happen:

- ❌ Bad: "Use useEffect with a requestAnimationFrame callback that calculates deltaMs"
- ✅ Good: "The timer should count down smoothly from the session duration to zero, updating every frame"

The AI knows programming. You know what the product should do. Stay in your lane.

### Rule 4: Be Specific About What "Done" Looks Like

Always tell the AI what the expected outcome is:

- ❌ Bad: "Make the track renderer work"
- ✅ Good: "When I start a race session, I should see the Bahrain track outline on screen with a small red dot (the car) moving along the track path. The car should complete one full lap every ~5 minutes for a 25-minute session."

### Rule 5: When Stuck, Back Up

If the AI is going in circles trying to fix something and making it worse:
1. Stop the conversation
2. Undo the recent changes (use Git — we'll cover this below)
3. Start a **new conversation** with fresh context
4. Describe the problem differently

The AI doesn't get tired, but it does get confused. A fresh conversation clears the confusion.

### Rule 6: Use Git Like a Save Button

**Git is your undo button.** Learn these three commands:

```bash
# Save your current state (do this after every working change)
git add .
git commit -m "Describe what works now"

# Undo everything since your last save
git checkout .

# See what changed
git status
```

**Commit (save) after every phase or sub-step that works.** If the AI breaks something, you can always go back.

### Rule 7: Read Error Messages Out Loud

When you see a red error in the terminal, don't panic. Do this:
1. Copy the **entire** error message
2. Paste it to the AI
3. Say "I got this error after doing [what you just did]. Fix it."

The error message is a treasure map. The AI can usually fix the problem in one shot if it sees the full error.

### Rule 8: Don't Let the AI Overengineer

Sometimes the AI will suggest adding extra features, libraries, or "improvements" you didn't ask for. Resist this. Tell it:

> "Don't add anything I didn't ask for. Just do exactly what I describe."

Every extra thing is another thing that can break.

---

# Part 4: Model Selection Guide

You have access to multiple AI models. Each one has different strengths. Think of them as different specialists — you call the right one for the right job.

## Model Tiers — When to Use What

### 🏆 Tier 1: Heavy Lifting (Complex Implementation)

Use these for **building entire features, debugging hard problems, or working across multiple files.**

| Model | Best For | Strengths | Weaknesses |
|-------|----------|-----------|------------|
| **Claude 4.6 Opus** | Complex multi-file features, architecture decisions, debugging tricky bugs | Excellent at following long instructions, strong reasoning, great code quality, very careful | Slower, uses more of your quota |
| **GPT 5.3** | Same as above — alternative to Opus | Strong reasoning, good at complex tasks | Can sometimes over-explain |
| **GPT 5.3 Codex** | Pure coding tasks — building out Phase steps | Optimized specifically for code generation, fast | Less conversational, focused on code output |

**Use Tier 1 when:**
- Starting a new build phase
- Debugging a problem that spans multiple files
- The task requires understanding how several components interact
- You've been stuck and need a "smarter" model to figure it out

### 🥈 Tier 2: Daily Driver (Standard Tasks)

Use these for **routine coding, single-file changes, simple bug fixes, and styling work.**

| Model | Best For | Strengths | Weaknesses |
|-------|----------|-----------|------------|
| **Claude 4.6 Sonnet** | Everyday coding, component creation, CSS styling, simple bug fixes | Great balance of quality and speed, follows instructions well | Not ideal for very complex multi-file reasoning |
| **GPT 5.2** | Same as Sonnet — everyday tasks | Good all-rounder | Slightly less careful than 5.3 for complex work |
| **GPT 5.2 Codex** | Straightforward coding tasks, boilerplate generation | Fast, code-focused | Less nuanced reasoning |
| **Gemini 2.5 Pro** | Large context tasks, reviewing long files, research | Handles very large files/contexts well | May not be as precise for intricate code edits |

**Use Tier 2 when:**
- Creating a single component (e.g., "Build the DurationPicker component")
- Fixing a straightforward bug with a clear error message
- Styling and CSS work
- Making small changes to existing code

### 🥉 Tier 3: Quick Tasks (Simple/Cheap)

Use these for **tiny fixes, formatting, explanations, and file generation.**

| Model | Best For | Strengths | Weaknesses |
|-------|----------|-----------|------------|
| **Claude 4.5 Haiku** | Quick questions, tiny code fixes, formatting, generating boilerplate | Very fast, very cheap on quota | Not great for complex reasoning |
| **GPT OSS 20B** | Simple boilerplate, explanations | Light and fast | Limited capacity for complex code |
| **Gemini 2.0 Flash** | Quick answers, simple code generation | Very fast | Less sophisticated |

**Use Tier 3 when:**
- "What does this error mean?"
- "Format this list as a table"
- "Add a comment explaining this function"
- "Generate 5 more track color hex codes"
- Updating `CONTEXT.md` with session notes

## The Model Selection Flowchart

```
Is the task complex? (multiple files, tricky logic, debugging)
├── YES → Use Tier 1 (Opus / GPT 5.3 / GPT 5.3 Codex)
└── NO
    ├── Is it a normal coding task? (one component, one bug)
    │   ├── YES → Use Tier 2 (Sonnet / GPT 5.2 / Gemini Pro)
    │   └── NO
    │       └── It's a quick/simple task → Use Tier 3 (Haiku / Flash)
    └── Am I running low on quota for Tier 1?
        └── YES → Drop to Tier 2 and break the task into smaller pieces
```

## Model Switching Strategy

**Don't use the same model for everything.** Your Tier 1 models have usage limits. If you burn through Opus on a task that Sonnet could handle, you won't have Opus available when you actually need it.

Think of it like fuel management in an F1 race (fitting, right?):
- **Tier 1 is your limited boost fuel** — use it for the hardest corners
- **Tier 2 is your regular fuel** — use it for most of the race
- **Tier 3 is your electric battery recovery** — use it for the easy straights

---

# Part 5: Optimal Workflow

## The Session Workflow

This is the step-by-step process for a typical coding session:

### Before You Start

```
1. Open CONTEXT.md — read the current state
2. Decide what to work on (usually the next uncompleted phase/step)
3. Pick the right model (see Part 4)
4. Fill in the prompt template (see Part 1)
5. Attach the right files (see Part 2)
```

### During the Session

```
6. Send the prompt
7. Let the AI work
8. Test every change it makes
9. If something breaks → tell the AI, paste the error
10. If the AI is going in circles → stop, new conversation, fresh start
11. Git commit after every sub-step that works
```

### After the Session

```
12. Make sure CONTEXT.md is updated (the AI should have done this)
13. Verify it by reading through it — is it accurate?
14. Git commit the updated CONTEXT.md
15. Take a break!
```

## When to Start a New Conversation

Starting a new conversation clears the AI's memory, which is both good and bad. Here's when to do it:

### ✅ DO Start a New Conversation When:

| Situation | Why |
|-----------|-----|
| **You're starting a new build phase** | Clean slate = focused work |
| **The AI made a mess and you want to reset** | Fresh context avoids compounding errors |
| **The conversation is getting really long** (20+ back-and-forths) | The AI starts "forgetting" things from earlier in the conversation |
| **You're switching to a different type of task** (e.g., from building to debugging) | Different context needed |
| **You're switching models** | Each model works best with its own conversation |
| **The AI is repeating itself or going in circles** | It's confused; a new conversation fixes this |

### ❌ DON'T Start a New Conversation When:

| Situation | Why Not |
|-----------|---------|
| **The AI just finished step 1 and you want step 2** | Continue! The AI remembers what it just did |
| **You have a follow-up question about what it just built** | It has the context right there |
| **You're iterating on styling** ("Make the button bigger", "Change the color") | Rapid iteration works best in one conversation |

### The Rule of Thumb

> **One conversation = one focused task or one build phase.**
> 
> If the task changes significantly, start a new conversation.

## The Ideal Session Length

- **20-30 minutes of active back-and-forth** is a good session length
- After ~15-20 messages, the AI's context window starts getting full
- Break your work into sessions that fit in this window

## Git Workflow for Vibe Coders

You'll want to learn just enough Git to protect yourself:

```bash
# FIRST TIME ONLY: Initialize git in your project
git init
git add .
git commit -m "Initial project setup"

# AFTER EVERY WORKING CHANGE:
git add .
git commit -m "Phase 3: Session store created and working"

# WHEN SOMETHING BREAKS AND YOU WANT TO UNDO:
git stash                  # Temporarily saves your broken changes
# Now you're back to your last commit (the working state)
# If you want to inspect what you stashed:
git stash show -p
# If you want to throw away the broken changes:
git stash drop

# SEE YOUR SAVE HISTORY:
git log --oneline -10      # Shows last 10 saves

# GO BACK TO A SPECIFIC SAVE:
git checkout <commit-hash> # Copy the hash from git log
```

**Commit often. Every time something works, save it.** This is your safety net.

---

# Part 6: Avoiding Model Limits

AI model usage often has daily or monthly limits. Here's how to make every interaction count and avoid running out.

## Strategy 1: Use the Right Model for the Right Job

(Covered in Part 4 — don't use Opus for tasks Haiku can handle.)

## Strategy 2: Front-Load Your Thinking

Before sending a prompt to the AI, think for 2 minutes:
- What exactly do I want?
- What files does it need to see?
- What does "done" look like?

A well-thought-out prompt gets a good result on the **first try**. A vague prompt leads to 5 rounds of back-and-forth, eating your quota.

## Strategy 3: Batch Related Changes

Instead of 5 small conversations:
1. "Add a border to the button"
2. "Change the button color"  
3. "Make the button bigger"
4. "Add hover effect"
5. "Add a click animation"

Do **one** conversation:
1. "Update the RegulationButton styling: add a 1px border, change color to yellow, increase size to 48px height, add a hover glow effect, and add a scale-down animation on click."

**One good prompt > five small ones.**

## Strategy 4: Let the AI Batch Updates to CONTEXT.md

Don't ask the AI to update CONTEXT.md after every tiny change. Instead, tell it:

> "Update CONTEXT.md at the very end of this session with everything you've done."

This saves one prompt round-trip per change.

## Strategy 5: Use Tier 3 Models for Non-Coding Tasks

Need to understand an error? Ask Haiku or Flash. Need to brainstorm feature ideas? Ask Haiku. Save your heavy-hitter models for actual code writing.

## Strategy 6: Prepare Context Files Offline

You can manually update `CONTEXT.md` yourself based on what you observe (bugs you found, things you tested). This means the AI spends less of its output on context management and more on actual coding.

## Strategy 7: Don't Re-Explain the Project

This is why you have `ARCHITECTURE.md` and `CONTEXT.md`. Instead of typing a paragraph explaining the project in every conversation, just say:

> "See attached ARCHITECTURE.md and CONTEXT.md for full project context."

The AI reads the files. You save tokens. Everyone wins.

## Quota Budget Per Phase (Suggested)

| Phase | Estimated Conversations | Suggested Models |
|-------|------------------------|-----------------|
| 0. Scaffolding | 1-2 | Tier 2 (Sonnet) |
| 1. Types & Design System | 1-2 | Tier 2 (Sonnet) |
| 2. Track & Season Data | 1-2 | Tier 2 (Sonnet / Codex) |
| 3. State Stores | 2-3 | Tier 2 (Sonnet) |
| 4. Engine (Core Logic) | 3-5 | **Tier 1 (Opus / GPT 5.3)** ← hardest phase |
| 5. Track Renderer | 2-3 | Tier 1 or Tier 2 |
| 6. Setup Screen | 2-3 | Tier 2 (Sonnet) |
| 7. Race Screen | 3-5 | **Tier 1 (Opus / GPT 5.3)** ← most complex screen |
| 8. Summary Screen | 1-2 | Tier 2 (Sonnet) |
| 9. Settings Screen | 1-2 | Tier 2 (Sonnet) |
| 10. App Shell & Router | 1-2 | Tier 2 (Sonnet) |
| 11. Polish & Bugs | 3-5 | Mix of Tier 1 and 2 |
| 12. Build & Package | 1-2 | Tier 2 (Sonnet) |
| **Total** | **~25-40 conversations** | |

---

# Part 7: Common Mistakes & How to Avoid Them

## Mistake 1: "Just Build the Whole Thing"

**What happens**: You paste the entire ARCHITECTURE.md and say "Build it." The AI tries to create 30+ files at once, makes errors in 5 of them, and you end up with a half-broken project that's hard to debug.

**Fix**: Follow the build phases. One phase per session. One step per prompt if needed.

## Mistake 2: Not Testing

**What happens**: The AI creates 10 files across 3 phases. You never run the app. When you finally do, there are 7 errors and you don't know which file caused which error.

**Fix**: Run `npm run tauri dev` after every significant change. Test early, test often.

## Mistake 3: Not Using Git

**What happens**: Phase 5 is working perfectly. During Phase 6, the AI accidentally breaks the track renderer. You have no way to get back to the working Phase 5 state. You spend 3 hours fixing something that was already working.

**Fix**: `git add . && git commit -m "Phase 5 complete"` after every working milestone.

## Mistake 4: Giving the AI Too Much Freedom

**What happens**: You say "Build a timer." The AI decides to use a library you've never heard of, structures the code differently than ARCHITECTURE.md specifies, and adds "helpful" extra features. Now nothing matches the plan.

**Fix**: Always reference ARCHITECTURE.md in your prompts. Say "Follow ARCHITECTURE.md Section 9.4 for the timer implementation."

## Mistake 5: Arguing With the AI When It's Confused

**What happens**: The AI misunderstands something. You try to correct it. It apologizes and makes a different mistake. You correct again. It makes another mistake. 15 messages later, nothing works.

**Fix**: After 3 failed attempts at correction, **start a new conversation**. Fresh context. Re-state the problem clearly. Usually works on the first try.

## Mistake 6: Ignoring Warnings

**What happens**: The AI says "Note: this might cause issues with X later." You ignore it. 4 phases later, X is the exact thing that breaks.

**Fix**: When the AI flags potential issues, add them to CONTEXT.md Section 6 (Technical Debt). Address them before they become real problems.

## Mistake 7: Not Updating CONTEXT.md

**What happens**: You do 3 coding sessions without updating CONTEXT.md. On session 4, the AI doesn't know about the bugs from session 2, the files created in session 3, or the shortcuts you took.

**Fix**: Make it a ritual. End of every session → update CONTEXT.md. It takes 2 minutes and saves hours.

## Mistake 8: Using the Same Conversation for Days

**What happens**: You keep the same conversation going across multiple work sessions. By day 3, the conversation is 100+ messages long. The AI is confused, slow, and forgetting things you told it on day 1.

**Fix**: One conversation per work session (or per build phase, whichever is shorter). Fresh start every time, with CONTEXT.md carrying the knowledge forward.

---

# Quick Reference Card

Print this out or keep it visible while you work:

```
┌─────────────────────────────────────────────────────┐
│           VIBE CODING QUICK REFERENCE               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  BEFORE EACH SESSION:                               │
│  □ Read CONTEXT.md                                  │
│  □ Decide what to build (next phase/step)           │
│  □ Pick the right model (Tier 1/2/3)                │
│  □ Fill in the prompt template                      │
│  □ Attach CONTEXT.md + ARCHITECTURE.md              │
│                                                     │
│  DURING EACH SESSION:                               │
│  □ One task at a time                               │
│  □ Test after every change                          │
│  □ Git commit when things work                      │
│  □ Paste full errors to the AI                      │
│  □ New conversation if AI goes in circles           │
│                                                     │
│  AFTER EACH SESSION:                                │
│  □ Verify CONTEXT.md was updated                    │
│  □ Git commit the final state                       │
│                                                     │
│  MODEL SELECTION:                                   │
│  Complex/multi-file → Opus / GPT 5.3               │
│  Normal coding      → Sonnet / GPT 5.2             │
│  Quick/simple       → Haiku / Flash                 │
│                                                     │
│  WHEN THINGS BREAK:                                 │
│  1. Copy the full error message                     │
│  2. Paste it to the AI                              │
│  3. If AI can't fix it in 3 tries → new convo      │
│  4. If all else fails → git stash (undo)            │
│                                                     │
└─────────────────────────────────────────────────────┘
```
