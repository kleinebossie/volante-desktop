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
