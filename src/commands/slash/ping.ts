import { SlashCommandBuilder } from 'discord.js';
import type { SlashCommand } from '@/types/command.js';
import { pingMessages } from '@/lang/index.js';

export const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Affiche la latence du bot.'),

  async execute(interaction) {
    const before = Date.now();

    await interaction.reply({ content: pingMessages.calculating });

    const totalLatency = Date.now() - before;

    const discordLatency = Math.round(interaction.client.ws.ping);

    await interaction.editReply(
      pingMessages.result(totalLatency, discordLatency),
    );
  },
};
