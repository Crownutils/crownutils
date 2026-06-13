import { Events } from 'discord.js';
import { slashCommands } from '@/discord/registries/slash-registry.js';
import type { Event } from '@/discord/types/event.js';
import {
  checkCommandRequirements,
  resolveAuthorization,
  resolveExecutionContext,
} from '@/core/permissions/index.js';
import { isMaintenanceEnabled } from '@/core/maintenance/maintenance-repository.js';
import {
  buildCommandPermissionsErrorContainer,
  buildErrorContainer,
} from '@/discord/errors.js';
import { lang } from '@/discord/lang/index.js';
import { logger } from '@/shared/logger.js';

/**
 * Dispatches slash command interactions: checks maintenance mode and
 * permission requirements, runs the command, and reports unexpected errors
 * back to the user.
 */
export const event = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = slashCommands.get(interaction.commandName);
    if (!command) return;

    const userAuthorization = resolveAuthorization(interaction.user.id);

    if (userAuthorization !== 'owner' && (await isMaintenanceEnabled())) {
      const reply = buildErrorContainer(lang.errors.maintenance).build({
        ephemeral: true,
      });

      await interaction.reply(reply);
      return;
    }

    if (command.requirements) {
      const validation = checkCommandRequirements(
        command.requirements,
        resolveExecutionContext(interaction.guildId),
        userAuthorization,
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
