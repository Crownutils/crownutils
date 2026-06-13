import { resolveAuthorization } from '@/core/permissions/index.js';
import { attachHelpSelectCollector } from '@/discord/interactions/help-select.js';
import { lang } from '@/discord/lang/index.js';
import { buildHelpContainer } from '@/discord/presentations/help-presentation.js';
import { slashCommands } from '@/discord/registries/slash-registry.js';
import type { SlashCommand } from '@/discord/types/command.js';
import { SlashCommandBuilder } from 'discord.js';

/** `/help`: shows the interactive help menu. */
export const command = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription(lang.commands.help.commandDescription),
  requirements: {
    scope: 'global',
  },
  help: {
    usageSlash: '/help',
  },

  async execute(interaction) {
    const commands = [...new Set(slashCommands.values())];
    const userAuthorization = resolveAuthorization(interaction.user.id);
    await interaction.reply(
      buildHelpContainer(commands, userAuthorization).build(),
    );
    const reply = await interaction.fetchReply();
    attachHelpSelectCollector(
      reply,
      interaction.user.id,
      commands,
      userAuthorization,
    );
  },
} satisfies SlashCommand;
