import { Locale, SlashCommandBuilder } from 'discord.js';
import { resolveUserLocale } from '@/discord/context/locale.js';
import { mountInteractiveReply } from '@/discord/interactions/index.js';
import { lang } from '@/discord/lang/index.js';
import { createCrowniclesHelpController } from '@/discord/features/crownicles-help/crownicles-help.service.js';
import {
  DEEP_LINK_PAGES,
  resolveHelpPage,
} from '@/discord/features/crownicles-help/pages/index.js';
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
    })
    .addStringOption((option) => {
      option
        .setName('category')
        .setDescription(lang.en.commandCrowniclesHelp.messages.categoryOption)
        .setDescriptionLocalizations({
          [Locale.French]:
            lang.fr.commandCrowniclesHelp.messages.categoryOption,
        })
        .setRequired(false);
      for (const page of DEEP_LINK_PAGES) {
        option.addChoices({
          name: page.name('en'),
          name_localizations: { [Locale.French]: page.name('fr') },
          value: page.id,
        });
      }
      return option;
    });
}

const command = {
  data: createCrowniclesHelpCommandData(),
  requirements: { scope: 'anywhere', authorization: 'normal' },
  async execute(interaction) {
    const locale = await resolveUserLocale(interaction.user.id);
    const category = interaction.options.getString('category') ?? undefined;

    // Pre-loading a data-backed category can outlast the 3s reply window.
    if (resolveHelpPage(category).loadData !== undefined) {
      await interaction.deferReply();
    }

    await mountInteractiveReply(
      interaction,
      await createCrowniclesHelpController(
        interaction.user.id,
        locale,
        category,
      ),
    );
  },
} satisfies SlashCommand;

export default command;
