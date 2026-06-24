import { SlashCommandBuilder } from 'discord.js';
import { lang } from '@/discord/lang/index.js';
import { runDataCommand } from '@/discord/legal/data-command.js';
import type { SlashCommand } from '@/discord/types/command.js';

/** `/data`: shows the personal data the bot stores about the caller. */
export const command = {
  data: new SlashCommandBuilder()
    .setName('data')
    .setDescription(lang.commands.data.commandDescription)
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription(lang.commands.data.options.user)
        .setRequired(false),
    ),
  requirements: {
    scope: 'everywhere',
  },
  help: {
    usageSlash: '/data [user]',
  },

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const container = await runDataCommand(interaction.user.id, target?.id);
    await interaction.reply(container.build());
  },
} satisfies SlashCommand;
