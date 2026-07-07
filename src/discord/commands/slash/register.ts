import { Locale, SlashCommandBuilder } from 'discord.js';
import { lang } from '@/discord/lang/index.js';
import {
  mountInteractiveReply,
  sendResponseToInteraction,
} from '@/discord/interactions/index.js';
import {
  canRegister,
  createRegisterController,
  runRegisterGateDenied,
} from '@/discord/usecases/index.js';
import { resolveUserLocale } from '@/discord/context/locale.js';
import type {
  SlashCommand,
  SlashCommandData,
} from '@/discord/registries/index.js';

function createRegisterCommandData(): SlashCommandData {
  return new SlashCommandBuilder()
    .setName('register')
    .setDescription(lang.en.commandRegister.description)
    .setDescriptionLocalizations({
      [Locale.French]: lang.fr.commandRegister.description,
    });
}

const command = {
  data: createRegisterCommandData(),
  requirements: { scope: 'anywhere', authorization: 'normal' },
  gate: (interaction) => canRegister(interaction.user.id),
  async onGateDenied(interaction) {
    const language = await resolveUserLocale(interaction.user.id);
    await sendResponseToInteraction(
      interaction,
      await runRegisterGateDenied(interaction.user.id, language),
    );
  },
  async execute(interaction) {
    const userId = interaction.user.id;
    const language = await resolveUserLocale(userId);

    await mountInteractiveReply(
      interaction,
      createRegisterController(userId, language),
    );
  },
} satisfies SlashCommand;

export default command;
