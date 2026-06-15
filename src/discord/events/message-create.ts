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
        guildId: message.guildId,
        requirements: command.requirements,
      },
      {
        execute: () => command.execute(message, args),
        onMaintenance: () =>
          safeDiscord(
            message.reply(buildErrorContainer(lang.errors.maintenance).build()),
            'message-create.maintenance',
          ),
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
