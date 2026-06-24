import type { Channel } from 'discord.js';
import { getUnreadNotice } from '@/core/mails/mail-repository.js';
import { hasAcceptedLegal } from '@/core/legal/legal-repository.js';
import { resolveAuthorization } from '@/core/permissions/index.js';
import { buildUnreadNoticeContainer } from '@/discord/presentations/mail-presentation.js';
import { logger } from '@/shared/logger.js';

/**
 * Sends the once-per-day unread-mail reminder into `channel` if the user has
 * unread mails and hasn't been reminded today. No-op for DMs (callers pass
 * `null` there), unsendable channels, or users who haven't cleared the legal
 * gate (the owner is exempt; everyone else must have accepted). Never throws -
 * a failed reminder must not affect the command that triggered it.
 */
export async function remindUnreadMails(
  userId: string,
  channel: Channel | null,
): Promise<void> {
  try {
    if (!channel?.isSendable()) {
      return;
    }
    if (
      resolveAuthorization(userId) !== 'owner' &&
      !(await hasAcceptedLegal(userId))
    ) {
      return;
    }
    const count = await getUnreadNotice(userId);
    if (count === null) {
      return;
    }
    await channel.send(buildUnreadNoticeContainer(count).build());
  } catch (error) {
    logger.error({ error, userId }, 'Failed to send unread-mail reminder.');
  }
}
