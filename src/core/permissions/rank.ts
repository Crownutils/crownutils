/** Ranks in ascending order of access; a user's rank gates command authorization. */
export const RANK = ['banned', 'normal', 'privileged', 'owner'] as const;

/** A user's access rank, stored per-user and resolved on every command. */
export type Rank = (typeof RANK)[number];

export type NotBannedRank = Exclude<Rank, 'banned'>;

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

/** A rank a command may assign; `owner` is never grantable. */
export type AssignableRank = Exclude<Rank, 'owner'>;

/** The ranks that can be assigned (everything but `owner`). */
export const ASSIGNABLE_RANKS: readonly AssignableRank[] = RANK.filter(
  (rank): rank is AssignableRank => rank !== 'owner',
);

/** Narrow an arbitrary string to an {@link AssignableRank}. */
export function isAssignableRank(value: string): value is AssignableRank {
  return (ASSIGNABLE_RANKS as readonly string[]).includes(value);
}
