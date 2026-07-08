import { Locale, SlashCommandBuilder } from 'discord.js';
import { resolveUserLocale } from '@/discord/context/locale.js';
import { sendResponseToInteraction } from '@/discord/interactions/index.js';
import { lang } from '@/discord/lang/index.js';
import { runDataCommand } from '@/discord/features/data/data.service.js';
import type {
  SlashCommand,
  SlashCommandData,
} from '@/discord/registries/index.js';

function createDataCommandData(): SlashCommandData {
  return new SlashCommandBuilder()
    .setName('data')
    .setDescription(lang.en.commandData.description)
    .setDescriptionLocalizations({
      [Locale.French]: lang.fr.commandData.description,
    });
}

const command = {
  data: createDataCommandData(),
  requirements: { scope: 'anywhere', authorization: 'normal' },
  async execute(interaction) {
    const language = await resolveUserLocale(interaction.user.id);
    await sendResponseToInteraction(
      interaction,
      await runDataCommand(
        interaction.user.id,
        language,
        interaction.inGuild(),
      ),
    );
  },
} satisfies SlashCommand;

export default command;
