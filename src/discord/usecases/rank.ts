import {
  assertNotBanned,
  rankLevel,
  type SupportedLocale,
} from '@/core/types.js';
import type { CommandResponse } from '../interactions/index.js';
import { getUserRank } from '@/core/repositories/index.js';
import { buildRankContainer } from '../presentations/index.js';

/** Builds the `rank` command's response: the caller's own rank and its numeric level. */
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
