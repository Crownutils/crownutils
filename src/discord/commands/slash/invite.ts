import { lang } from '@/discord/lang/index.js';
import { buildInviteContainer } from '@/discord/presentations/invite-presentation.js';
import type { SlashCommand } from '@/discord/types/command.js';
import { SlashCommandBuilder } from 'discord.js';

/** `/invite`: shows the bot's invitation link. */
export const command = {
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription(lang.commands.invite.commandDescription),
  requirements: {
    scope: 'global',
  },
  help: {
    usageSlash: '/invite',
  },

  async execute(interaction) {
    await interaction.reply(buildInviteContainer().build());
  },
} satisfies SlashCommand;
