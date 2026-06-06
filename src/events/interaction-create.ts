import { Events } from 'discord.js';
import { slashCommands } from '@/registries/slash-registry.js';
import type { Event } from '@/types/event.js';
import { checkCommandRequirements } from '@/lib/command-requirements.js';
import { buildCommandPermissionsErrorContainer } from '@/lib/errors.js';

export const event: Event<Events.InteractionCreate> = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = slashCommands.get(interaction.commandName);
    if (!command) return;

    if (command.requirements) {
      const isRequirementsValid = checkCommandRequirements(
        command.requirements,
        interaction.guildId,
        interaction.user.id,
      );

      if (!isRequirementsValid.canBeExecuted) {
        const reply = buildCommandPermissionsErrorContainer(
          isRequirementsValid.missing_permissions,
        ).build({ ephemeral: true });

        await interaction.reply(reply);
        return;
      }
    }

    return command.execute(interaction);
  },
};
