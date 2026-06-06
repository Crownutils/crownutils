import { SlashCommandBuilder } from 'discord.js';
import { pingDescription, pingMessages } from '@/lang/index.js';
import type { SlashCommand } from '@/types/command.js';
import { Container } from '@/lib/components/container.js';
import { Text } from '@/lib/components/text.js';
import { Separator } from '@/lib/components/separator.js';
import { Title } from '@/lib/components/title.js';

export const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription(pingDescription),

  async execute(interaction) {
    const before = Date.now();
    await interaction.deferReply();
    const totalLatency = Date.now() - before;
    const discordLatency = Math.round(interaction.client.ws.ping);

    const message = new Container()
      .color('info')
      .add(
        new Title(pingMessages.title),
        new Separator(),
        new Text(pingMessages.result(totalLatency, discordLatency)),
      )
      .build();

    await interaction.editReply(message);
  },
};
