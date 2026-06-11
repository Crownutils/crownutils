import { lang } from '@/lang/index.js';
import { buildBotInfoContainer } from '@/services/presentations/about-presentation.js';
import type { SlashCommand } from '@/types/command/command.js';
import { SlashCommandBuilder } from 'discord.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('about')
    .setDescription(lang.commands.about.commandDescription),
  requirements: {
    scope: 'global',
  },

  async execute(interaction) {
    const reply = buildBotInfoContainer().build();

    await interaction.reply(reply);
  },
} satisfies SlashCommand;
