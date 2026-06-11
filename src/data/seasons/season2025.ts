import type { SeasonRuleset } from '../../types/regulations';

export const season2025: SeasonRuleset = {
  seasonYear: 2025,
  label: '2025 Regulations',
  description: 'DRS and Overtake buttons. Based on the current 2025 F1 regulations.',
  regulations: [
    {
      type: 'drs',
      label: 'DRS',
      description: 'Drag Reduction System. Moderate pace increase.',
      paceMultiplier: 1.25,
      durationSec: 45,
      cooldownSec: 90,
      maxUsesPerSession: 3,
      interruptionPenaltyMultiplier: 1.5,
      accentColor: 'var(--color-accent-blue)',
      icon: '🔓',
    },
    {
      type: 'overtake',
      label: 'OVERTAKE',
      description: 'High-intensity sprint. Severe penalty if interrupted.',
      paceMultiplier: 1.5,
      durationSec: 20,
      cooldownSec: 180,
      maxUsesPerSession: 1,
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
