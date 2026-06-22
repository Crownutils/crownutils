import {
  getReadMailIds,
  listActiveMails,
} from '@/core/mails/mail-repository.js';
import { PREFIX } from '@/discord/constants.js';
import { lang } from '@/discord/lang/index.js';
import {
  attachMailsViewer,
  buildMailsContainer,
  type MailsViewState,
} from '@/discord/presentations/mail-presentation.js';
import type { PrefixCommand } from '@/discord/types/command.js';

/** `c!mails`: opens the team-announcement inbox. */
export const command = {
  name: 'mails',
  description: lang.commands.mails.commandDescription,
  aliases: ['inbox', 'mailbox'],
  requirements: {
    scope: 'global',
  },
  help: {
    usagePrefix: `${PREFIX}mails`,
  },

  async execute(message) {
    const userId = message.author.id;
    const [mails, readIds] = await Promise.all([
      listActiveMails(),
      getReadMailIds(userId),
    ]);

    const initial: MailsViewState = { page: 0, readIds };
    const sent = await message.reply(
      buildMailsContainer(mails, initial, { disabled: false }).build(),
    );
    attachMailsViewer(sent, userId, mails, initial);
  },
} satisfies PrefixCommand;
