import { Locale, SlashCommandBuilder } from 'discord.js';
import { lang } from '@/discord/lang/index.js';
import { sendResponseToInteraction } from '@/discord/interactions/index.js';
import { resolveUserLocale } from '@/discord/context/locale.js';
import { runSetRankCommand } from '@/discord/usecases/index.js';
import { ASSIGNABLE_RANKS, isAssignableRank } from '@/core/types.js';
import type {
  SlashCommand,
  SlashCommandData,
} from '@/discord/registries/index.js';

function createSetRankCommandData(): SlashCommandData {
  return new SlashCommandBuilder()
    .setName('set-rank')
    .setDescription(lang.en.commandSetRank.description)
    .setDescriptionLocalizations({
      [Locale.French]: lang.fr.commandSetRank.description,
    })
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription(lang.en.commandSetRank.messages.userOption)
        .setDescriptionLocalizations({
          [Locale.French]: lang.fr.commandSetRank.messages.userOption,
        })
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('rank')
        .setDescription(lang.en.commandSetRank.messages.rankOption)
        .setDescriptionLocalizations({
          [Locale.French]: lang.fr.commandSetRank.messages.rankOption,
        })
        .setRequired(true)
        .addChoices(
          ...ASSIGNABLE_RANKS.map((rank) => ({ name: rank, value: rank })),
        ),
    );
}

const command = {
  data: createSetRankCommandData(),
  requirements: { scope: 'guild', authorization: 'owner' },
  async execute(interaction) {
    const target = interaction.options.getUser('user', true);
    const rank = interaction.options.getString('rank', true);
    if (!isAssignableRank(rank)) {
      throw new Error(`Unexpected rank option: ${rank}`);
    }

    const language = await resolveUserLocale(interaction.user.id);
    await sendResponseToInteraction(
      interaction,
      await runSetRankCommand(
        target.id,
        target.toString(),
        rank,
        interaction.user.id,
        language,
      ),
    );
  },
} satisfies SlashCommand;

export default command;
