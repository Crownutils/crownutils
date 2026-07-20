import { Locale, SlashCommandBuilder } from 'discord.js';
import { resolveUserLocale } from '@/discord/context/locale.js';
import { sendResponseToInteraction } from '@/discord/interactions/index.js';
import { lang } from '@/discord/lang/index.js';
import { isOwner } from '@/core/permissions/index.js';
import { buildErrorContainer } from '@/discord/utils/errors.js';
import {
  runDataCommand,
  runDataLookupCommand,
} from '@/discord/features/data/data.service.js';
import type {
  SlashCommand,
  SlashCommandData,
} from '@/discord/registries/index.js';

function createDataCommandData(): SlashCommandData {
  return new SlashCommandBuilder()
    .setName('data')
    .setDescription(lang.en.commandData.description)
    .setDescriptionLocalizations({
      [Locale.French]: lang.fr.commandData.description,
    })
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription(lang.en.commandData.messages.userOption)
        .setDescriptionLocalizations({
          [Locale.French]: lang.fr.commandData.messages.userOption,
        })
        .setRequired(false),
    );
}

const command = {
  data: createDataCommandData(),
  requirements: { scope: 'anywhere', authorization: 'normal' },
  async execute(interaction) {
    const language = await resolveUserLocale(interaction.user.id);
    const target = interaction.options.getUser('user');

    if (target && target.id !== interaction.user.id) {
      if (!isOwner(interaction.user.id)) {
        await sendResponseToInteraction(interaction, {
          container: buildErrorContainer(
            lang[language].common.permissionDenied,
          ),
          ephemeral: true,
        });
        return;
      }

      await sendResponseToInteraction(
        interaction,
        await runDataLookupCommand(target.id, language),
      );
      return;
    }

    await sendResponseToInteraction(
      interaction,
      await runDataCommand(
        interaction.user.id,
        language,
        interaction.inGuild(),
      ),
    );
  },
} satisfies SlashCommand;

export default command;
