import { lang } from '@/discord/lang/index.js';
import { buildBotInfoContainer } from '@/discord/presentations/about-presentation.js';
import type { SlashCommand } from '@/discord/types/command.js';
import { SlashCommandBuilder } from 'discord.js';

/** `/about`: shows bot info. */
export const command = {
  data: new SlashCommandBuilder()
    .setName('about')
    .setDescription(lang.commands.about.commandDescription),
  requirements: {
    scope: 'global',
  },
  help: {
    usageSlash: '/about',
  },

  async execute(interaction) {
    const reply = buildBotInfoContainer().build();

    await interaction.reply(reply);
  },
} satisfies SlashCommand;
