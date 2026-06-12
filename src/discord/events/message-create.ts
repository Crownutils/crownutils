import { Events } from 'discord.js';
import type { Event } from '@/discord/types/event.js';
import { prefixCommands } from '@/discord/registries/prefix-registry.js';
import { logger } from '@/shared/logger.js';
import {
  buildCommandPermissionsErrorContainer,
  buildErrorContainer,
} from '@/discord/errors.js';
import {
  checkCommandRequirements,
  resolveAuthorization,
  resolveExecutionContext,
} from '@/core/permissions/index.js';
import { lang } from '@/discord/lang/index.js';
import { PREFIX } from '@/discord/constants.js';

/**
 * Dispatches prefix commands: parses `PREFIX`-prefixed messages, checks
 * permission requirements, and reports unexpected errors back to the user.
 */
export const event = {
  name: Events.MessageCreate,

  async execute(message) {
    if (message.author.bot) return;

    if (!message.content.startsWith(PREFIX)) return;

    const withoutPrefix = message.content.slice(PREFIX.length);
    const parts = withoutPrefix.trim().split(/\s+/);
    const commandName = parts.shift()?.toLowerCase();
    const args = parts;

    if (!commandName) return;

    const command = prefixCommands.get(commandName);
    if (!command) return;

    if (command.requirements) {
      const validation = checkCommandRequirements(
        command.requirements,
        resolveExecutionContext(message.guildId),
        resolveAuthorization(message.author.id),
      );

      if (!validation.canBeExecuted) {
        const reply = buildCommandPermissionsErrorContainer(
          validation.errors,
        ).build();

        await message.reply(reply);
        return;
      }
    }

    try {
      await command.execute(message, args);
    } catch (error) {
      logger.error({ error }, `Error in prefix command: ${commandName}`);

      await message
        .reply(buildErrorContainer(lang.errors.unexpected).build())
        .catch(() => {});
    }
  },
} satisfies Event<Events.MessageCreate>;
