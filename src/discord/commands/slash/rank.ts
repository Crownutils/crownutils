import { sendResponseToInteraction } from '@/discord/interactions/index.js';
import { lang } from '@/discord/lang/index.js';
import { resolveUserLocale } from '@/discord/context/locale.js';
import type {
  SlashCommand,
  SlashCommandData,
} from '@/discord/registries/index.js';
import { Locale, SlashCommandBuilder } from 'discord.js';
import { getUserRank } from '@/core/repositories/user-repository.js';
import { rankLevel } from '@/core/permissions/rank.js';
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
    const userRank = await getUserRank(interaction.user.id);
    if (userRank === 'banned') {
      throw new Error('Unexpected banned user reached a command.');
    }

    const userRankLevel = rankLevel(userRank);
    await sendResponseToInteraction(
      interaction,
      runRankCommand(
        await resolveUserLocale(interaction.user.id),
        userRank,
        userRankLevel,
      ),
    );
  },
} satisfies SlashCommand;

export default command;
