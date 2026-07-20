/**
 * The experience a big-event outcome grants is not the `bonusExperience` field:
 * the game derives it from a base, situational bonuses and effect penalties,
 * then adds `bonusExperience` last. This mirrors Crownicles'
 * `applyOutcomeExperience` so the help page shows the real number.
 *
 * Balance constants vendored from `Lib/src/constants/BigEventConstants.ts`
 * (values are stable; update here if the game rebalances them).
 */
const EXPERIENCE = {
  BASE: 172,
  HEALTH_BONUS: 230,
  RANDOM_ITEM_BONUS: 345,
  MONEY_BONUS: 115,
  OCCUPIED_PENALTY: 125,
  SLEEPING_STARVING_PENALTY: 130,
  CONFOUNDED_PENALTY: 140,
} as const;

/** Effect ids that alter the experience gain, matching the game's `Effect` table. */
const NO_EFFECT_ID = 'none';
const OCCUPIED_ID = 'occupied';
const SLEEPING_ID = 'sleeping';
const STARVING_ID = 'starving';
const CONFOUNDED_ID = 'confounded';

/** The outcome fields the experience formula reads (all optional, as in the raw data). */
export interface OutcomeExperienceInputs {
  readonly health?: number | undefined;
  readonly money?: number | undefined;
  readonly effect?: string | undefined;
  readonly oneshot?: boolean | undefined;
  readonly givesRandomItem?: boolean | undefined;
  readonly bonusExperience?: number | undefined;
}

/**
 * Effective experience a player gains from an outcome, faithful to the game
 * formula: base + bonuses (health gain, random item, money gain) minus the
 * penalty of certain effects, zeroed when the outcome hurts (health loss,
 * one-shot) or applies any other alteration, then `bonusExperience` added last.
 */
export function computeOutcomeExperience(o: OutcomeExperienceInputs): number {
  const health = o.health ?? 0;
  const money = o.money ?? 0;

  let experience =
    EXPERIENCE.BASE +
    (health > 0 ? EXPERIENCE.HEALTH_BONUS : 0) +
    (o.givesRandomItem === true ? EXPERIENCE.RANDOM_ITEM_BONUS : 0) +
    (money > 0 ? EXPERIENCE.MONEY_BONUS : 0);

  switch (o.effect ?? NO_EFFECT_ID) {
    case OCCUPIED_ID:
      experience -= EXPERIENCE.OCCUPIED_PENALTY;
      break;
    case SLEEPING_ID:
    case STARVING_ID:
      experience -= EXPERIENCE.SLEEPING_STARVING_PENALTY;
      break;
    case CONFOUNDED_ID:
      experience -= EXPERIENCE.CONFOUNDED_PENALTY;
      break;
    case NO_EFFECT_ID:
      break;
    default:
      // Any other alteration cancels the earned experience entirely.
      experience = 0;
  }

  if (health < 0 || o.oneshot === true || experience < 0) {
    experience = 0;
  }
  return experience + (o.bonusExperience ?? 0);
}
