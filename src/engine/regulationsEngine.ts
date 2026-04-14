/**
 * regulationsEngine.ts — Pure logic for regulation activation, deactivation,
 * cooldowns, lockouts, and usage limits.
 *
 * In the F1 metaphor, "regulations" are special mode buttons the user can
 * press during a deep-work session to temporarily speed up the timer:
 *
 *   ⚡ BOOST    — 2x speed for 30 seconds (2026 season)
 *   🏁 OVERTAKE — 2.5x speed for 20 seconds, limited uses
 *   🔓 DRS      — 1.5x speed for 45 seconds (2025 season)
 *
 * This module answers questions like:
 *   - "Can the user press this regulation button right now?"
 *   - "What state is a specific regulation in?" (available / active / cooldown / depleted)
 *   - "How long until the cooldown expires?"
 *   - "How much penalty should be applied if a regulation is interrupted?"
 *
 * All functions are PURE — they take data in and return data out.
 * No side effects, no store access, no React.
 *
 * From ARCHITECTURE.md §9.5.
 */

import type { Session } from '../types/session';
import type {
  RegulationType,
  RegulationConfig,
  SeasonRuleset,
} from '../types/regulations';

// ---------------------------------------------------------------------------
// Result type for canActivateRegulation
// ---------------------------------------------------------------------------

/**
 * The result of checking whether a regulation can be activated.
 *
 * If `allowed` is true, the user can press the button.
 * If `allowed` is false, `reason` explains why not (useful for tooltips).
 */
export interface ActivationCheck {
  allowed: boolean;
  reason?: string;
}

// ---------------------------------------------------------------------------
// Regulation state — what the UI shows on each button
// ---------------------------------------------------------------------------

/**
 * The visual state of a regulation button:
 *
 *   - 'available': Ready to be pressed (button is lit up)
 *   - 'active': Currently running — the timer is at boosted speed
 *   - 'cooldown': Can't be pressed yet — waiting for cooldown to finish
 *   - 'depleted': All uses are gone — button is permanently dimmed for this session
 *   - 'locked': Blocked because another regulation is active (lockout matrix)
 *   - 'unavailable': This regulation doesn't exist in the current season
 */
export type RegulationState =
  | 'available'
  | 'active'
  | 'cooldown'
  | 'depleted'
  | 'locked'
  | 'unavailable';

// ---------------------------------------------------------------------------
// Core check: can the user activate this regulation?
// ---------------------------------------------------------------------------

/**
 * Determine whether a regulation can be activated right now.
 *
 * This runs through a checklist of conditions:
 * 1. Is this regulation type available in the current season?
 * 2. Is another regulation already active?
 * 3. Is this regulation on cooldown?
 * 4. Has the user used up all their limited uses?
 * 5. Is this regulation locked out by another active regulation?
 *
 * If all checks pass, returns `{ allowed: true }`.
 * Otherwise returns `{ allowed: false, reason: "..." }`.
 *
 * @param type     Which regulation (boost, overtake, drs)
 * @param session  The current session state
 * @param ruleset  The season's rules (defines which regulations exist, cooldowns, limits)
 * @returns        Whether activation is allowed, with a reason if not
 */
export function canActivateRegulation(
  type: RegulationType,
  session: Session,
  ruleset: SeasonRuleset
): ActivationCheck {
  // 1. Is this regulation available in this season?
  const config = ruleset.regulations.find((r) => r.type === type);
  if (!config) {
    return { allowed: false, reason: 'Regulation not available in this season' };
  }

  // 2. Is another regulation already active?
  if (session.activeRegulation !== null) {
    return { allowed: false, reason: 'Another regulation is currently active' };
  }

  // 3. Is it on cooldown?
  const cooldownExpiry = session.cooldowns[type] || 0;
  if (Date.now() < cooldownExpiry) {
    return { allowed: false, reason: 'Regulation is on cooldown' };
  }

  // 4. Has the user reached the usage limit?
  if (config.maxUsesPerSession !== null) {
    const used = session.usageCounts[type] || 0;
    if (used >= config.maxUsesPerSession) {
      return { allowed: false, reason: 'Maximum uses reached' };
    }
  }

  // 5. Lockout matrix — some regulations block others
  // (This is mostly redundant with check #2, but it catches edge cases
  //  where the lockout matrix defines asymmetric blocks.)
  const lockedBy = ruleset.lockoutMatrix[type] || [];
  if (session.activeRegulation && lockedBy.includes(session.activeRegulation)) {
    return { allowed: false, reason: 'Locked out by active regulation' };
  }

  // All checks passed!
  return { allowed: true };
}

// ---------------------------------------------------------------------------
// Get the visual state of a regulation button
// ---------------------------------------------------------------------------

/**
 * Determine what state a regulation button should display in.
 *
 * This is what the UI uses to decide button colors, whether to show
 * a cooldown bar, whether the button is clickable, etc.
 *
 * @param type     Which regulation (boost, overtake, drs)
 * @param session  The current session state
 * @param ruleset  The season's rules
 * @returns        The visual state of the regulation
 */
export function getRegulationState(
  type: RegulationType,
  session: Session,
  ruleset: SeasonRuleset
): RegulationState {
  // Is this regulation even in this season?
  const config = ruleset.regulations.find((r) => r.type === type);
  if (!config) {
    return 'unavailable';
  }

  // Is THIS regulation currently active?
  if (session.activeRegulation === type) {
    return 'active';
  }

  // Is a DIFFERENT regulation active? (lockout)
  if (session.activeRegulation !== null) {
    return 'locked';
  }

  // Has the user used up all their uses?
  if (config.maxUsesPerSession !== null) {
    const used = session.usageCounts[type] || 0;
    if (used >= config.maxUsesPerSession) {
      return 'depleted';
    }
  }

  // Is it on cooldown?
  const cooldownExpiry = session.cooldowns[type] || 0;
  if (Date.now() < cooldownExpiry) {
    return 'cooldown';
  }

  // All good — the button is available to press
  return 'available';
}

// ---------------------------------------------------------------------------
// Cooldown helpers
// ---------------------------------------------------------------------------

/**
 * Get the remaining cooldown time for a regulation, in seconds.
 *
 * Returns 0 if the regulation is not on cooldown.
 *
 * @param type     Which regulation
 * @param session  The current session state
 * @returns        Remaining cooldown in seconds (>= 0)
 */
export function getCooldownRemainingSec(
  type: RegulationType,
  session: Session
): number {
  const cooldownExpiry = session.cooldowns[type] || 0;
  const remaining = (cooldownExpiry - Date.now()) / 1000;
  return Math.max(0, remaining);
}

/**
 * Get cooldown progress as a fraction (0.0 to 1.0) for a cooldown bar.
 *
 * 1.0 means the cooldown just started (bar is full).
 * 0.0 means the cooldown is done (bar is empty / regulation is available).
 *
 * @param type     Which regulation
 * @param session  The current session state
 * @param config   The regulation's configuration (for total cooldown duration)
 * @returns        Cooldown progress fraction (0.0 to 1.0)
 */
export function getCooldownProgress(
  type: RegulationType,
  session: Session,
  config: RegulationConfig
): number {
  const remaining = getCooldownRemainingSec(type, session);
  if (remaining <= 0 || config.cooldownSec <= 0) return 0;
  return Math.min(1, remaining / config.cooldownSec);
}

// ---------------------------------------------------------------------------
// Active regulation helpers
// ---------------------------------------------------------------------------

/**
 * Get how many seconds remain on the currently active regulation.
 *
 * Returns 0 if no regulation is active or if it has expired.
 *
 * @param session  The current session state
 * @returns        Remaining seconds on the active regulation (>= 0)
 */
export function getActiveRegulationRemainingSec(session: Session): number {
  if (session.activeRegulation === null || session.regulationEndTime === null) {
    return 0;
  }
  const remaining = (session.regulationEndTime - Date.now()) / 1000;
  return Math.max(0, remaining);
}

/**
 * Get how far through the active regulation's duration we are (0.0 to 1.0).
 *
 * 1.0 means it just started, 0.0 means it's about to expire.
 * Useful for displaying a countdown bar on the active regulation button.
 *
 * @param session  The current session state
 * @param config   The regulation's configuration (for total duration)
 * @returns        Progress fraction (0.0 to 1.0), or 0 if nothing is active
 */
export function getActiveRegulationProgress(
  session: Session,
  config: RegulationConfig
): number {
  const remaining = getActiveRegulationRemainingSec(session);
  if (remaining <= 0 || config.durationSec <= 0) return 0;
  return Math.min(1, remaining / config.durationSec);
}

// ---------------------------------------------------------------------------
// Usage helpers
// ---------------------------------------------------------------------------

/**
 * Get how many uses of a regulation remain in this session.
 *
 * Returns `null` if the regulation has unlimited uses.
 *
 * @param type     Which regulation
 * @param session  The current session state
 * @param config   The regulation's configuration
 * @returns        Remaining uses (number), or null if unlimited
 */
export function getRemainingUses(
  type: RegulationType,
  session: Session,
  config: RegulationConfig
): number | null {
  if (config.maxUsesPerSession === null) return null;
  const used = session.usageCounts[type] || 0;
  return Math.max(0, config.maxUsesPerSession - used);
}

// ---------------------------------------------------------------------------
// Interruption penalty calculator
// ---------------------------------------------------------------------------

/**
 * Calculate the penalty (in seconds) when a regulation is interrupted.
 *
 * Getting interrupted during a regulation (e.g., pausing or switching apps
 * while Boost is active) incurs an EXTRA penalty on top of the normal
 * penalty. The multiplier comes from the regulation's config.
 *
 * For example, if the normal pause penalty is 15 seconds and the user
 * pauses during OVERTAKE (3x interruption multiplier), the total penalty
 * is 15 × 3 = 45 seconds.
 *
 * @param basePenaltySec              The base penalty amount (from PenaltyConfig)
 * @param interruptionPenaltyMultiplier  The regulation's interruption multiplier
 * @returns                           Total penalty in seconds
 */
export function calculateInterruptionPenalty(
  basePenaltySec: number,
  interruptionPenaltyMultiplier: number
): number {
  return basePenaltySec * interruptionPenaltyMultiplier;
}

// ---------------------------------------------------------------------------
// Config lookup helper
// ---------------------------------------------------------------------------

/**
 * Find the RegulationConfig for a given type within a season ruleset.
 *
 * Returns undefined if the regulation isn't part of this season.
 * For example, DRS is not in the 2026 season, Boost is not in 2025.
 *
 * @param type     Which regulation to look up
 * @param ruleset  The season's rules
 * @returns        The regulation's full config, or undefined
 */
export function getRegulationConfig(
  type: RegulationType,
  ruleset: SeasonRuleset
): RegulationConfig | undefined {
  return ruleset.regulations.find((r) => r.type === type);
}
