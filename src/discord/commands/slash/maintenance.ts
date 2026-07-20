import { Locale, SlashCommandBuilder } from 'discord.js';
import { lang } from '@/discord/lang/index.js';
import { sendResponseToInteraction } from '@/discord/interactions/index.js';
import { resolveUserLocale } from '@/discord/context/locale.js';
import { runMaintenanceCommand } from '@/discord/features/maintenance/maintenance.service.js';
import type {
  SlashCommand,
  SlashCommandData,
} from '@/discord/registries/index.js';

function createMaintenanceCommandData(): SlashCommandData {
  return new SlashCommandBuilder()
    .setName('maintenance')
    .setDescription(lang.en.commandMaintenance.description)
    .setDescriptionLocalizations({
      [Locale.French]: lang.fr.commandMaintenance.description,
    })
    .addBooleanOption((option) =>
      option
        .setName('enabled')
        .setDescription(lang.en.commandMaintenance.messages.stateOption)
        .setDescriptionLocalizations({
          [Locale.French]: lang.fr.commandMaintenance.messages.stateOption,
        })
        .setRequired(true),
    );
}

const command = {
  data: createMaintenanceCommandData(),
  requirements: { scope: 'anywhere', authorization: 'owner' },
  async execute(interaction) {
    const enabled = interaction.options.getBoolean('enabled', true);
    const language = await resolveUserLocale(interaction.user.id);
    await sendResponseToInteraction(
      interaction,
      await runMaintenanceCommand(enabled, language),
    );
  },
} satisfies SlashCommand;

export default command;
