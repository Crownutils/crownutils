import { rankLevel, type Rank } from '../types.js';

/** Whether `userRank` meets or exceeds `requiredRank`. */
export function hasRank(userRank: Rank, requiredRank: Rank): boolean {
  return rankLevel(userRank) >= rankLevel(requiredRank);
}
