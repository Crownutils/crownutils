import { sendResponseToInteraction } from '@/discord/interactions/index.js';
import { lang } from '@/discord/lang/index.js';
import { resolveUserLocale } from '@/discord/context/locale.js';
import type {
  SlashCommand,
  SlashCommandData,
} from '@/discord/registries/index.js';
import { Locale, SlashCommandBuilder } from 'discord.js';
import { runRankCommand } from '@/discord/usecases/index.js';

function createCommandRankData(): SlashCommandData {
  return new SlashCommandBuilder()
    .setName('rank')
    .setDescription(lang.en.commandRank.description)
    .setDescriptionLocalizations({
      [Locale.French]: lang.fr.commandRank.description,
    });
}

const command = {
  data: createCommandRankData(),
  requirements: { scope: 'guild', authorization: 'normal' },
  async execute(interaction) {
    const language = await resolveUserLocale(interaction.user.id);
    await sendResponseToInteraction(
      interaction,
      await runRankCommand(interaction.user.id, language),
    );
  },
} satisfies SlashCommand;

export default command;
