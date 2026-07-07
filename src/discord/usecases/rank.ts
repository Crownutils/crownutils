import type { SupportedLocale } from '@/core/types.js';
import type { CommandResponse } from '../interactions/index.js';
import { assertNotBanned, rankLevel } from '@/core/permissions/rank.js';
import { getUserRank } from '@/core/repositories/index.js';
import { buildRankContainer } from '../presentations/index.js';

export async function runRankCommand(
  userId: string,
  language: SupportedLocale,
): Promise<CommandResponse> {
  const userRank = assertNotBanned(await getUserRank(userId));
  const userRankLevel = rankLevel(userRank);
  return {
    container: buildRankContainer(language, userRank, userRankLevel),
  };
}
