import { SlashCommandBuilder } from 'discord.js';
import { lang } from '@/discord/lang/index.js';
import type { SlashCommand } from '@/discord/types/command.js';
import { buildPingResultContainer } from '@/discord/presentations/ping-presentation.js';

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

    await interaction.editReply(
      buildPingResultContainer(totalMs, discordMs).build(),
    );
  },
} satisfies SlashCommand;
