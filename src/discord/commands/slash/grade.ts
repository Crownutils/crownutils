import { lang } from '@/discord/lang/index.js';
import { buildGradeContainer } from '@/discord/presentations/grade-presentation.js';
import type { SlashCommand } from '@/discord/types/command.js';
import { SlashCommandBuilder } from 'discord.js';

/** `/grade`: shows the caller's permission grade. */
export const command = {
  data: new SlashCommandBuilder()
    .setName('grade')
    .setDescription(lang.commands.grade.commandDescription),
  requirements: {
    scope: 'global',
  },
  help: {
    usageSlash: '/grade',
  },

  async execute(interaction) {
    const reply = buildGradeContainer(interaction.user.id).build();
    await interaction.reply(reply);
  },
} satisfies SlashCommand;
