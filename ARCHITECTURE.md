# Deep Work F1 — Master Architecture Document

> **Purpose of this file**: This document is the single source of truth for building the Deep Work F1 application. An autonomous coding agent should be able to build the entire project by following this document sequentially, with no additional context required. Every decision is made here; the agent should not need to "think about" architecture—only execute.

---

## Table of Contents

1. [Product Summary](#1-product-summary)
2. [Non-Negotiable Constraints](#2-non-negotiable-constraints)
3. [Tech Stack — Exact Versions & Rationale](#3-tech-stack--exact-versions--rationale)
4. [Project Initialization](#4-project-initialization)
5. [Directory Structure](#5-directory-structure)
6. [Design System & Visual Language](#6-design-system--visual-language)
7. [Data Models & TypeScript Types](#7-data-models--typescript-types)
8. [State Management Architecture](#8-state-management-architecture)
9. [Module-by-Module Specification](#9-module-by-module-specification)
   - 9.1 [Persistence Layer](#91-persistence-layer)
   - 9.2 [Track System](#92-track-system)
   - 9.3 [Season Ruleset System](#93-season-ruleset-system)
   - 9.4 [Session Engine (Timer + State Machine)](#94-session-engine-timer--state-machine)
   - 9.5 [Regulations Engine](#95-regulations-engine)
   - 9.6 [Track Renderer](#96-track-renderer)
   - 9.7 [UI Layer](#97-ui-layer)
10. [Screen-by-Screen Specification](#10-screen-by-screen-specification)
11. [Build Order — Step-by-Step](#11-build-order--step-by-step)
12. [Testing Strategy](#12-testing-strategy)
13. [Packaging & Distribution](#13-packaging--distribution)
14. [Known Risks & Mitigations](#14-known-risks--mitigations)
15. [Future Extension Points](#15-future-extension-points)

---

## 1. Product Summary

Deep Work F1 is a **cross-platform desktop deep-work timer** that uses Formula 1 race mechanics to make focus sessions engaging. A user picks a real F1 track, sets a session duration, optionally writes a strategy note, and starts a "race." A car visually drives around the track map for the session's duration. Regulation buttons (Boost, Overtake, DRS) speed up the timer but demand proportionally harder effort. Penalties for pausing, alt-tabbing, or going idle reduce effective race progress.

**It is NOT a game.** It is a productivity tool that borrows F1 aesthetics and mechanical concepts to fight session abandonment.

---

## 2. Non-Negotiable Constraints

These are immovable. The agent must never violate these:

| # | Constraint | Why |
|---|-----------|-----|
| 1 | **Tauri v2** for desktop shell | Cross-platform, tiny binary, Rust backend available later |
| 2 | **React + TypeScript + Vite** for UI | Developer's chosen stack, good tooling |
| 3 | **Local-first data** — zero cloud dependencies | Privacy, simplicity, offline-first |
| 4 | **Mechanical regulations, not cosmetic** | Core product principle — buttons must change session behavior |
| 5 | **No mid-session ruleset switching** | Predictable behavior guarantee |
| 6 | **Season rulesets are app-defined only** | No user authoring of custom rulesets in v0.1 |
| 7 | **Solo developer / vibe-coder friendly** | Architecture must be dead-simple to understand |
| 8 | **SVG-based track rendering** | 2D paths, no 3D engine for v0.1 |

---

## 3. Tech Stack — Exact Versions & Rationale

### 3.1 Core Stack (Use Immediately)

| Technology | Version | Purpose | Install |
|-----------|---------|---------|---------|
| **Node.js** | >= 20 LTS | Runtime for build tooling | Pre-installed |
| **Rust** | Latest stable | Tauri backend (minimal use in v0.1) | `rustup` |
| **Tauri CLI** | v2 (latest) | Desktop app shell, window management, system APIs | `cargo install tauri-cli` |
| **React** | 19.x | UI component model | Via Vite template |
| **TypeScript** | 5.x | Type safety across the frontend | Via Vite template |
| **Vite** | 6.x | Fast dev server + build | Via `create-tauri-app` |

### 3.2 Styling & Animation (Use From Start)

| Technology | Version | Purpose | Rationale |
|-----------|---------|---------|-----------|
| **CSS Modules** | Built into Vite | Scoped component styles | Simpler than Tailwind for a solo dev who doesn't know Tailwind well. Zero config, native CSS, no learning curve. Each component gets its own `.module.css` file. |
| **Framer Motion** | 12.x | Animations for regulation states, car movement assist, UI transitions | The app has many state transitions that benefit from animation. Worth including from day one. |

> **Critical Decision — CSS Modules over Tailwind**: The original idea mentions Tailwind, but for a solo vibe-coder, CSS Modules are vastly simpler. You write normal CSS, it's automatically scoped to each component, and there's nothing new to learn. Tailwind requires memorizing utility classes and adds configuration overhead. CSS Modules ship with Vite out of the box—zero setup.

### 3.3 Additional Dependencies

| Package | Purpose | When to install |
|---------|---------|----------------|
| `zustand` | Lightweight global state management | Project init |
| `uuid` | Generate unique IDs for sessions/events | Project init |
| `date-fns` | Time formatting and duration math | Project init |

### 3.4 Explicitly NOT Using (v0.1)

| Technology | Why Not |
|-----------|---------|
| Tailwind CSS | CSS Modules are simpler for this project's needs |
| React Three Fiber / Three.js | 2D SVG tracks are sufficient; 3D adds massive complexity |
| Redux / MobX | Zustand is far simpler and sufficient |
| Any database (SQLite, etc.) | JSON file storage via Tauri's fs API is enough |
| Any backend server | Everything is local |
| React Router | Only 3 screens; a simple state-based view switcher is enough |

---

## 4. Project Initialization

### 4.1 Step-by-Step Commands

```bash
# 1. Create the Tauri v2 project with React + TypeScript template
npm create tauri-app@latest deep-work-f1 -- --template react-ts

# 2. Navigate into project
cd deep-work-f1

# 3. Install frontend dependencies
npm install

# 4. Install additional frontend packages
npm install zustand uuid date-fns framer-motion

# 5. Install TypeScript type packages
npm install -D @types/uuid

# 6. Verify it runs
npm run tauri dev
```

> **Note**: The `create-tauri-app` scaffolder will set up the Vite + React + TypeScript boilerplate and the `src-tauri/` Rust backend directory. The agent should NOT manually configure Vite or Tauri—the scaffolder handles it.

### 4.2 Tauri Configuration Essentials

In `src-tauri/tauri.conf.json`, set:

```json
{
  "productName": "Deep Work F1",
  "version": "0.1.0",
  "identifier": "com.deepworkf1.app",
  "build": {
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "title": "Deep Work F1",
        "width": 1100,
        "height": 750,
        "minWidth": 900,
        "minHeight": 650,
        "resizable": true,
        "fullscreen": false
      }
    ]
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  }
}
```

### 4.3 Tauri Permissions

In `src-tauri/capabilities/default.json`, ensure the app has permission to:
- Read/write the app's local data directory (`fs` plugin scoped to `$APPDATA`)
- Listen to window focus/blur events (`event` scope)

The agent must add the required Tauri plugins:

```bash
cd src-tauri
cargo add tauri-plugin-fs
```

And register it in `src-tauri/lib.rs`:

```rust
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

---

## 5. Directory Structure

```
deep-work-f1/
├── src/                          # All frontend source code
│   ├── main.tsx                  # React entry point
│   ├── App.tsx                   # Root component + view router
│   ├── App.module.css            # Root-level styles
│   ├── index.css                 # Global styles, CSS variables, fonts
│   │
│   ├── types/                    # TypeScript type definitions
│   │   ├── session.ts            # Session, SessionEvent types
│   │   ├── track.ts              # Track type
│   │   ├── regulations.ts        # Regulation, SeasonRuleset types
│   │   └── settings.ts           # UserSettings type
│   │
│   ├── data/                     # Static data (tracks, season rulesets)
│   │   ├── tracks/               # Track definitions
│   │   │   ├── index.ts          # Track registry + helper functions
│   │   │   ├── trackPaths.ts     # SVG path `d` strings (extracted from f1-circuits-svg repo)
│   │   │   └── trackCatalog.ts   # Track metadata (names, countries, colors, lap factors)
│   │   └── seasons/              # Season ruleset definitions
│   │       ├── index.ts          # Season registry
│   │       ├── season2026.ts     # 2026 rules (Boost + Overtake)
│   │       └── season2025.ts     # 2025 rules (Overtake + DRS)
│   │
│   ├── stores/                   # Zustand state stores
│   │   ├── sessionStore.ts       # Active session state
│   │   ├── settingsStore.ts      # User preferences
│   │   └── historyStore.ts       # Past session records
│   │
│   ├── engine/                   # Core logic (no UI)
│   │   ├── timer.ts              # Timer loop (requestAnimationFrame-based)
│   │   ├── sessionStateMachine.ts # Session lifecycle states + transitions
│   │   ├── regulationsEngine.ts  # Cooldowns, lockouts, multipliers, penalties
│   │   ├── penaltyDetector.ts    # Monitors for pause/unfocus/idle events
│   │   └── progressCalculator.ts # Converts elapsed time + multipliers to effective progress
│   │
│   ├── components/               # Reusable UI components
│   │   ├── TrackRenderer/
│   │   │   ├── TrackRenderer.tsx
│   │   │   └── TrackRenderer.module.css
│   │   ├── RegulationButton/
│   │   │   ├── RegulationButton.tsx
│   │   │   └── RegulationButton.module.css
│   │   ├── Timer/
│   │   │   ├── Timer.tsx
│   │   │   └── Timer.module.css
│   │   ├── LapCounter/
│   │   │   ├── LapCounter.tsx
│   │   │   └── LapCounter.module.css
│   │   ├── PenaltyIndicator/
│   │   │   ├── PenaltyIndicator.tsx
│   │   │   └── PenaltyIndicator.module.css
│   │   ├── StrategyNote/
│   │   │   ├── StrategyNote.tsx
│   │   │   └── StrategyNote.module.css
│   │   ├── TrackSelector/
│   │   │   ├── TrackSelector.tsx
│   │   │   └── TrackSelector.module.css
│   │   ├── DurationPicker/
│   │   │   ├── DurationPicker.tsx
│   │   │   └── DurationPicker.module.css
│   │   ├── CooldownBar/
│   │   │   ├── CooldownBar.tsx
│   │   │   └── CooldownBar.module.css
│   │   └── SessionSummaryCard/
│   │       ├── SessionSummaryCard.tsx
│   │       └── SessionSummaryCard.module.css
│   │
│   ├── screens/                  # Full-page screen components
│   │   ├── SetupScreen/
│   │   │   ├── SetupScreen.tsx
│   │   │   └── SetupScreen.module.css
│   │   ├── RaceScreen/
│   │   │   ├── RaceScreen.tsx
│   │   │   └── RaceScreen.module.css
│   │   ├── SummaryScreen/
│   │   │   ├── SummaryScreen.tsx
│   │   │   └── SummaryScreen.module.css
│   │   └── SettingsScreen/
│   │       ├── SettingsScreen.tsx
│   │       └── SettingsScreen.module.css
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useTimer.ts           # Hook wrapping the timer engine
│   │   ├── useRegulations.ts     # Hook wrapping the regulations engine
│   │   ├── usePenaltyDetection.ts # Hook for focus/idle detection
│   │   └── useTrackProgress.ts   # Hook computing car position on track
│   │
│   └── utils/                    # Pure utility functions
│       ├── formatTime.ts         # Duration formatting
│       ├── interpolatePath.ts    # SVG path point-at-length math
│       └── storage.ts            # Read/write JSON to Tauri app data dir
│
├── src-tauri/                    # Tauri / Rust backend
│   ├── src/
│   │   ├── main.rs               # Tauri entry point
│   │   └── lib.rs                # Plugin registration
│   ├── tauri.conf.json           # App config
│   ├── capabilities/
│   │   └── default.json          # Permissions
│   ├── icons/                    # App icons
│   └── Cargo.toml
│
├── public/                       # Static assets served by Vite
│   └── fonts/                    # Local font files if needed
│
├── scripts/                      # One-off dev scripts
│   └── extract-track-paths.ts    # Extracts SVG `d` attributes from f1-circuits-svg repo
│
├── ARCHITECTURE.md               # This file
├── CONTEXT.md                    # Development state tracker
├── PROMPT.md                     # Prompt template & vibe coding guide
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

---

## 6. Design System & Visual Language

### 6.1 Color Palette

The app should feel like an **F1 broadcast control room** — dark, high-contrast, with neon accent colors.

```css
/* index.css — CSS Custom Properties */
:root {
  /* Backgrounds */
  --color-bg-primary: #0a0a0f;        /* Near-black with slight blue tint */
  --color-bg-secondary: #12121a;      /* Card/panel backgrounds */
  --color-bg-tertiary: #1a1a2e;       /* Elevated surfaces */
  --color-bg-hover: #22223a;          /* Hover states */

  /* Text */
  --color-text-primary: #e8e8ef;      /* Main text */
  --color-text-secondary: #8888a0;    /* Dimmed/label text */
  --color-text-accent: #ffffff;       /* Bright white for emphasis */

  /* Accent Colors — Racing */
  --color-accent-red: #e10600;        /* F1 red — primary CTA */
  --color-accent-green: #00d26a;      /* Active/running state */
  --color-accent-blue: #0090ff;       /* DRS / info */
  --color-accent-yellow: #ffd700;     /* Boost / warning */
  --color-accent-orange: #ff6b00;     /* Overtake */
  --color-accent-purple: #8b5cf6;     /* Penalty */

  /* Functional */
  --color-success: #00d26a;
  --color-warning: #ffd700;
  --color-danger: #e10600;
  --color-info: #0090ff;

  /* Borders & Dividers */
  --color-border: rgba(255, 255, 255, 0.06);
  --color-border-active: rgba(255, 255, 255, 0.15);

  /* Shadows */
  --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.4);
  --shadow-glow-red: 0 0 20px rgba(225, 6, 0, 0.3);
  --shadow-glow-green: 0 0 20px rgba(0, 210, 106, 0.3);

  /* Typography */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Sizing */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  /* Spacing scale (4px base) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 400ms ease;
}
```

### 6.2 Typography

- **Primary font**: `Inter` — clean, modern, highly legible. Load from Google Fonts via `<link>` in `index.html`.
- **Monospace font**: `JetBrains Mono` — for timer display and data readouts. Load from Google Fonts.
- Timer display should be large (48–72px), monospaced, with tabular number rendering (`font-variant-numeric: tabular-nums`).

```html
<!-- Add to index.html <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
```

### 6.3 Global CSS Reset & Base Styles

```css
/* index.css — prepend before custom properties */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body, #root {
  height: 100%;
  width: 100%;
  overflow: hidden;  /* Desktop app, no scrollbars */
}

body {
  font-family: var(--font-primary);
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  -webkit-font-smoothing: antialiased;
  line-height: 1.5;
}

/* Prevent text selection on UI elements (desktop app feel) */
button, label, nav, header {
  user-select: none;
}

/* Scrollbar styling for any scrollable areas */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: var(--color-border-active);
  border-radius: var(--radius-full);
}
```

### 6.4 Component Style Patterns

Every component uses CSS Modules. Pattern:

```tsx
// Example: Timer.tsx
import styles from './Timer.module.css';

export function Timer({ timeRemaining }: { timeRemaining: number }) {
  return <div className={styles.container}>...</div>;
}
```

```css
/* Timer.module.css */
.container {
  font-family: var(--font-mono);
  font-size: 64px;
  /* ... */
}
```

### 6.5 Animation Guidelines

- **Screen transitions**: Use Framer Motion `AnimatePresence` with fade + slight vertical slide (y: 20px → 0).
- **Regulation button press**: Quick scale pulse (1.0 → 0.95 → 1.0) with glow color matching the regulation.
- **Car on track**: Smooth CSS transition on `transform` property (position updates via `requestAnimationFrame`).
- **Penalty event**: Brief red flash overlay on the track area.
- **Cooldown bars**: Width transition from 100% → 0% over the cooldown duration.
- **All transitions**: Use `ease-out` timing for natural feel.

---

## 7. Data Models & TypeScript Types

### 7.1 `types/track.ts`

```typescript
export interface TrackPoint {
  x: number;
  y: number;
}

export interface Track {
  id: string;                    // Circuit ID from f1-circuits-svg repo (e.g., "bahrain")
  layoutId: string;              // Specific layout version (e.g., "bahrain-1")
  name: string;                  // e.g., "Bahrain International Circuit"
  countryId: string;             // Country slug (e.g., "bahrain", "united-kingdom")
  countryName: string;           // Display name (e.g., "Bahrain", "United Kingdom")
  svgPathD: string;              // SVG <path> `d` attribute string (extracted from f1-circuits-svg)
  lapTimeFactor: number;         // Multiplier: 1.0 = standard. <1 = shorter laps, >1 = longer laps
  accentColor: string;           // Hex color for track-specific theming
  flagEmoji: string;             // Country flag emoji for display
}
```

> **Note on SVG data**: All `svgPathD` values come from the [julesr0y/f1-circuits-svg](https://github.com/julesr0y/f1-circuits-svg) repository (CC-BY-4.0 license). SVGs have a standard `500 × 500` viewBox. The `d` attribute is extracted from the `minimal/white-outline` style variants. Attribution is required in the app's about/credits section.

### 7.2 `types/regulations.ts`

```typescript
export type RegulationType = 'boost' | 'overtake' | 'drs';

export interface RegulationConfig {
  type: RegulationType;
  label: string;                     // Display name (e.g., "BOOST")
  description: string;               // Short explanation
  paceMultiplier: number;            // e.g., 2.0 = timer runs 2x speed
  durationSec: number;               // How long the effect lasts
  cooldownSec: number;               // Cooldown before can be used again
  maxUsesPerSession: number | null;  // null = unlimited
  interruptionPenaltyMultiplier: number; // Extra penalty if interrupted during this regulation
  accentColor: string;               // Color for button/glow (CSS variable name)
  icon: string;                      // Emoji or icon identifier
}

export interface SeasonRuleset {
  seasonYear: number;                 // e.g., 2026
  label: string;                      // e.g., "2026 Regulations"
  description: string;
  regulations: RegulationConfig[];
  lockoutMatrix: Record<RegulationType, RegulationType[]>; // Which regs block which others
  penaltyConfig: PenaltyConfig;
}

export interface PenaltyConfig {
  pausePenaltySec: number;            // Seconds of progress lost per pause event
  unfocusPenaltySec: number;          // Seconds lost per app unfocus event
  idlePenaltySec: number;             // Seconds lost per idle detection
  idleThresholdSec: number;           // How long before idle triggers (default: 120)
}

export type PenaltyTrigger = 'pause' | 'unfocus' | 'idle';
```

### 7.3 `types/session.ts`

```typescript
import { RegulationType, PenaltyTrigger } from './regulations';

export type SessionState = 'setup' | 'running' | 'paused' | 'completed' | 'abandoned';

export type SessionEventType =
  | 'session_start'
  | 'session_pause'
  | 'session_resume'
  | 'session_complete'
  | 'session_abandon'
  | 'regulation_activate'
  | 'regulation_deactivate'
  | 'regulation_interrupted'
  | 'penalty_applied'
  | 'lap_completed';

export interface SessionEvent {
  id: string;                         // UUID
  timestamp: number;                  // Unix ms
  type: SessionEventType;
  metadata: Record<string, unknown>;  // Flexible payload per event type
}

export interface Session {
  id: string;                         // UUID
  createdAt: number;                  // Unix ms
  state: SessionState;
  selectedTrackId: string;
  seasonYear: number;
  targetDurationSec: number;
  strategyNote: string;
  parcFermeEnabled: boolean;          // If true, note locked after start

  // Runtime state (updated continuously during session)
  elapsedWallTimeSec: number;         // Actual wall clock time elapsed
  effectiveProgressSec: number;       // Progress accounting for multipliers and penalties
  currentPaceMultiplier: number;      // Current effective pace (1.0 = normal)
  lapsCompleted: number;
  totalPenaltySec: number;            // Running total of penalty time deducted

  // Regulation runtime state
  activeRegulation: RegulationType | null;
  regulationEndTime: number | null;   // Unix ms when active regulation expires
  cooldowns: Record<RegulationType, number>;  // Unix ms when cooldown expires
  usageCounts: Record<RegulationType, number>;

  // Penalty toggles (user-selected)
  enabledPenaltyTriggers: PenaltyTrigger[];

  // Event log
  events: SessionEvent[];

  // Completion data
  completedAt: number | null;         // Unix ms
}
```

### 7.4 `types/settings.ts`

```typescript
import { PenaltyTrigger } from './regulations';

export interface UserSettings {
  // Display
  defaultSeasonYear: number;
  favoriteTrackIds: string[];

  // Penalty defaults
  defaultPenaltyTriggers: PenaltyTrigger[];
  idleThresholdSec: number;

  // Session defaults
  defaultDurationMin: number;          // Default timer duration in minutes
  parcFermeDefault: boolean;

  // Audio (future)
  soundEnabled: boolean;

  // UI
  showLapCounter: boolean;
  showPenaltyFeed: boolean;
}

export const DEFAULT_SETTINGS: UserSettings = {
  defaultSeasonYear: 2026,
  favoriteTrackIds: [],
  defaultPenaltyTriggers: ['pause', 'unfocus'],
  idleThresholdSec: 120,
  defaultDurationMin: 25,
  parcFermeDefault: false,
  soundEnabled: true,
  showLapCounter: true,
  showPenaltyFeed: true,
};
```

---

## 8. State Management Architecture

### 8.1 Why Zustand

Zustand is a tiny (< 1KB) state manager that works like a global hook. No boilerplate, no providers, no reducers. Perfect for a solo dev. Each "store" is created with a single function call and accessed from any component via a hook.

### 8.2 Store Definitions

#### `stores/sessionStore.ts`

This is the **brain** of the app at runtime. It holds the active session's entire state.

```typescript
import { create } from 'zustand';
import type { Session, SessionState, SessionEvent } from '../types/session';
import type { RegulationType } from '../types/regulations';

interface SessionStore {
  // Current session (null when no session is active)
  session: Session | null;

  // Actions
  createSession: (params: {
    trackId: string;
    seasonYear: number;
    durationSec: number;
    strategyNote: string;
    parcFerme: boolean;
    penaltyTriggers: PenaltyTrigger[];
  }) => void;

  startSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  completeSession: () => void;
  abandonSession: () => void;

  // Timer tick — called every frame
  tick: (deltaMs: number) => void;

  // Regulation actions
  activateRegulation: (type: RegulationType) => void;
  deactivateRegulation: () => void;

  // Penalty
  applyPenalty: (trigger: PenaltyTrigger, penaltySec: number) => void;

  // Event logging
  addEvent: (event: Omit<SessionEvent, 'id' | 'timestamp'>) => void;
}
```

#### `stores/settingsStore.ts`

Persisted preferences. Loaded from file on app start, saved on every change.

#### `stores/historyStore.ts`

Array of past completed/abandoned sessions. Loaded from file, appended after each session.

### 8.3 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        App.tsx                              │
│  ┌─────────┐    ┌─────────────┐    ┌────────────────────┐  │
│  │ Setup   │───▶│  Race       │───▶│  Summary           │  │
│  │ Screen  │    │  Screen     │    │  Screen            │  │
│  └─────────┘    └──────┬──────┘    └────────────────────┘  │
│                        │                                    │
│                ┌───────▼───────┐                            │
│                │  useTimer()   │ ◀── requestAnimationFrame  │
│                └───────┬───────┘           loop             │
│                        │                                    │
│              ┌─────────▼──────────┐                         │
│              │   sessionStore     │                         │
│              │   .tick(delta)     │                         │
│              └─────────┬──────────┘                         │
│                        │                                    │
│         ┌──────────────┼──────────────┐                     │
│         ▼              ▼              ▼                     │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐              │
│  │ Regulations│ │  Progress  │ │  Penalty   │              │
│  │ Engine     │ │ Calculator │ │ Detector   │              │
│  └────────────┘ └────────────┘ └────────────┘              │
│                        │                                    │
│                ┌───────▼───────┐                            │
│                │  Persistence  │                            │
│                │  (JSON files) │                            │
│                └───────────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Module-by-Module Specification

### 9.1 Persistence Layer

**File**: `src/utils/storage.ts`

**Purpose**: Read and write JSON data to the Tauri app data directory. This wraps Tauri's filesystem API so the rest of the app never touches filesystem calls directly.

**API**:

```typescript
// Reads a JSON file from the app data directory. Returns null if file doesn't exist.
export async function readData<T>(filename: string): Promise<T | null>;

// Writes a JSON object to a file in the app data directory.
export async function writeData<T>(filename: string, data: T): Promise<void>;
```

**Implementation notes**:
- Uses `@tauri-apps/plugin-fs` for file operations.
- Uses `@tauri-apps/api/path` `appDataDir()` to resolve the storage location.
- File names: `settings.json`, `history.json`.
- All writes should use `JSON.stringify(data, null, 2)` for human-readable files.
- Wrap all operations in try/catch. On read failure (file not found), return `null`. On write failure, log error to console.

---

### 9.2 Track System

**Directory**: `src/data/tracks/`

**Purpose**: Define all available F1 tracks as static data. Each track is a TypeScript object conforming to the `Track` interface.

#### 9.2.1 SVG Source: `julesr0y/f1-circuits-svg`

All track SVG path data comes from the open-source repository:
- **Repository**: https://github.com/julesr0y/f1-circuits-svg
- **License**: CC-BY-4.0 (attribution required — add credit in app's about/settings screen)
- **Contains**: 78 circuits, 4 visual styles, layouts from 1950-2026
- **Format**: Each SVG is `500 × 500` px, with the track outline as a `<path>` element

We use the **`minimal/white-outline`** style. These SVGs have two `<path>` elements sharing the **same `d` attribute**: one thick white outline (stroke-width 20) and one thin black center line (stroke-width 5). We only need the `d` attribute — we render the path ourselves with our own styling.

#### 9.2.2 Path Extraction Process

A one-time extraction script pulls the `d` attribute from each SVG file into a TypeScript data file:

**Script**: `scripts/extract-track-paths.ts`

```typescript
/**
 * Run with: npx ts-node scripts/extract-track-paths.ts
 *
 * Prerequisites:
 *   git clone https://github.com/julesr0y/f1-circuits-svg.git /tmp/f1-circuits-svg
 *
 * This script:
 * 1. Reads each SVG file from /tmp/f1-circuits-svg/circuits/minimal/white-outline/
 * 2. Extracts the `d` attribute from the first <path> element
 * 3. Outputs src/data/tracks/trackPaths.ts with a Record<layoutId, pathD>
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';

const SVG_DIR = '/tmp/f1-circuits-svg/circuits/minimal/white-outline';
const OUTPUT = 'src/data/tracks/trackPaths.ts';

const files = readdirSync(SVG_DIR).filter(f => f.endsWith('.svg'));
const paths: Record<string, string> = {};

for (const file of files) {
  const content = readFileSync(`${SVG_DIR}/${file}`, 'utf-8');
  const match = content.match(/d="([^"]+)"/);
  if (match) {
    const layoutId = file.replace('.svg', '');
    paths[layoutId] = match[1];
  }
}

const output = `// Auto-generated from julesr0y/f1-circuits-svg (CC-BY-4.0)\n// Source: circuits/minimal/white-outline/\n// Do not edit manually — re-run scripts/extract-track-paths.ts\n\nexport const TRACK_PATHS: Record<string, string> = ${JSON.stringify(paths, null, 2)};\n`;

writeFileSync(OUTPUT, output);
console.log(`Extracted ${Object.keys(paths).length} track paths to ${OUTPUT}`);
```

> **Agent instruction**: During Phase 2, clone the repo, run this script, then delete the clone. The `trackPaths.ts` file is committed to the project — the repo clone is only needed once.

#### 9.2.3 Full 2026 Calendar Track List

Instead of just 6 tracks, we include **all 24 circuits** on the 2026 F1 calendar. The repo already has accurate SVGs for each one:

| # | Circuit ID | Layout ID | Name | Country | Lap Factor | Accent Color |
|---|-----------|-----------|------|---------|------------|--------------|
| 1 | `melbourne` | `melbourne-2` | Melbourne Grand Prix Circuit | 🇦🇺 Australia | 0.9 | `#003580` |
| 2 | `shanghai` | `shanghai-1` | Shanghai International Circuit | 🇨🇳 China | 1.1 | `#de2910` |
| 3 | `suzuka` | `suzuka-2` | Suzuka Circuit | 🇯🇵 Japan | 1.1 | `#bc002d` |
| 4 | `bahrain` | `bahrain-1` | Bahrain International Circuit | 🇧🇭 Bahrain | 1.0 | `#d4a844` |
| 5 | `jeddah` | `jeddah-1` | Jeddah Corniche Circuit | 🇸🇦 Saudi Arabia | 1.2 | `#1a7a3a` |
| 6 | `miami` | `miami-1` | Miami International Autodrome | 🇺🇸 USA (Miami) | 1.0 | `#f4a261` |
| 7 | `montreal` | `montreal-6` | Circuit Gilles Villeneuve | 🇨🇦 Canada | 0.9 | `#ff0000` |
| 8 | `monaco` | `monaco-6` | Circuit de Monaco | 🇲🇨 Monaco | 0.6 | `#c8102e` |
| 9 | `catalunya` | `catalunya-6` | Circuit de Barcelona-Catalunya | 🇪🇸 Spain | 1.0 | `#f1bf00` |
| 10 | `spielberg` | `spielberg-3` | Red Bull Ring | 🇦🇹 Austria | 0.7 | `#ed1c24` |
| 11 | `silverstone` | `silverstone-8` | Silverstone Circuit | 🇬🇧 Great Britain | 1.0 | `#012169` |
| 12 | `spa-francorchamps` | `spa-francorchamps-4` | Circuit de Spa-Francorchamps | 🇧🇪 Belgium | 1.3 | `#fdda24` |
| 13 | `hungaroring` | `hungaroring-3` | Hungaroring | 🇭🇺 Hungary | 0.9 | `#477050` |
| 14 | `zandvoort` | `zandvoort-5` | Circuit Park Zandvoort | 🇳🇱 Netherlands | 0.7 | `#ff6600` |
| 15 | `monza` | `monza-7` | Autodromo Nazionale Monza | 🇮🇹 Italy | 1.0 | `#009246` |
| 16 | `madring` | `madring-1` | Circuito de Madring | 🇪🇸 Spain (Madrid) | 1.0 | `#f1bf00` |
| 17 | `baku` | `baku-1` | Baku City Circuit | 🇦🇿 Azerbaijan | 1.2 | `#0092bc` |
| 18 | `marina-bay` | `marina-bay-4` | Marina Bay Street Circuit | 🇸🇬 Singapore | 1.0 | `#ef3340` |
| 19 | `austin` | `austin-1` | Circuit of the Americas | 🇺🇸 USA (Austin) | 1.1 | `#3c3b6e` |
| 20 | `mexico-city` | `mexico-city-3` | Autódromo Hermanos Rodríguez | 🇲🇽 Mexico | 0.9 | `#006847` |
| 21 | `interlagos` | `interlagos-2` | Autódromo José Carlos Pace | 🇧🇷 Brazil | 0.9 | `#009739` |
| 22 | `las-vegas` | `las-vegas-1` | Las Vegas Street Circuit | 🇺🇸 USA (Las Vegas) | 1.2 | `#b4975a` |
| 23 | `lusail` | `lusail-1` | Lusail International Circuit | 🇶🇦 Qatar | 1.0 | `#8a1538` |
| 24 | `yas-marina` | `yas-marina-2` | Yas Marina Circuit | 🇦🇪 Abu Dhabi | 1.0 | `#c8102e` |

#### 9.2.4 Track Catalog File

**File**: `src/data/tracks/trackCatalog.ts`

This file contains all metadata for each track. The `svgPathD` is imported from the auto-generated `trackPaths.ts`.

```typescript
import type { Track } from '../../types/track';
import { TRACK_PATHS } from './trackPaths';

// Helper to build a track entry, pulling its path from the extracted data
function track(
  id: string,
  layoutId: string,
  name: string,
  countryId: string,
  countryName: string,
  flagEmoji: string,
  lapTimeFactor: number,
  accentColor: string
): Track {
  const svgPathD = TRACK_PATHS[layoutId];
  if (!svgPathD) {
    console.warn(`Missing SVG path for layout: ${layoutId}`);
  }
  return { id, layoutId, name, countryId, countryName, svgPathD: svgPathD ?? '', lapTimeFactor, accentColor, flagEmoji };
}

export const TRACK_CATALOG: Track[] = [
  // Ordered by 2026 F1 calendar (Round 1 → Round 24)
  track('melbourne',         'melbourne-2',            'Melbourne Grand Prix Circuit',        'australia',             'Australia',          '🇦🇺', 0.9, '#003580'),
  track('shanghai',          'shanghai-1',             'Shanghai International Circuit',      'china',                 'China',              '🇨🇳', 1.1, '#de2910'),
  track('suzuka',            'suzuka-2',               'Suzuka Circuit',                      'japan',                 'Japan',              '🇯🇵', 1.1, '#bc002d'),
  track('bahrain',           'bahrain-1',              'Bahrain International Circuit',       'bahrain',               'Bahrain',            '🇧🇭', 1.0, '#d4a844'),
  track('jeddah',            'jeddah-1',               'Jeddah Corniche Circuit',             'saudi-arabia',          'Saudi Arabia',       '🇸🇦', 1.2, '#1a7a3a'),
  track('miami',             'miami-1',                'Miami International Autodrome',       'united-states-of-america','USA (Miami)',       '🇺🇸', 1.0, '#f4a261'),
  track('montreal',          'montreal-6',             'Circuit Gilles Villeneuve',           'canada',                'Canada',             '🇨🇦', 0.9, '#ff0000'),
  track('monaco',            'monaco-6',               'Circuit de Monaco',                   'monaco',                'Monaco',             '🇲🇨', 0.6, '#c8102e'),
  track('catalunya',         'catalunya-6',            'Circuit de Barcelona-Catalunya',      'spain',                 'Spain',              '🇪🇸', 1.0, '#f1bf00'),
  track('spielberg',         'spielberg-3',            'Red Bull Ring',                       'austria',               'Austria',            '🇦🇹', 0.7, '#ed1c24'),
  track('silverstone',       'silverstone-8',          'Silverstone Circuit',                 'united-kingdom',        'Great Britain',      '🇬🇧', 1.0, '#012169'),
  track('spa-francorchamps', 'spa-francorchamps-4',    'Circuit de Spa-Francorchamps',        'belgium',               'Belgium',            '🇧🇪', 1.3, '#fdda24'),
  track('hungaroring',       'hungaroring-3',          'Hungaroring',                         'hungary',               'Hungary',            '🇭🇺', 0.9, '#477050'),
  track('zandvoort',         'zandvoort-5',            'Circuit Park Zandvoort',              'netherlands',           'Netherlands',        '🇳🇱', 0.7, '#ff6600'),
  track('monza',             'monza-7',                'Autodromo Nazionale Monza',           'italy',                 'Italy',              '🇮🇹', 1.0, '#009246'),
  track('madring',           'madring-1',              'Circuito de Madring',                 'spain',                 'Spain (Madrid)',     '🇪🇸', 1.0, '#f1bf00'),
  track('baku',              'baku-1',                 'Baku City Circuit',                   'azerbaijan',            'Azerbaijan',         '🇦🇿', 1.2, '#0092bc'),
  track('marina-bay',        'marina-bay-4',           'Marina Bay Street Circuit',           'singapore',             'Singapore',          '🇸🇬', 1.0, '#ef3340'),
  track('austin',            'austin-1',               'Circuit of the Americas',             'united-states-of-america','USA (Austin)',      '🇺🇸', 1.1, '#3c3b6e'),
  track('mexico-city',       'mexico-city-3',          'Autódromo Hermanos Rodríguez',        'mexico',                'Mexico',             '🇲🇽', 0.9, '#006847'),
  track('interlagos',        'interlagos-2',           'Autódromo José Carlos Pace',          'brazil',                'Brazil',             '🇧🇷', 0.9, '#009739'),
  track('las-vegas',         'las-vegas-1',            'Las Vegas Street Circuit',            'united-states-of-america','USA (Las Vegas)',   '🇺🇸', 1.2, '#b4975a'),
  track('lusail',            'lusail-1',               'Lusail International Circuit',        'qatar',                 'Qatar',              '🇶🇦', 1.0, '#8a1538'),
  track('yas-marina',        'yas-marina-2',           'Yas Marina Circuit',                  'united-arab-emirates',  'Abu Dhabi',          '🇦🇪', 1.0, '#c8102e'),
];
```

#### 9.2.5 Track Registry

**File**: `src/data/tracks/index.ts`

```typescript
import type { Track } from '../../types/track';
import { TRACK_CATALOG } from './trackCatalog';

export const TRACKS: Track[] = TRACK_CATALOG;

export function getTrackById(id: string): Track | undefined {
  return TRACKS.find(t => t.id === id);
}

export function getTrackByLayoutId(layoutId: string): Track | undefined {
  return TRACKS.find(t => t.layoutId === layoutId);
}
```

---

### 9.3 Season Ruleset System

**Directory**: `src/data/seasons/`

**Purpose**: Define the official season rulesets that control which regulation buttons are available.

#### 2026 Season (`data/seasons/season2026.ts`)

```typescript
import type { SeasonRuleset } from '../../types/regulations';

export const season2026: SeasonRuleset = {
  seasonYear: 2026,
  label: '2026 Regulations',
  description: 'Boost and Overtake buttons. Inspired by the 2026 F1 technical regulations.',
  regulations: [
    {
      type: 'boost',
      label: 'BOOST',
      description: 'Temporary 2x pace. Demands 2x effort.',
      paceMultiplier: 2.0,
      durationSec: 30,
      cooldownSec: 120,
      maxUsesPerSession: null,
      interruptionPenaltyMultiplier: 1.5,
      accentColor: 'var(--color-accent-yellow)',
      icon: '⚡',
    },
    {
      type: 'overtake',
      label: 'OVERTAKE',
      description: 'High-intensity sprint. Severe penalty if interrupted.',
      paceMultiplier: 2.5,
      durationSec: 20,
      cooldownSec: 180,
      maxUsesPerSession: 3,
      interruptionPenaltyMultiplier: 3.0,
      accentColor: 'var(--color-accent-orange)',
      icon: '🏁',
    },
  ],
  lockoutMatrix: {
    boost: ['overtake'],     // Can't use overtake while boosting
    overtake: ['boost'],     // Can't use boost while overtaking
    drs: [],                 // Not in this season
  },
  penaltyConfig: {
    pausePenaltySec: 15,
    unfocusPenaltySec: 10,
    idlePenaltySec: 20,
    idleThresholdSec: 120,
  },
};
```

#### 2025 Season (`data/seasons/season2025.ts`)

```typescript
// Overtake + DRS instead of Boost + Overtake
export const season2025: SeasonRuleset = {
  seasonYear: 2025,
  label: '2025 Regulations',
  description: 'DRS and Overtake buttons. Based on the current 2025 F1 regulations.',
  regulations: [
    {
      type: 'drs',
      label: 'DRS',
      description: 'Drag Reduction System. Moderate pace increase.',
      paceMultiplier: 1.5,
      durationSec: 45,
      cooldownSec: 90,
      maxUsesPerSession: null,
      interruptionPenaltyMultiplier: 1.0,
      accentColor: 'var(--color-accent-blue)',
      icon: '🔓',
    },
    {
      type: 'overtake',
      label: 'OVERTAKE',
      description: 'High-intensity sprint. Severe penalty if interrupted.',
      paceMultiplier: 2.5,
      durationSec: 20,
      cooldownSec: 180,
      maxUsesPerSession: 3,
      interruptionPenaltyMultiplier: 3.0,
      accentColor: 'var(--color-accent-orange)',
      icon: '🏁',
    },
  ],
  lockoutMatrix: {
    boost: [],
    overtake: ['drs'],
    drs: ['overtake'],
  },
  penaltyConfig: {
    pausePenaltySec: 10,
    unfocusPenaltySec: 8,
    idlePenaltySec: 15,
    idleThresholdSec: 120,
  },
};
```

---

### 9.4 Session Engine (Timer + State Machine)

#### 9.4.1 Session State Machine

**File**: `src/engine/sessionStateMachine.ts`

The session has exactly 5 states with defined transitions:

```
                    ┌─────────────┐
                    │   SETUP     │
                    │ (initial)   │
                    └──────┬──────┘
                           │ start()
                    ┌──────▼──────┐
               ┌───▶│  RUNNING    │◀───┐
               │    └──┬──────┬───┘    │
               │       │      │        │
          resume()     │   pause()     │
               │       │      │        │
               │    ┌──▼──────▼───┐    │
               └────│  PAUSED     │────┘
                    └──────┬──────┘
                           │ abandon()
                    ┌──────▼──────┐
    ┌──────────────▶│ ABANDONED   │
    │ (from RUNNING │             │
    │  or PAUSED)   └─────────────┘
    │
    │  timer reaches 100%
    │               ┌─────────────┐
    └──────────────▶│ COMPLETED   │
                    └─────────────┘
```

**Valid transitions**:

| From | To | Trigger |
|------|----|---------|
| setup | running | User clicks START |
| running | paused | User clicks PAUSE |
| running | completed | `effectiveProgressSec >= targetDurationSec` |
| running | abandoned | User clicks ABANDON |
| paused | running | User clicks RESUME |
| paused | abandoned | User clicks ABANDON |

**Any other transition is invalid and must be rejected silently.**

#### 9.4.2 Timer Engine

**File**: `src/engine/timer.ts`

The timer uses `requestAnimationFrame` for smooth updates. It does NOT use `setInterval` — that's unreliable and can drift.

**How it works**:
1. On each animation frame, compute `deltaMs` since last frame.
2. Pass `deltaMs` to the session store's `tick()` method.
3. `tick()` updates:
   - `elapsedWallTimeSec += deltaMs / 1000`
   - `effectiveProgressSec += (deltaMs / 1000) * currentPaceMultiplier`
   - Check if any active regulation has expired → deactivate it + start cooldown
   - Check if session is complete → transition to `completed`
   - Compute current lap based on progress

**Lap calculation**:
```
baseLapDurationSec = targetDurationSec * lapTimeFactor * LAP_DURATION_RATIO
lapsCompleted = floor(effectiveProgressSec / baseLapDurationSec)
lapProgress = (effectiveProgressSec % baseLapDurationSec) / baseLapDurationSec  // 0.0 to 1.0
```

Where `LAP_DURATION_RATIO` is a constant that determines how many laps a session produces. A good default: for a 25-minute session on a `lapTimeFactor=1.0` track, target ~5 laps. So `LAP_DURATION_RATIO = 1/5 = 0.2`.

Wait, let's recalculate to be clearer:

```
totalLaps = ceil(targetDurationSec / (BASE_LAP_SECONDS * lapTimeFactor))
lapDurationSec = targetDurationSec / totalLaps
```

Where `BASE_LAP_SECONDS = 300` (5 minutes base lap). So:
- 25 min session + factor 1.0 = 25min/5min = 5 laps
- 25 min session + factor 0.6 (Monaco) = 25min/3min = ~8 laps
- 50 min session + factor 1.2 (Jeddah) = 50min/6min = ~8 laps

This feels natural.

#### 9.4.3 Progress Calculator

**File**: `src/engine/progressCalculator.ts`

```typescript
export function calculateEffectiveProgress(
  elapsedMs: number,
  paceMultiplier: number,
  totalPenaltySec: number
): number {
  return Math.max(0, (elapsedMs / 1000) * paceMultiplier - totalPenaltySec);
}

export function calculateLapInfo(
  effectiveProgressSec: number,
  targetDurationSec: number,
  lapTimeFactor: number
): { currentLap: number; totalLaps: number; lapProgress: number } {
  const BASE_LAP_SECONDS = 300;
  const totalLaps = Math.ceil(targetDurationSec / (BASE_LAP_SECONDS * lapTimeFactor));
  const lapDurationSec = targetDurationSec / totalLaps;
  const currentLap = Math.floor(effectiveProgressSec / lapDurationSec) + 1;
  const lapProgress = (effectiveProgressSec % lapDurationSec) / lapDurationSec;
  return { currentLap: Math.min(currentLap, totalLaps), totalLaps, lapProgress };
}

export function calculateOverallProgress(
  effectiveProgressSec: number,
  targetDurationSec: number
): number {
  return Math.min(1, effectiveProgressSec / targetDurationSec);
}
```

---

### 9.5 Regulations Engine

**File**: `src/engine/regulationsEngine.ts`

**Responsibility**: Manages activation/deactivation of regulation buttons, cooldowns, lockouts, and usage limits.

**Core Logic**:

```typescript
export function canActivateRegulation(
  type: RegulationType,
  session: Session,
  ruleset: SeasonRuleset
): { allowed: boolean; reason?: string } {
  const config = ruleset.regulations.find(r => r.type === type);
  if (!config) return { allowed: false, reason: 'Regulation not available in this season' };

  // Check if another regulation is active
  if (session.activeRegulation !== null) {
    return { allowed: false, reason: 'Another regulation is currently active' };
  }

  // Check cooldown
  const cooldownExpiry = session.cooldowns[type] || 0;
  if (Date.now() < cooldownExpiry) {
    return { allowed: false, reason: 'Regulation is on cooldown' };
  }

  // Check usage limit
  if (config.maxUsesPerSession !== null) {
    const used = session.usageCounts[type] || 0;
    if (used >= config.maxUsesPerSession) {
      return { allowed: false, reason: 'Maximum uses reached' };
    }
  }

  // Check lockout matrix
  const lockedBy = ruleset.lockoutMatrix[type] || [];
  if (session.activeRegulation && lockedBy.includes(session.activeRegulation)) {
    return { allowed: false, reason: 'Locked out by active regulation' };
  }

  return { allowed: true };
}
```

**When a regulation activates**:
1. Set `session.activeRegulation = type`
2. Set `session.regulationEndTime = Date.now() + config.durationSec * 1000`
3. Set `session.currentPaceMultiplier = config.paceMultiplier`
4. Increment `session.usageCounts[type]`
5. Log a `regulation_activate` event

**When a regulation deactivates** (timer expired or interrupted):
1. Set `session.activeRegulation = null`
2. Set `session.regulationEndTime = null`
3. Set `session.currentPaceMultiplier = 1.0`
4. Set `session.cooldowns[type] = Date.now() + config.cooldownSec * 1000`
5. Log `regulation_deactivate` or `regulation_interrupted` event
6. If interrupted, apply extra penalty: `config.interruptionPenaltyMultiplier * basePenalty`

---

### 9.6 Penalty Detector

**File**: `src/engine/penaltyDetector.ts`

**Purpose**: Monitors for events that should trigger penalties.

**Three penalty sources**:

1. **Pause event**: Triggered when user clicks the pause button.
   - Detection: Direct — called by the pause action.

2. **App unfocus event**: Triggered when the Tauri window loses focus (user switches to another app).
   - Detection: Listen to the Tauri window `blur` event via `@tauri-apps/api/event`.
   - Only penalize if `unfocus` is in `enabledPenaltyTriggers`.
   - Grace period: 3 seconds. If user returns within 3 seconds, no penalty.

3. **Idle event**: Triggered when no keyboard/mouse input for `idleThresholdSec`.
   - Detection: Track `mousemove`, `keydown`, `click` events on the document. Reset a countdown timer on each event. When the countdown expires → idle penalty.
   - Only penalize if `idle` is in `enabledPenaltyTriggers`.

**Hook** (`hooks/usePenaltyDetection.ts`):
- Sets up event listeners for unfocus and idle tracking.
- Calls `sessionStore.applyPenalty()` when a penalty condition is met.
- Cleans up listeners on unmount.

---

### 9.7 Track Renderer

**File**: `src/components/TrackRenderer/TrackRenderer.tsx`

**Purpose**: Renders the track SVG path and animates the car along it.

**Implementation approach**:

1. Render an `<svg>` element with `viewBox="0 0 500 500"` (all tracks from the f1-circuits-svg repo use this standard size).
2. Draw the track path using `<path>` with the track's `svgPathD` attribute.
3. The car is a small colored dot (or simple F1-car SVG icon) positioned along the path.
4. Use the SVG `getPointAtLength()` DOM API to get the (x, y) position for any fractional progress along the path.

**Car position calculation**:

```typescript
// In hooks/useTrackProgress.ts
export function useTrackProgress(pathRef: SVGPathElement | null, lapProgress: number) {
  if (!pathRef) return { x: 0, y: 0, angle: 0 };

  const totalLength = pathRef.getTotalLength();
  const distance = lapProgress * totalLength;
  const point = pathRef.getPointAtLength(distance);

  // Calculate angle for car rotation
  const nextPoint = pathRef.getPointAtLength(Math.min(distance + 2, totalLength));
  const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);

  return { x: point.x, y: point.y, angle };
}
```

**Visual elements**:
- Track outline: Thick stroke (6-8px), semi-transparent white with subtle glow.
- Racing line: Thinner stroke (2px) on top of the track, using the track's `accentColor`.
- Car: Small rectangle or triangle (rotated to follow the track direction), filled with `--color-accent-red`.
- Start/finish line: Small perpendicular line across the track at position 0.
- Progress trail: a colored trail behind the car showing completed portion of current lap (optional but looks great).

**Track styling** (`TrackRenderer.module.css`):

```css
.trackContainer {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.trackSvg {
  width: 100%;
  height: 100%;
  max-height: 500px;
}

.trackPath {
  fill: none;
  stroke: rgba(255, 255, 255, 0.15);
  stroke-width: 8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.racingLine {
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  opacity: 0.6;
}

.car {
  transition: transform 50ms linear;
  filter: drop-shadow(0 0 6px var(--color-accent-red));
}
```

---

### 9.8 UI Layer

#### App.tsx — View Router

The app has no traditional routing. Instead, `App.tsx` maintains a `currentView` state derived from the session store:

```typescript
function App() {
  const session = useSessionStore(s => s.session);

  let currentView: 'setup' | 'race' | 'summary' | 'settings';

  if (!session || session.state === 'setup') {
    currentView = 'setup';
  } else if (session.state === 'running' || session.state === 'paused') {
    currentView = 'race';
  } else {
    currentView = 'summary';
  }

  return (
    <AnimatePresence mode="wait">
      {currentView === 'setup' && <SetupScreen key="setup" />}
      {currentView === 'race' && <RaceScreen key="race" />}
      {currentView === 'summary' && <SummaryScreen key="summary" />}
    </AnimatePresence>
  );
}
```

Settings is opened as an overlay/modal from any screen.

---

## 10. Screen-by-Screen Specification

### 10.1 Setup Screen

**Purpose**: Let the user configure and start a session.

**Layout**:
```
┌─────────────────────────────────────────────────┐
│  Deep Work F1          [⚙️ Settings]            │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │                                         │    │
│  │     Track Selector (scrollable cards)   │    │
│  │     [🇧🇭 Bahrain] [🇸🇦 Jeddah] [...]    │    │
│  │                                         │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ┌───────────────┐  ┌──────────────────────┐    │
│  │ Duration      │  │ Season: 2026 ▼       │    │
│  │ [25] min  ▲▼  │  │                      │    │
│  └───────────────┘  └──────────────────────┘    │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ Strategy Note                           │    │
│  │ [                                     ] │    │
│  │ □ Lock after start (Parc Fermé)         │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ Penalty Triggers                        │    │
│  │ ☑ Pause  ☑ App Unfocus  ☐ Idle          │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│          [ 🏁 START RACE ]                      │
│                                                 │
│  Recent Sessions (last 3)                       │
│  ┌─────┐ ┌─────┐ ┌─────┐                       │
│  │ ... │ │ ... │ │ ... │                        │
│  └─────┘ └─────┘ └─────┘                       │
└─────────────────────────────────────────────────┘
```

**Interactions**:
- Track selector: horizontal scroll of track cards. Clicking selects. Selected card gets a colored border + glow.
- Duration picker: number input with increment/decrement buttons. Min: 5 min. Max: 120 min. Step: 5 min.
- Season selector: dropdown with 2025, 2026 options.
- Strategy note: single-line text input with placeholder "What will you focus on?"
- Parc Fermé: checkbox toggle.
- Penalty triggers: three toggles.
- START RACE button: large, red, centered. Disabled until a track is selected.

### 10.2 Race Screen

**Purpose**: Active session view — the core experience.

**Layout**:
```
┌─────────────────────────────────────────────────┐
│ LAP 3/5    ⏱ 12:34    Progress ████████░░ 75%  │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │                                         │    │
│  │                                         │    │
│  │         Track Map with Car              │    │
│  │         (fills most of screen)          │    │
│  │                                         │    │
│  │                                         │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│          ┌──────────────────────┐                │
│          │   25:00 remaining    │                │
│          │  (large mono timer)  │                │
│          └──────────────────────┘                │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ ⚡ BOOST  │  │ 🏁 OVER- │  │ ⏸ PAUSE  │      │
│  │ [active] │  │  TAKE    │  │          │      │
│  │ ████░░░░ │  │ cooldown │  │          │      │
│  │ cooldown │  │ 1:45     │  │          │      │
│  └──────────┘  └──────────┘  └──────────┘      │
│                                                 │
│  Strategy: "Finish chapter 5 of the textbook"   │
│                                                 │
│  ⚠ Penalty: -10s (unfocus)          [Abandon]  │
└─────────────────────────────────────────────────┘
```

**Key behaviors**:
- Timer counts DOWN from remaining time to zero.
- Track + car fills the center. Car smoothly follows the path.
- Regulation buttons show:
  - Current state (available / active / cooldown / depleted)
  - Cooldown countdown bar (shrinking bar under the button)
  - Uses remaining (if limited)
- Penalty notifications appear briefly at the bottom when triggered, then fade.
- Strategy note is visible at the bottom (dimmed, read-only if Parc Fermé).
- PAUSE button pauses the timer and shows a resume overlay.
- ABANDON button (small, less prominent) requires a confirmation dialog.

### 10.3 Summary Screen

**Purpose**: Post-race debrief showing what happened during the session.

**Layout**:
```
┌─────────────────────────────────────────────────┐
│         🏁 RACE COMPLETE                        │
│         or 🚫 RACE ABANDONED                    │
│                                                 │
│  ┌─────────────┬──────────────────────────┐     │
│  │ Duration    │ 25:00 (target) / 23:45   │     │
│  │ Laps        │ 5 completed              │     │
│  │ Effective   │ 22:30 (after penalties)  │     │
│  │ Penalties   │ -1:15 total              │     │
│  └─────────────┴──────────────────────────┘     │
│                                                 │
│  Regulation Usage                               │
│  ┌─────────────────────────────────────────┐    │
│  │ ⚡ Boost: used 3x (total 90s at 2x)     │    │
│  │ 🏁 Overtake: used 1x (total 20s at 2.5x)│    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  Penalty Timeline                               │
│  ┌─────────────────────────────────────────┐    │
│  │ 05:32 - Unfocus penalty: -10s           │    │
│  │ 12:15 - Pause penalty: -15s             │    │
│  │ 18:42 - Idle penalty: -20s              │    │
│  │ 22:01 - Overtake interrupted: -60s      │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  Strategy: "Finish chapter 5 of the textbook"   │
│                                                 │
│       [ 🏠 Back to Setup ] [ 🔄 Race Again ]    │
└─────────────────────────────────────────────────┘
```

**"Race Again"** pre-fills the setup screen with the same track, duration, and season.

### 10.4 Settings Screen (Modal Overlay)

**Purpose**: User preferences.

**Settings available**:
- Default session duration
- Default season ruleset
- Default penalty triggers
- Idle threshold (seconds)
- Parc Fermé default
- Show/hide lap counter
- Show/hide penalty feed
- Favorite tracks

**Implementation**: Rendered as a modal overlay with a semi-transparent backdrop. Uses `AnimatePresence` for smooth open/close animation.

---

## 11. Build Order — Step-by-Step

This is the exact sequence the autonomous agent should follow. Each phase produces a testable, runnable state.

### Phase 0: Project Scaffolding
- [ ] 0.1 Run `create-tauri-app` with react-ts template
- [ ] 0.2 Install additional npm packages (`zustand`, `uuid`, `date-fns`, `framer-motion`, `@types/uuid`)
- [ ] 0.3 Configure `tauri.conf.json` (window size, title, identifier)
- [ ] 0.4 Add `tauri-plugin-fs` to Cargo.toml and register in `lib.rs`
- [ ] 0.5 Configure Tauri capabilities/permissions for filesystem access
- [ ] 0.6 Add Google Fonts link to `index.html`
- [ ] 0.7 Verify `npm run tauri dev` launches successfully
- [ ] 0.8 Clean up scaffolded boilerplate (remove default logos, demo content)

### Phase 1: Foundation — Types, Data, Design System
- [ ] 1.1 Create `src/types/track.ts`
- [ ] 1.2 Create `src/types/regulations.ts`
- [ ] 1.3 Create `src/types/session.ts`
- [ ] 1.4 Create `src/types/settings.ts`
- [ ] 1.5 Create `src/index.css` with full design system (colors, typography, reset)
- [ ] 1.6 Create `src/utils/formatTime.ts`
- [ ] 1.7 Create `src/utils/storage.ts` (Tauri filesystem wrapper)
- [ ] 1.8 Verify types compile with `npm run build` (frontend only)

### Phase 2: Static Data — Tracks and Seasons
- [ ] 2.1 Clone the f1-circuits-svg repo: `git clone https://github.com/julesr0y/f1-circuits-svg.git /tmp/f1-circuits-svg`
- [ ] 2.2 Create `scripts/extract-track-paths.ts` (see Section 9.2.2)
- [ ] 2.3 Run the extraction script to generate `src/data/tracks/trackPaths.ts`
- [ ] 2.4 Delete the cloned repo: `rm -rf /tmp/f1-circuits-svg`
- [ ] 2.5 Create `src/data/tracks/trackCatalog.ts` (all 24 tracks with metadata — see Section 9.2.4)
- [ ] 2.6 Create `src/data/tracks/index.ts` (registry + helpers — see Section 9.2.5)
- [ ] 2.7 Create `src/data/seasons/season2026.ts`
- [ ] 2.8 Create `src/data/seasons/season2025.ts`
- [ ] 2.9 Create `src/data/seasons/index.ts` (registry)
- [ ] 2.10 Verify data compiles and all 24 tracks have valid path data

### Phase 3: State Management Stores
- [ ] 3.1 Create `src/stores/settingsStore.ts` (with load/save persistence)
- [ ] 3.2 Create `src/stores/sessionStore.ts` (all session actions)
- [ ] 3.3 Create `src/stores/historyStore.ts` (past sessions)
- [ ] 3.4 Wire up persistence: settings load on app start, save on change

### Phase 4: Engine — Core Logic
- [ ] 4.1 Create `src/engine/sessionStateMachine.ts`
- [ ] 4.2 Create `src/engine/progressCalculator.ts`
- [ ] 4.3 Create `src/engine/regulationsEngine.ts`
- [ ] 4.4 Create `src/engine/penaltyDetector.ts`
- [ ] 4.5 Create `src/engine/timer.ts`
- [ ] 4.6 Create `src/hooks/useTimer.ts`
- [ ] 4.7 Create `src/hooks/useRegulations.ts`
- [ ] 4.8 Create `src/hooks/usePenaltyDetection.ts`
- [ ] 4.9 Create `src/hooks/useTrackProgress.ts`
- [ ] 4.10 Create `src/utils/interpolatePath.ts`

### Phase 5: Track Renderer Component
- [ ] 5.1 Create `TrackRenderer` component with SVG rendering
- [ ] 5.2 Implement car position interpolation using `getPointAtLength`
- [ ] 5.3 Add car rotation to follow track direction
- [ ] 5.4 Style the track (path outline, racing line, start/finish)
- [ ] 5.5 Add subtle glow/shadow effects
- [ ] 5.6 Test with hardcoded progress values to verify car movement

### Phase 6: Setup Screen
- [ ] 6.1 Create `TrackSelector` component (scrollable card grid)
- [ ] 6.2 Create `DurationPicker` component
- [ ] 6.3 Create `StrategyNote` component
- [ ] 6.4 Create `SetupScreen` assembling all sub-components
- [ ] 6.5 Wire up to session store's `createSession`
- [ ] 6.6 Style everything per design system
- [ ] 6.7 Add season selector dropdown
- [ ] 6.8 Add penalty trigger toggles
- [ ] 6.9 Add START RACE button with validation

### Phase 7: Race Screen
- [ ] 7.1 Create `Timer` component (large countdown display)
- [ ] 7.2 Create `LapCounter` component
- [ ] 7.3 Create `RegulationButton` component (with cooldown bar)
- [ ] 7.4 Create `CooldownBar` sub-component
- [ ] 7.5 Create `PenaltyIndicator` component (penalty feed)
- [ ] 7.6 Create `RaceScreen` assembling all components + TrackRenderer
- [ ] 7.7 Wire up `useTimer` hook — start the `requestAnimationFrame` loop
- [ ] 7.8 Wire up `useRegulations` hook — button clicks
- [ ] 7.9 Wire up `usePenaltyDetection` hook — unfocus/idle detection
- [ ] 7.10 Add PAUSE/RESUME functionality
- [ ] 7.11 Add ABANDON with confirmation dialog
- [ ] 7.12 Style regulation buttons with state-dependent visual feedback
- [ ] 7.13 Add animation effects (regulation activation glow, penalty flash)

### Phase 8: Summary Screen
- [ ] 8.1 Create `SessionSummaryCard` component
- [ ] 8.2 Create `SummaryScreen` with full post-race report
- [ ] 8.3 Wire up regulation usage statistics
- [ ] 8.4 Wire up penalty timeline
- [ ] 8.5 Add "Back to Setup" and "Race Again" buttons
- [ ] 8.6 Style per design system
- [ ] 8.7 Save completed session to history store

### Phase 9: Settings Screen
- [ ] 9.1 Create `SettingsScreen` as a modal overlay
- [ ] 9.2 Add all settings controls (inputs, toggles, dropdowns)
- [ ] 9.3 Wire up to settings store with auto-save
- [ ] 9.4 Add open/close trigger (gear icon in SetupScreen header)
- [ ] 9.5 Animate open/close with Framer Motion

### Phase 10: App Shell & View Router
- [ ] 10.1 Implement `App.tsx` with state-based view switching
- [ ] 10.2 Add `AnimatePresence` screen transitions
- [ ] 10.3 Add recent session cards to Setup Screen
- [ ] 10.4 Full end-to-end smoke test: Setup → Race → Summary → Back

### Phase 11: Polish & Bugs
- [ ] 11.1 Test all regulation interactions (boost, overtake, DRS per season)
- [ ] 11.2 Test penalty triggers (pause, unfocus, idle)
- [ ] 11.3 Test edge cases (abandon mid-regulation, fast-switch tabs, etc.)
- [ ] 11.4 Verify data persistence across app restarts
- [ ] 11.5 Test responsiveness at different window sizes (min 900x650 to larger)
- [ ] 11.6 Add micro-animations for state transitions
- [ ] 11.7 Fine-tune colors, spacing, and typography
- [ ] 11.8 Check for memory leaks (timer loop cleanup, event listener cleanup)

### Phase 12: Build & Package
- [ ] 12.1 Run `npm run tauri build` for current platform
- [ ] 12.2 Verify the built app launches correctly
- [ ] 12.3 Test the built app (not dev server) for any production-only bugs
- [ ] 12.4 Generate app icons

---

## 12. Testing Strategy

### 12.1 Approach

This project uses a **pragmatic testing strategy** appropriate for solo development. Not every line needs a test, but critical logic must be verified.

### 12.2 What Gets Tested

| Layer | Test Type | Tool | Priority |
|-------|----------|------|----------|
| Engine (timer, regulations, penalties, progress) | Unit tests | Vitest | **HIGH** |
| Data (tracks, seasons) | Type checking | TypeScript compiler | **MEDIUM** |
| State stores | Integration tests | Vitest + zustand | **HIGH** |
| UI components | Manual visual testing | Dev server | **MEDIUM** |
| Full flow (setup → race → summary) | Manual E2E testing | Built app | **HIGH** |

### 12.3 Unit Test Setup

Install Vitest (it integrates with Vite out of the box):

```bash
npm install -D vitest
```

Add to `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

### 12.4 Critical Test Cases

**Session State Machine**:
- Valid transitions: setup→running, running→paused, paused→running, running→completed, running→abandoned, paused→abandoned
- Invalid transitions: setup→paused, completed→running, etc.

**Progress Calculator**:
- Normal progress: 60s at 1x = 60 effective seconds
- Boosted progress: 30s at 2x = 60 effective seconds
- Penalized progress: 60s at 1x with 10s penalty = 50 effective seconds
- Completion: triggers at `effectiveProgress >= targetDuration`

**Regulations Engine**:
- Activation when available → succeeds
- Activation during cooldown → fails
- Activation when another is active → fails
- Max uses enforcement
- Interruption penalty calculation

**Lap Calculator**:
- Correct total laps for different durations and track factors
- Lap counter increments at right progress points
- `lapProgress` ranges from 0.0 to 1.0

---

## 13. Packaging & Distribution

### 13.1 Build Commands

```bash
# Build for current platform
npm run tauri build

# Build output locations:
# macOS: src-tauri/target/release/bundle/dmg/
# Windows: src-tauri/target/release/bundle/msi/ or nsis/
# Linux: src-tauri/target/release/bundle/deb/ or appimage/
```

### 13.2 App Icons

Create icons in these sizes and place in `src-tauri/icons/`:
- `32x32.png`
- `128x128.png`
- `128x128@2x.png`
- `icon.icns` (macOS)
- `icon.ico` (Windows)

The icon should be a stylized F1 car or checkered flag on a dark background with the accent red color.

### 13.3 Cross-Platform Notes

- Tauri v2 builds natively for each platform. You need to build on macOS for macOS, on Windows for Windows, etc.
- For v0.1 the developer will build on their own machine. CI/CD cross-compilation is a post-v0.1 concern.

---

## 14. Known Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| SVG `getPointAtLength()` performance with complex paths | Car stuttering | The f1-circuits-svg paths are optimized by SVGO. Cache `getTotalLength()` on mount. If performance is an issue, simplify paths with an SVG path simplifier tool. |
| `requestAnimationFrame` drift when tab is in background | Timer becomes inaccurate | Tauri desktop app is always "foreground" from browser's perspective — RAF should work normally. If issues arise, fall back to `Date.now()` diff on each frame. |
| Idle detection false positives | Unfair penalties | 120-second default is generous. Make threshold configurable. |
| Window blur event on macOS notification center | False unfocus penalty | Add 3-second grace period before penalizing. |
| Large history.json file over time | Slow load | Limit to last 100 sessions. Prune oldest on save. |
| Tauri plugin API changes | Build breaks | Pin exact Tauri and plugin versions in Cargo.toml. |

---

## 15. Future Extension Points

These are NOT in scope for v0.1 but the architecture consciously accommodates them:

| Feature | How the architecture supports it |
|---------|----------------------------------|
| **Score/ranking system** | The `events` array on each session captures every action. A scoring module can compute scores purely from event data without changing any existing code. |
| **New season rulesets** | Add a new file in `data/seasons/`. Register in `index.ts`. No engine changes needed. |
| **New tracks** | The f1-circuits-svg repo contains 78 circuits with historical layouts. Re-run the extraction script and add a new entry to `trackCatalog.ts`. For non-2026 tracks (e.g., historical), the SVG data is already extracted. |
| **System tray** | Tauri v2 supports system tray natively. Add Rust-side tray integration without touching the React app. |
| **Global hotkeys** | Tauri v2 plugin. Would dispatch events to the session store. |
| **Analytics/trends** | The history store has full session data. Build a dashboard screen reading from it. |
| **Sound effects** | Add a `useSound` hook. Tauri can play audio. Trigger on regulation events, penalties, lap completions. |
| **3D track rendering** | Replace `TrackRenderer` component with a React Three Fiber version. The `useTrackProgress` hook's output (x, y, angle) maps directly to 3D coordinates. |
| **Cloud sync** | Replace `utils/storage.ts` with a cloud-backed adapter. Same API surface. |

---

## Appendix A: Key Decisions Log

| Decision | Alternative Considered | Why This Choice |
|----------|----------------------|-----------------|
| CSS Modules over Tailwind | Tailwind CSS | Zero learning curve, native CSS, no config, perfect for vibe-coding |
| Zustand over Redux/Context | Redux, React Context | Minimal boilerplate, tiny bundle, simple API, no provider wrapping |
| JSON files over SQLite | SQLite via Tauri plugin | JSON is simpler, no schema migrations needed, sufficient for app scale |
| requestAnimationFrame over setInterval | setInterval | RAF syncs with display refresh, avoids drift, better animation support |
| State-based view switching over React Router | React Router | Only 3 screens, no URLs needed, simpler mental model |
| Vitest over Jest | Jest | Vitest integrates with Vite natively, faster, same API |
| SVG 2D over Three.js 3D | React Three Fiber | Dramatically simpler, sufficient for v0.1, 3D can be swapped in later |
| Single app window over multi-window | Tauri multi-window | Simpler state management, no IPC complexity |
| External SVG repo over hand-drawn paths | Hand-crafting simplified SVG paths | Real accurate track layouts for all 24 circuits with zero manual drawing. Extraction is a one-time script. CC-BY-4.0 license is permissive. |
| Extracted `d` attributes over bundled SVG files | Importing `.svg` files via Vite plugin | Simpler: no runtime loading, no extra plugins. Path strings are inlined in TypeScript and available for `getPointAtLength()` directly. |

---

## Appendix B: Glossary

| Term | Meaning in this app |
|------|-------------------|
| **Race** | A deep work focus session |
| **Track** | The F1 circuit chosen for visual representation during the session |
| **Lap** | One circuit of the track — purely visual, based on effective progress |
| **Regulation** | A button the user can press to alter session pace (Boost, Overtake, DRS) |
| **Pace Multiplier** | How fast effective progress accrues relative to wall-clock time |
| **Effective Progress** | Wall-clock time × pace multiplier − penalties |
| **Penalty** | Time deducted from effective progress due to pauses, unfocus, or idleness |
| **Cooldown** | Waiting period after using a regulation before it can be used again |
| **Lockout** | Mutual exclusion — certain regulations block others while active |
| **Parc Fermé** | F1 term — in this app, it locks the strategy note once the session starts |
| **Stint** | A stretch of continuous driving — could be used for session segmentation later |
| **Stewards** | In F1, the rule enforcers — in this app, the penalty system |
| **Season Ruleset** | The set of available regulations for a given F1 year |
