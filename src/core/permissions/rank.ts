/** Ranks in ascending order of access; a user's rank gates command authorization. */
export const RANK = ['banned', 'normal', 'privileged', 'owner'] as const;

/** A user's access rank, stored per-user and resolved on every command. */
export type Rank = (typeof RANK)[number];

/** Numeric access level of a rank (its index in {@link RANK}); higher grants more. */
export function rankLevel(rank: Rank): number {
  return RANK.indexOf(rank);
}

/** Whether `userRank` meets or exceeds `requiredRank`. */
export function hasRank(userRank: Rank, requiredRank: Rank): boolean {
  return rankLevel(userRank) >= rankLevel(requiredRank);
}

/** Narrow an arbitrary string to a {@link Rank}. */
export function isRank(value: string): value is Rank {
  return (RANK as readonly string[]).includes(value);
}
