import { sendResponseToInteraction } from '@/discord/interactions/index.js';
import { lang } from '@/discord/lang/index.js';
import { resolveUserLocale } from '@/discord/context/locale.js';
import type {
  SlashCommand,
  SlashCommandData,
} from '@/discord/registries/index.js';
import { runAboutCommand } from '@/discord/usecases/about.js';
import { Locale, SlashCommandBuilder } from 'discord.js';

function createCommandAboutData(): SlashCommandData {
  return new SlashCommandBuilder()
    .setName('about')
    .setDescription(lang.en.commandAbout.description)
    .setDescriptionLocalizations({
      [Locale.French]: lang.fr.commandAbout.description,
    });
}

const command = {
  data: createCommandAboutData(),
  requirements: { scope: 'guild', authorization: 'normal' },
  async execute(interaction) {
    await sendResponseToInteraction(
      interaction,
      runAboutCommand(await resolveUserLocale(interaction.user.id)),
    );
  },
} satisfies SlashCommand;

export default command;
