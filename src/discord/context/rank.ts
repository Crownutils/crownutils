import { getUserRank } from '@/core/repositories/index.js';
import { isOwner } from '@/core/permissions/index.js';
import type { Rank } from '@/core/permissions/index.js';

/**
 * The user's effective rank. The configured owner is always `owner` (so you
 * cannot lock yourself out); everyone else gets their stored rank.
 */
export async function resolveUserRank(userId: string): Promise<Rank> {
  if (isOwner(userId)) return 'owner';
  return getUserRank(userId);
}
