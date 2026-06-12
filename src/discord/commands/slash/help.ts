import { attachHelpSelectCollector } from '@/discord/interactions/help-select.js';
import { lang } from '@/discord/lang/index.js';
import { buildHelpContainer } from '@/discord/presentations/help-presentation.js';
import { slashCommands } from '@/discord/registries/slash-registry.js';
import type { SlashCommand } from '@/discord/types/command.js';
import { SlashCommandBuilder } from 'discord.js';

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
    await interaction.reply(buildHelpContainer(commands).build());
    const reply = await interaction.fetchReply();
    attachHelpSelectCollector(reply, interaction.user.id, commands);
  },
} satisfies SlashCommand;
