import { Locale, SlashCommandBuilder } from 'discord.js';
import { resolveUserLocale } from '@/discord/context/locale.js';
import {
  mountInteractiveReply,
  sendResponseToInteraction,
} from '@/discord/interactions/index.js';
import { lang } from '@/discord/lang/index.js';
import { prepareDeleteData } from '@/discord/features/delete-data/delete-data.service.js';
import type {
  SlashCommand,
  SlashCommandData,
} from '@/discord/registries/index.js';

function createDeleteDataCommandData(): SlashCommandData {
  return new SlashCommandBuilder()
    .setName('delete-data')
    .setDescription(lang.en.commandDeleteData.description)
    .setDescriptionLocalizations({
      [Locale.French]: lang.fr.commandDeleteData.description,
    });
}

const command = {
  data: createDeleteDataCommandData(),
  requirements: { scope: 'anywhere', authorization: 'normal' },
  async execute(interaction) {
    const locale = await resolveUserLocale(interaction.user.id);
    const prepared = await prepareDeleteData(interaction.user.id, locale);

    if (prepared.kind === 'empty') {
      await sendResponseToInteraction(interaction, prepared.response);
      return;
    }
    await mountInteractiveReply(interaction, prepared.controller, {
      ephemeral: true,
    });
  },
} satisfies SlashCommand;

export default command;
