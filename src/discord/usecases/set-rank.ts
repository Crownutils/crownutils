import type { SupportedLocale } from '@/core/types.js';
import { isOwner, type AssignableRank } from '@/core/permissions/index.js';
import { banUser, getUserRank, setUserRank } from '@/core/repositories/index.js';
import type { CommandResponse } from '../interactions/index.js';
import { lang } from '../lang/index.js';
import { buildErrorContainer } from '../utils/errors.js';
import { buildSetRankContainer } from '../presentations/index.js';

/**
 * Change `targetId`'s rank, rejecting changes to yourself, to the owner, or to a
 * rank the user already has. Assigning `banned` goes through {@link banUser} so
 * the ban is fully recorded. Every response is ephemeral.
 */
export async function runSetRankCommand(
  targetId: string,
  targetMention: string,
  rank: AssignableRank,
  executorId: string,
  language: SupportedLocale,
): Promise<CommandResponse> {
  const messages = lang[language].commandSetRank.messages;

  if (targetId === executorId) {
    return {
      container: buildErrorContainer(messages.cannotChangeSelf),
      ephemeral: true,
    };
  }
  if (isOwner(targetId)) {
    return {
      container: buildErrorContainer(messages.cannotChangeOwner),
      ephemeral: true,
    };
  }
  if ((await getUserRank(targetId)) === rank) {
    return {
      container: buildErrorContainer(
        messages.alreadyThatRank(targetMention, rank),
      ),
      ephemeral: true,
    };
  }

  if (rank === 'banned') {
    await banUser(targetId);
  } else {
    await setUserRank(targetId, rank);
  }

  return {
    container: buildSetRankContainer(targetMention, rank, language),
    ephemeral: true,
  };
}
