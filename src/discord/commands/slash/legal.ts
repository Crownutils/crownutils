import { SlashCommandBuilder } from 'discord.js';
import { lang } from '@/discord/lang/index.js';
import { runLegalCommand } from '@/discord/legal/legal-command.js';
import { attachLegalViewer } from '@/discord/presentations/legal-presentation.js';
import { replyAndFetch } from '@/discord/interactions/reply.js';
import type { SlashCommand } from '@/discord/types/command.js';

/** `/legal`: views the privacy policy and terms of service, and accepts them. */
export const command = {
  data: new SlashCommandBuilder()
    .setName('legal')
    .setDescription(lang.commands.legal.commandDescription),
  requirements: {
    scope: 'everywhere',
  },
  help: {
    usageSlash: '/legal',
  },

  async execute(interaction) {
    const { container, acceptedAt } = await runLegalCommand(
      interaction.user.id,
    );
    const reply = await replyAndFetch(interaction, container.build());
    attachLegalViewer(reply, interaction.user.id, acceptedAt);
  },
} satisfies SlashCommand;
