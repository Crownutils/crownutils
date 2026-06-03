import type { SlashCommand } from '@/types/command.js';
import { SlashCommandBuilder } from 'discord.js';

export const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Affiche la latence du bot.'),

  async execute(interaction) {
    const latency = interaction.client.ws.ping;
    await interaction.reply(`🏓 Pong ! Latence : ${latency}ms`);
  },
};
