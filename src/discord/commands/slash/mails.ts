import { SlashCommandBuilder } from 'discord.js';
import {
  getReadMailIds,
  listActiveMails,
} from '@/core/mails/mail-repository.js';
import { lang } from '@/discord/lang/index.js';
import { replyAndFetch } from '@/discord/interactions/reply.js';
import {
  attachMailsViewer,
  buildMailsContainer,
  type MailsViewState,
} from '@/discord/presentations/mail-presentation.js';
import type { SlashCommand } from '@/discord/types/command.js';

/** `/mails`: opens the team-announcement inbox. */
export const command = {
  data: new SlashCommandBuilder()
    .setName('mails')
    .setDescription(lang.commands.mails.commandDescription),
  requirements: {
    scope: 'global',
  },
  help: {
    usageSlash: '/mails',
  },

  async execute(interaction) {
    const userId = interaction.user.id;
    const [mails, readIds] = await Promise.all([
      listActiveMails(),
      getReadMailIds(userId),
    ]);

    const initial: MailsViewState = { page: 0, readIds };
    const reply = await replyAndFetch(
      interaction,
      buildMailsContainer(mails, initial, { disabled: false }).build(),
    );
    attachMailsViewer(reply, userId, mails, initial);
  },
} satisfies SlashCommand;
