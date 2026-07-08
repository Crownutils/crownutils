import { Locale, SlashCommandBuilder } from 'discord.js';
import { lang } from '@/discord/lang/index.js';
import {
  mountInteractiveReply,
  sendResponseToInteraction,
} from '@/discord/interactions/index.js';
import {
  createRegisterController,
  runRegisterAlreadyResponse,
} from '@/discord/features/register/register.service.js';
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
  async execute(interaction) {
    const userId = interaction.user.id;
    const language = await resolveUserLocale(userId);

    const alreadyRegistered = await runRegisterAlreadyResponse(
      userId,
      language,
    );
    if (alreadyRegistered) {
      await sendResponseToInteraction(interaction, alreadyRegistered);
      return;
    }

    await mountInteractiveReply(
      interaction,
      createRegisterController(userId, language),
    );
  },
} satisfies SlashCommand;

export default command;
