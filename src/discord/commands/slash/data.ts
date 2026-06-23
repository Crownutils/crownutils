import { SlashCommandBuilder } from 'discord.js';
import { lang } from '@/discord/lang/index.js';
import { runDataCommand } from '@/discord/legal/data-command.js';
import type { SlashCommand } from '@/discord/types/command.js';

/** `/data`: shows the personal data the bot stores about the caller. */
export const command = {
  data: new SlashCommandBuilder()
    .setName('data')
    .setDescription(lang.commands.data.commandDescription),
  requirements: {
    scope: 'everywhere',
  },
  help: {
    usageSlash: '/data',
  },

  async execute(interaction) {
    const container = await runDataCommand(interaction.user.id);
    await interaction.reply(container.build());
  },
} satisfies SlashCommand;
