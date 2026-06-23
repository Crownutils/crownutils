import { SlashCommandBuilder } from 'discord.js';
import { lang } from '@/discord/lang/index.js';
import {
  attachDeleteDataConfirm,
  buildDeleteConfirmContainer,
} from '@/discord/presentations/delete-data-presentation.js';
import { replyAndFetch } from '@/discord/interactions/reply.js';
import type { SlashCommand } from '@/discord/types/command.js';

/** `/delete-data`: erases all the caller's data after a confirmation. */
export const command = {
  data: new SlashCommandBuilder()
    .setName('delete-data')
    .setDescription(lang.commands.deleteData.commandDescription),
  requirements: {
    scope: 'everywhere',
  },
  help: {
    usageSlash: '/delete-data',
  },

  async execute(interaction) {
    const reply = await replyAndFetch(
      interaction,
      buildDeleteConfirmContainer().build({ ephemeral: true }),
    );
    attachDeleteDataConfirm(reply, interaction.user.id);
  },
} satisfies SlashCommand;
