import { Events } from 'discord.js';
import type { Event } from '@/types/event.js';
import { prefixCommands } from '@/registries/prefix-registry.js';
import { logger } from '@/lib/logger.js';
import { buildCommandPermissionsErrorContainer } from '@/lib/errors.js';
import { checkCommandRequirements } from '@/lib/command-requirements.js';

const PREFIX = '!';

export const event: Event<Events.MessageCreate> = {
  name: Events.MessageCreate,

  async execute(message) {
    if (message.author.bot) {
      return;
    }

    if (!message.content.startsWith(PREFIX)) {
      return;
    }

    const withoutPrefix = message.content.slice(PREFIX.length);
    const parts = withoutPrefix.trim().split(/\s+/);
    const commandName = parts.shift()?.toLowerCase();
    const args = parts;

    if (!commandName) {
      return;
    }

    const command = prefixCommands.get(commandName);
    if (!command) {
      return;
    }

    if (command.requirements) {
      const isRequirementsValid = checkCommandRequirements(
        command.requirements,
        message.guildId,
        message.author.id,
      );

      if (!isRequirementsValid.canBeExecuted) {
        const reply = buildCommandPermissionsErrorContainer(
          isRequirementsValid.missing_permissions,
        ).build();

        await message.reply(reply);
        return;
      }
    }

    try {
      await command.execute(message, args);
    } catch (error) {
      logger.error({ error }, `Error in prefix command: ${commandName}`);
    }
  },
};
