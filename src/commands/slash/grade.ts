import { lang } from "@/lang/index.js";
import { buildGradeContainer } from "@/services/presentations/grade-presentation.js";
import { SlashCommand } from "@/types/command/command.js";
import { SlashCommandBuilder } from "discord.js";

export const command = {
  data: new SlashCommandBuilder().setName('grade').setDescription(lang.commands.grade.commandDescription),
  requirements: {
    scope: 'global'
  },

  async execute(interaction) {
    const reply = buildGradeContainer(interaction.user.id).build();
    await interaction.reply(reply);
  }
} satisfies SlashCommand;
