/** Locales the bot speaks; mirrors the Prisma `Language` enum. */
export const SUPPORTED_LOCALES = ['fr', 'en'] as const;

/** A language the bot can reply in. */
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/** Narrow an arbitrary string to a {@link SupportedLocale}. */
export function isSupportedLocale(value: string): value is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/** Ranks in ascending order of access; mirrors the Prisma `Rank` enum. */
export const RANK = ['banned', 'normal', 'privileged', 'owner'] as const;

/** A user's access rank, stored per-user and resolved on every command. */
export type Rank = (typeof RANK)[number];

/** Narrow an arbitrary string to a {@link Rank}. */
export function isRank(value: string): value is Rank {
  return (RANK as readonly string[]).includes(value);
}

/** Numeric access level of a rank (its index in {@link RANK}); higher grants more. */
export function rankLevel(rank: Rank): number {
  return RANK.indexOf(rank);
}

/** A rank that isn't `banned`; `banned` users never reach authorized code. */
export type NotBannedRank = Exclude<Rank, 'banned'>;

/** Narrows `rank` to {@link NotBannedRank}; throws if it is `banned` (the pipeline never lets that reach a command). */
export function assertNotBanned(rank: Rank): NotBannedRank {
  if (rank === 'banned') {
    throw new Error('Unexpected banned user reached a command.');
  }
  return rank;
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
