# Deep Work F1 - Product Specification v1.0

#### About the developer

I'm Joe. I have little to no prior programming knowledge and am completely vibe-coding this project. Explain everything in your answers in a way that even I can understand it.

## 1. Document Status

- Version: v1.0
- Date: 2026-04-09
- Source: Consolidated from project idea and product-definition conversation
- Scope: Defines the build target for the first complete production version

## 2. Product Vision

Deep Work F1 is a cross-platform desktop deep-work app that uses Formula-inspired race mechanics to make focus sessions more engaging and harder to abandon.

The product must feel like a race without becoming a full game. The two non-negotiable pillars are:

- Track map with visible car progression
- Regulation mechanics that materially affect the session

## 3. Product Goals

- Increase sustained deep-work output using race-style momentum
- Make session progression legible and motivating through lap-based visualization
- Provide customizable discipline mechanics for pauses and distractions
- Keep architecture simple, minimal, and safe for solo development

## 4. Core Product Principles

- Mechanical over cosmetic: regulation buttons must affect actual session behavior
- No fake progress: faster timer pace must be paired with higher required effort
- Local-first: session data and settings stored locally by default
- Official rulesets only: season logic is app-defined, not user-authored
- Predictable behavior: no mid-session or mid-year ruleset switching

## 5. Target Platform and Stack

### 5.1 Required Foundation

- Desktop framework: Tauri v2
- Frontend: React + TypeScript + Vite
- IDE workflow: VS Code + GitHub Copilot

### 5.2 Optional When Needed

- Tailwind CSS for styling velocity
- Framer Motion for UI/state animation

### 5.3 Deferred Until Clearly Needed

- React Three Fiber (3D rendering)
- Rust-heavy OS integrations (system tray, global hotkeys)

## 6. Feature Scope (v1.0)

### 6.1 Pre-Race Setup

- Select track (visual choice)
- Set session duration
- Enter a short strategy note

### 6.2 Race Session

- Timer runs the full session
- Car moves around selected track map continuously
- Regulation controls available according to active season ruleset
- Regulation effects alter pace and effective effort demand
- Penalty system may reduce effective race progress

### 6.3 Post-Race Summary

- Session duration completed
- Laps completed
- Regulation usage timeline
- Penalty events
- Final effective race progress

## 7. Explicitly Out of Scope for v1.0

- Cloud sync and online accounts
- Community/social features
- User-created custom season rulesets
- Full rich-text notes editor
- Mandatory score/ranking system (may be added later)

## 8. Track System Specification

### 8.1 Visual Role

Tracks are purely visual and thematic. They do not change regulation logic.

### 8.2 Lap Behavior

- Each track has a lap-time factor
- Shorter track -> shorter lap time -> higher lap count in same session
- Longer track -> longer lap time -> lower lap count in same session

### 8.3 Movement Model

- Car position is interpolated along SVG path length
- Position is based on effective race progress, not only wall-clock time

## 9. Regulations Engine Specification

### 9.1 Mechanical Rule

If pace multiplier increases to m, required effort multiplier also increases to approximately m.

This enforces fairness and avoids "cheat mode" behavior.

### 9.2 Action Concurrency

- Regulation actions that are mutually exclusive must lock each other out
- Only one conflicting action can be active at a time

### 9.3 Cooldowns and Limits

- Regulation actions support cooldowns and usage limits
- Balance values are configurable and can be tuned later

### 9.4 Penalty Model

Penalties reduce effective race progress (not only cosmetic indicators).

Initial penalty triggers are user-selectable toggles:

- Pause event
- App unfocus event
- Idle/no-input event

Idle threshold default:

- 120 seconds

## 10. Season Ruleset System

### 10.1 Policy

- Season rulesets are official and app-defined only
- No user-generated season packs in v1.0
- No manual season switching in-session
- Current season remains fixed for its year

### 10.2 Defined Season Differences

#### 2026 Ruleset

- Buttons: Boost + Overtake
- Boost: temporary pace+effort escalation with cooldown
- Overtake: higher-intensity sprint with stricter interruption consequences

#### 2025 Ruleset

- Buttons: Overtake + DRS (instead of Boost + Overtake)
- DRS behavior is season-defined and mutually exclusive where required

## 11. Strategy Note Specification

- Input type: short text field (single concise note)
- Purpose: define focus intention before session start
- Optional Parc Ferme behavior: lock note after session starts

## 12. Persistence and Data Ownership

- Local-first storage for sessions, settings, and track metadata
- No cloud dependency required for normal operation
- User data remains on-device by default

## 13. High-Level Architecture

- UI Layer: setup, active race, summary screens
- Session Engine: timer lifecycle and state transitions
- Regulations Engine: cooldowns, lockouts, multipliers, penalties
- Track Renderer: path geometry, interpolation, lap counting
- Persistence Layer: local storage adapter and schema

## 14. Suggested Domain Model (v1.0)

- SeasonRuleset
  - seasonYear
  - enabledRegulations
  - regulationParameters
  - lockoutMatrix
  - penaltyConfig
- Track
  - id
  - name
  - svgPath
  - lapTimeFactor
- Session
  - id
  - startTime
  - targetDurationSec
  - selectedTrackId
  - seasonYear
  - strategyNote
  - events
  - effectiveProgress
  - lapsCompleted
  - completedAt
- SessionEvent
  - timestamp
  - type (regulationStart, regulationEnd, pause, unfocus, idlePenalty, etc.)
  - metadata

## 15. UX Requirements

- Keep session controls immediately understandable
- Show active regulation state and cooldown visibility at all times
- Show why penalties occurred in plain language
- Make progress impact visible when penalties apply
- Keep setup friction low (track, duration, note, start)

## 16. Safety and Simplicity Constraints

- Prefer deterministic rules over hidden adaptive behavior
- Avoid unnecessary backend complexity until clearly required
- Keep feature additions modular through ruleset configuration

## 17. Release Readiness Criteria for v1.0

The release is ready when all are true:

- Pre-race setup supports track, duration, short note
- Active session shows continuous car progression on track
- Season regulation buttons function with lockouts and cooldowns
- Penalty triggers are user-selectable and affect effective progress
- Post-race summary reports laps, regulation usage, and penalty effects
- Data persists locally across app restarts
- App runs on target desktop platforms via Tauri

## 18. Future Extensions (Post-v1.0)

- Optional score/ranking layer built on existing event model
- Additional official season rule updates by app release cycle
- Optional system tray/hotkey workflows
- Optional richer analytics and trend reporting
