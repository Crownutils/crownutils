import { Locale, SlashCommandBuilder } from 'discord.js';
import { lang } from '@/discord/lang/index.js';
import { mountInteractiveReply } from '@/discord/interactions/index.js';
import { createLegalController } from '@/discord/usecases/index.js';
import { resolveUserLocale } from '@/discord/locale.js';
import type {
  SlashCommand,
  SlashCommandData,
} from '@/discord/registries/index.js';

function createLegalCommandData(): SlashCommandData {
  return new SlashCommandBuilder()
    .setName('legal')
    .setDescription(lang.en.commandLegal.description)
    .setDescriptionLocalizations({
      [Locale.French]: lang.fr.commandLegal.description,
    });
}

const command = {
  data: createLegalCommandData(),
  requirements: { scope: 'anywhere', authorization: 'everyone' },
  async execute(interaction) {
    const language = await resolveUserLocale(interaction.user.id);
    await mountInteractiveReply(
      interaction,
      createLegalController(interaction.user.id, language),
    );
  },
} satisfies SlashCommand;

export default command;
