import { Locale, SlashCommandBuilder } from 'discord.js';
import { resolveUserLocale } from '@/discord/context/locale.js';
import { mountInteractiveReply } from '@/discord/interactions/index.js';
import { lang } from '@/discord/lang/index.js';
import { createCrowniclesHelpController } from '@/discord/features/crownicles-help/crownicles-help.service.js';
import type {
  SlashCommand,
  SlashCommandData,
} from '@/discord/registries/index.js';

function createCrowniclesHelpCommandData(): SlashCommandData {
  return new SlashCommandBuilder()
    .setName('crownicles-help')
    .setDescription(lang.en.commandCrowniclesHelp.description)
    .setDescriptionLocalizations({
      [Locale.French]: lang.fr.commandCrowniclesHelp.description,
    });
}

const command = {
  data: createCrowniclesHelpCommandData(),
  requirements: { scope: 'anywhere', authorization: 'normal' },
  async execute(interaction) {
    const locale = await resolveUserLocale(interaction.user.id);
    await mountInteractiveReply(
      interaction,
      createCrowniclesHelpController(interaction.user.id, locale),
    );
  },
} satisfies SlashCommand;

export default command;
