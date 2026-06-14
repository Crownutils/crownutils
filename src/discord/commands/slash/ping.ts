import { SlashCommandBuilder } from 'discord.js';
import { lang } from '@/discord/lang/index.js';
import type { SlashCommand } from '@/discord/types/command.js';
import {
  Container,
  Text,
  Separator,
  Title,
} from '@/discord/components/index.js';

/** `/ping`: shows bot and Discord latency. */
export const command = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription(lang.commands.ping.commandDescription),
  requirements: {
    scope: 'global',
  },
  help: {
    usageSlash: '/ping',
  },

  async execute(interaction) {
    const before = Date.now();
    await interaction.deferReply();
    const totalMs = Date.now() - before;
    const discordMs = Math.round(interaction.client.ws.ping);

    const message = new Container()
      .color('info')
      .add(
        new Title(lang.commands.ping.messages.title),
        new Separator(),
        new Text(lang.commands.ping.messages.totalLatence(totalMs)).newLine(
          lang.commands.ping.messages.discordLatence(discordMs),
        ),
      )
      .build();

    await interaction.editReply(message);
  },
} satisfies SlashCommand;
