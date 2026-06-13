import { SlashCommandBuilder } from 'discord.js';
import { lang } from '@/discord/lang/index.js';
import {
  isMaintenanceEnabled,
  setMaintenanceEnabled,
} from '@/core/maintenance/maintenance-repository.js';
import { buildMaintenanceToggledContainer } from '@/discord/presentations/maintenance-presentation.js';
import type { SlashCommand } from '@/discord/types/command.js';

/** `/maintenance`: toggles maintenance mode. Owner-only. */
export const command = {
  data: new SlashCommandBuilder()
    .setName('maintenance')
    .setDescription(lang.commands.maintenance.commandDescription),
  requirements: {
    scope: 'main_guild',
    authorization: 'owner',
  },
  help: {
    usageSlash: '/maintenance',
  },

  async execute(interaction) {
    const enabled = !(await isMaintenanceEnabled());
    await setMaintenanceEnabled(enabled);

    await interaction.reply(buildMaintenanceToggledContainer(enabled).build());
  },
} satisfies SlashCommand;
