const MAX_RANK_FOR_BONUS_SCORE = 200;

export function computeLeagueBonusScore(rank: number): number {
  if (rank > MAX_RANK_FOR_BONUS_SCORE) {
    return 0;
  }

  const result = Math.round(2995 - Math.sqrt(80000 * (rank - 1)) + 5 * rank);

  return Math.ceil(result / 10) * 10;
}
