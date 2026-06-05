import { Events } from 'discord.js';
import type { Event } from '@/types/event.js';
import { prefixCommands } from '@/registries/prefix-registry.js';
import { logger } from '@/lib/logger.js';

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

    try {
      await command.execute(message, args);
    } catch (error) {
      logger.error({ error }, `Error in prefix command: ${commandName}`);
    }
  },
};
