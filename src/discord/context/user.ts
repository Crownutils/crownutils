import { getUserProfile } from '@/core/repositories/index.js';
import { isOwner } from '@/core/permissions/index.js';
import type { Rank } from '@/core/permissions/index.js';
import type { SupportedLocale } from '@/core/types.js';

/** The per-user facts the command pipeline needs, resolved from a single row read. */
export interface UserContext {
  readonly locale: SupportedLocale;
  readonly rank: Rank;
}

/**
 * Resolves a user's locale and effective rank together in one query. The
 * configured owner is always `owner` (so you cannot lock yourself out);
 * everyone else gets their stored rank.
 */
export async function resolveUserContext(userId: string): Promise<UserContext> {
  const { language, rank } = await getUserProfile(userId);
  return { locale: language, rank: isOwner(userId) ? 'owner' : rank };
}
