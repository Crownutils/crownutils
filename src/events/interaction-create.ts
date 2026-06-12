import { Events } from 'discord.js';
import { slashCommands } from '@/registries/slash-registry.js';
import type { Event } from '@/types/event.js';
import {
  checkCommandRequirements,
  resolveAuthorization,
  resolveExecutionContext,
} from '@/core/permissions/index.js';
import {
  buildCommandPermissionsErrorContainer,
  buildErrorContainer,
} from '@/lib/errors.js';
import { lang } from '@/lang/index.js';
import { logger } from '@/lib/logger.js';

export const event = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = slashCommands.get(interaction.commandName);
    if (!command) return;

    if (command.requirements) {
      const validation = checkCommandRequirements(
        command.requirements,
        resolveExecutionContext(interaction.guildId),
        resolveAuthorization(interaction.user.id),
      );

      if (!validation.canBeExecuted) {
        const reply = buildCommandPermissionsErrorContainer(
          validation.errors,
        ).build({ ephemeral: true });

        await interaction.reply(reply);
        return;
      }
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      logger.error(
        { error, command: interaction.commandName },
        'Slash command execution failed.',
      );

      const reply = buildErrorContainer(lang.errors.unexpected).build({
        ephemeral: true,
      });

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply).catch(() => {});
      } else {
        await interaction.reply(reply).catch(() => {});
      }
    }
  },
} satisfies Event<Events.InteractionCreate>;
