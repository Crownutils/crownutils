import { SlashCommandBuilder } from 'discord.js';
import { lang } from '@/lang/index.js';
import type { SlashCommand } from '@/types/command/command.js';
import { Container, Text, Separator, Title } from '@/lib/components/index.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription(lang.ping.commandDescription),
  requirements: {
    scope: 'global',
  },

  async execute(interaction) {
    const before = Date.now();
    await interaction.deferReply();
    const totalMs = Date.now() - before;
    const discordMs = Math.round(interaction.client.ws.ping);

    const message = new Container()
      .color('info')
      .add(
        new Title(lang.ping.messages.title),
        new Separator(),
        new Text(lang.ping.messages.result({ totalMs, discordMs })),
      )
      .build();

    await interaction.editReply(message);
  },
} satisfies SlashCommand;
