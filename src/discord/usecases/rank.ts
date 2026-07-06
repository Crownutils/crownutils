import type { SupportedLocale } from '@/core/types.js';
import type { CommandResponse } from '../interactions/index.js';
import type { NotBannedRank, Rank } from '@/core/permissions/rank.js';
import { buildRankContainer } from '../presentations/index.js';

export function runRankCommand(
  language: SupportedLocale,
  userRank: NotBannedRank,
  userRankLevel: number,
): CommandResponse {
  return {
    container: buildRankContainer(language, userRank, userRankLevel),
  };
}
