import { Locale, SlashCommandBuilder } from 'discord.js';
import { lang } from '@/discord/lang/index.js';
import {
  mountInteractiveReply,
  sendResponseToInteraction,
} from '@/discord/interactions/index.js';
import { createRegisterController } from '@/discord/usecases/index.js';
import { buildRegisterAlreadyContainer } from '@/discord/presentations/index.js';
import { getLegalAcceptance } from '@/core/repositories/index.js';
import { resolveUserLocale } from '@/discord/locale.js';
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
  requirements: { scope: 'anywhere', authorization: 'everyone' },
  async execute(interaction) {
    const userId = interaction.user.id;
    const language = await resolveUserLocale(userId);

    const acceptance = await getLegalAcceptance(userId);
    if (acceptance) {
      await sendResponseToInteraction(interaction, {
        container: buildRegisterAlreadyContainer(
          language,
          acceptance.acceptedVersion,
          acceptance.acceptedAt,
        ),
      });
      return;
    }

    await mountInteractiveReply(
      interaction,
      createRegisterController(userId, language),
    );
  },
} satisfies SlashCommand;

export default command;
