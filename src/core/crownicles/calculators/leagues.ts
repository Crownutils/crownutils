const MAX_RANK_FOR_BONUS_SCORE = 200;
/** Bonus scores are rounded up to a multiple of this. */
const SCORE_ROUNDING = 10;

/**
 * End-of-season rank bonus, reimplemented from the Crownicles formula (a fact
 * reproduced in our own code per the project NOTICE):
 * `round(2995 - sqrt(80000 * (rank - 1)) + 5 * rank)`, rounded up to the
 * nearest 10. Ranks beyond {@link MAX_RANK_FOR_BONUS_SCORE} earn nothing.
 */
export function computeLeagueBonusScore(rank: number): number {
  if (rank > MAX_RANK_FOR_BONUS_SCORE) {
    return 0;
  }

  const result = Math.round(2995 - Math.sqrt(80000 * (rank - 1)) + 5 * rank);

  return Math.ceil(result / SCORE_ROUNDING) * SCORE_ROUNDING;
}
