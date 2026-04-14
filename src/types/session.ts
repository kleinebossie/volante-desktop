import type { RegulationType, PenaltyTrigger } from './regulations';

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
