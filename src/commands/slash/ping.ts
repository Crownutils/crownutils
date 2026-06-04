import { SlashCommandBuilder } from 'discord.js';
import { MessageBuilder } from '@/lib/message-builder.js';
import { pingMessages } from '@/lang/index.js';
import type { SlashCommand } from '@/types/command.js';

export const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Affiche la latence du bot.'),

  async execute(interaction) {
    const before = Date.now();
    await interaction.deferReply();
    const totalLatency = Date.now() - before;
    const discordLatency = Math.round(interaction.client.ws.ping);

    const message = new MessageBuilder()
      .color('info')
      .title('Pong 🏓')
      .separator()
      .text(pingMessages.result(totalLatency, discordLatency))
      .build();

    await interaction.editReply(message);
  },
};
