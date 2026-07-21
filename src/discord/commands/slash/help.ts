import { Locale, SlashCommandBuilder } from 'discord.js';
import { getUserRank } from '@/core/repositories/index.js';
import { resolveUserLocale } from '@/discord/context/locale.js';
import { mountInteractiveReply } from '@/discord/interactions/index.js';
import { lang } from '@/discord/lang/index.js';
import { createHelpController } from '@/discord/features/help/help.service.js';
import type {
  SlashCommand,
  SlashCommandData,
} from '@/discord/registries/index.js';

function createHelpCommandData(): SlashCommandData {
  return new SlashCommandBuilder()
    .setName('help')
    .setDescription(lang.en.commandHelp.description)
    .setDescriptionLocalizations({
      [Locale.French]: lang.fr.commandHelp.description,
    });
}

const command = {
  data: createHelpCommandData(),
  requirements: { scope: 'anywhere', authorization: 'normal' },
  async execute(interaction) {
    const [locale, rank] = await Promise.all([
      resolveUserLocale(interaction.user.id),
      getUserRank(interaction.user.id),
    ]);
    await mountInteractiveReply(
      interaction,
      createHelpController(
        interaction.user.id,
        locale,
        rank,
        interaction.client.registries,
      ),
      { ephemeral: true },
    );
  },
} satisfies SlashCommand;

export default command;
