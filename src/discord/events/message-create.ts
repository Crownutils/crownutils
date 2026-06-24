import { Events } from 'discord.js';
import type { Event } from '@/discord/types/event.js';
import { prefixCommands } from '@/discord/registries/prefix-registry.js';
import { logger } from '@/shared/logger.js';
import {
  buildCommandPermissionsErrorContainer,
  buildErrorContainer,
  safeDiscord,
} from '@/discord/errors.js';
import { runCommandPipeline } from '@/discord/handlers/command-pipeline.js';
import { lang } from '@/discord/lang/index.js';
import { remindUnreadMails } from '@/discord/mails/unread-reminder.js';
import {
  attachLegalGate,
  buildLegalGateContainer,
} from '@/discord/presentations/legal-presentation.js';
import { PREFIX } from '@/discord/constants.js';

/**
 * Dispatches prefix commands: parses `PREFIX`-prefixed messages, checks
 * maintenance mode and permission requirements, and reports unexpected
 * errors back to the user.
 */
export const event = {
  name: Events.MessageCreate,

  async execute(message) {
    if (message.author.bot) return;

    const lowerMessage = message.content.toLowerCase();

    if (!lowerMessage.startsWith(PREFIX)) return;

    const withoutPrefix = lowerMessage.slice(PREFIX.length);
    const parts = withoutPrefix.trim().split(/\s+/);
    const commandName = parts.shift()?.toLowerCase();
    const args = parts;

    if (!commandName) return;

    const command = prefixCommands.get(commandName);
    if (!command) return;

    await runCommandPipeline(
      {
        userId: message.author.id,
        commandName: command.name,
        guildId: message.guildId,
        requirements: command.requirements,
      },
      {
        execute: () => command.execute(message, args),
        onExecuted:
          message.guildId !== null && command.name !== 'mails'
            ? () => remindUnreadMails(message.author.id, message.channel)
            : undefined,
        onMaintenance: () =>
          safeDiscord(
            message.reply(buildErrorContainer(lang.errors.maintenance).build()),
            'message-create.maintenance',
          ),
        onLegalNotAccepted: async () => {
          const sent = await safeDiscord(
            message.reply(buildLegalGateContainer().build()),
            'message-create.legalGate',
          );
          if (sent) attachLegalGate(sent, message.author.id);
        },
        onPermissionDenied: (errors) =>
          message.reply(buildCommandPermissionsErrorContainer(errors).build()),
        onUnexpectedError: (error) => {
          logger.error({ error }, `Error in prefix command: ${commandName}`);

          return safeDiscord(
            message.reply(buildErrorContainer(lang.errors.unexpected).build()),
            'message-create.unexpected',
          );
        },
      },
    );
  },
} satisfies Event<Events.MessageCreate>;
