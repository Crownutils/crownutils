import { MessageFlags } from 'discord.js';
import type { Message, RepliableInteraction } from 'discord.js';
import { logger } from '@/shared/index.js';
import { toError } from '@/discord/errors.js';

export type SafeDiscordContext = Record<string, unknown>;

/**
 * Wrap a best-effort Discord API call: on failure, log a warning with context
 * and resolve to `undefined` instead of throwing. Use it for calls whose
 * failure must not abort the surrounding flow (e.g. a courtesy error reply).
 */
export async function safeDiscord<T>(
  operation: Promise<T>,
  context: SafeDiscordContext,
): Promise<T | undefined> {
  try {
    return await operation;
  } catch (error) {
    logger.warn({ err: toError(error), ...context }, 'Discord call failed');
    return undefined;
  }
}

/** Best-effort ephemeral text reply to an interaction (never throws). */
export async function safeReplyToInteraction(
  interaction: RepliableInteraction,
  content: string,
): Promise<void> {
  const payload = { content, flags: MessageFlags.Ephemeral } as const;
  if (interaction.replied || interaction.deferred) {
    await safeDiscord(interaction.followUp(payload), { action: 'followUp' });
    return;
  }
  await safeDiscord(interaction.reply(payload), { action: 'reply' });
}

/** Best-effort text reply to a message (never throws). */
export async function safeReplyToMessage(
  message: Message,
  content: string,
): Promise<void> {
  await safeDiscord(message.reply({ content }), { action: 'messageReply' });
}
