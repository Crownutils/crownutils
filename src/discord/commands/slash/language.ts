import { Locale, SlashCommandBuilder } from 'discord.js';
import { lang } from '@/discord/lang/index.js';
import { mountInteractiveReply } from '@/discord/interactions/index.js';
import { createLanguageController } from '@/discord/usecases/index.js';
import { resolveUserLocale } from '@/discord/locale.js';
import type {
  SlashCommand,
  SlashCommandData,
} from '@/discord/registries/index.js';

function createLanguageCommandData(): SlashCommandData {
  return new SlashCommandBuilder()
    .setName('language')
    .setDescription(lang.en.commandLanguage.description)
    .setDescriptionLocalizations({
      [Locale.French]: lang.fr.commandLanguage.description,
    });
}

const command = {
  data: createLanguageCommandData(),
  requirements: { scope: 'anywhere', authorization: 'everyone' },
  async execute(interaction) {
    const current = await resolveUserLocale(interaction.user.id);
    await mountInteractiveReply(
      interaction,
      createLanguageController(interaction.user.id, current),
    );
  },
} satisfies SlashCommand;

export default command;
