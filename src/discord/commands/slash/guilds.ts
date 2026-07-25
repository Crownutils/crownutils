import { Locale, SlashCommandBuilder } from 'discord.js';
import { resolveUserLocale } from '@/discord/context/locale.js';
import { mountInteractiveReply } from '@/discord/interactions/index.js';
import { lang } from '@/discord/lang/index.js';
import {
  collectGuildOverview,
  createGuildListController,
} from '@/discord/features/guilds/guilds.service.js';
import type {
  SlashCommand,
  SlashCommandData,
} from '@/discord/registries/index.js';

function createGuildsCommandData(): SlashCommandData {
  return new SlashCommandBuilder()
    .setName('guilds')
    .setDescription(lang.en.commandGuilds.description)
    .setDescriptionLocalizations({
      [Locale.French]: lang.fr.commandGuilds.description,
    });
}

const command = {
  data: createGuildsCommandData(),
  requirements: { scope: 'anywhere', authorization: 'owner' },
  async execute(interaction) {
    const locale = await resolveUserLocale(interaction.user.id);
    const overview = collectGuildOverview(interaction.client);
    await mountInteractiveReply(
      interaction,
      createGuildListController(overview, interaction.user.id, locale),
      { ephemeral: true },
    );
  },
} satisfies SlashCommand;

export default command;
