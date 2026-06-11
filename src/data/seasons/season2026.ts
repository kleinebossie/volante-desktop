import type { SeasonRuleset } from '../../types/regulations';

export const season2026: SeasonRuleset = {
  seasonYear: 2026,
  label: '2026 Regulations',
  description: 'Boost and Overtake buttons. Inspired by the 2026 F1 technical regulations.',
  regulations: [
    {
      type: 'boost',
      label: 'BOOST',
      description: 'Temporary 1.25x pace. Demands 1.25x effort.',
      paceMultiplier: 1.25,
      durationSec: 30,
      cooldownSec: 30,
      maxUsesPerSession: 3,
      interruptionPenaltyMultiplier: 1.5,
      accentColor: 'var(--color-accent-yellow)',
      icon: '⚡',
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
    boost: ['overtake'],   // Can't use overtake while boosting
    overtake: ['boost'],   // Can't use boost while overtaking
    drs: [],               // Not in this season
  },
  penaltyConfig: {
    pausePenaltySec: 15,
    unfocusPenaltySec: 10,
    idlePenaltySec: 20,
    idleThresholdSec: 120,
  },
};
