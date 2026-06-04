import { Events } from 'discord.js';
import { slashCommands } from '@/registries/slash-registry.js';
import type { Event } from '@/types/event.js';

export const event: Event<Events.InteractionCreate> = {
  name: Events.InteractionCreate,
  execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = slashCommands.get(interaction.commandName);
    if (!command) return;

    return command.execute(interaction);
  },
};
