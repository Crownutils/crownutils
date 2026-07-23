import type { NotBannedRank, Rank } from '../types.js';
import { hasRank } from './rank.js';

/**
 * The minimum rank a command requires. `banned` is excluded: banned users are
 * blocked from every command, so it is never a level a command can require.
 */
export type Authorization = NotBannedRank;

/** The per-user facts an authorization check reads. */
export interface AuthorizationContext {
  /** The invoking user's effective rank. */
  readonly rank: Rank;
}

/** Whether the invoking user's rank satisfies the command's required rank. */
export function isAuthorized(
  authorization: Authorization,
  context: AuthorizationContext,
): boolean {
  return hasRank(context.rank, authorization);
}
