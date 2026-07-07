import { Locale, SlashCommandBuilder } from 'discord.js';
import { resolveUserLocale } from '@/discord/context/locale.js';
import { sendResponseToInteraction } from '@/discord/interactions/index.js';
import { lang } from '@/discord/lang/index.js';
import {
  canRunDataCommand,
  runDataCommand,
  runDataCommandGateDenied,
} from '@/discord/usecases/index.js';
import type {
  SlashCommand,
  SlashCommandData,
} from '@/discord/registries/index.js';

function createCommandDataData(): SlashCommandData {
  return new SlashCommandBuilder()
    .setName('data')
    .setDescription(lang.en.commandData.description)
    .setDescriptionLocalizations({
      [Locale.French]: lang.fr.commandData.description,
    });
}

const command = {
  data: createCommandDataData(),
  requirements: { scope: 'anywhere', authorization: 'normal' },
  gate: (interaction) => canRunDataCommand(interaction.user.id),
  async onGateDenied(interaction) {
    const language = await resolveUserLocale(interaction.user.id);
    await sendResponseToInteraction(
      interaction,
      await runDataCommandGateDenied(interaction.user.id, language),
    );
  },
  async execute(interaction) {
    const language = await resolveUserLocale(interaction.user.id);
    await sendResponseToInteraction(
      interaction,
      await runDataCommand(interaction.user.id, language),
    );
  },
} satisfies SlashCommand;

export default command;
