import { PREFIX } from '@/discord/constants.js';
import { lang } from '@/discord/lang/index.js';
import {
  attachDeleteDataConfirm,
  buildDeleteConfirmContainer,
} from '@/discord/presentations/delete-data-presentation.js';
import type { PrefixCommand } from '@/discord/types/command.js';

/** `c!delete-data`: erases all the caller's data after a confirmation. */
export const command = {
  name: 'delete-data',
  description: lang.commands.deleteData.commandDescription,
  aliases: ['dd'],
  requirements: {
    scope: 'everywhere',
  },
  help: {
    usagePrefix: `${PREFIX}delete-data`,
  },

  async execute(message, _args) {
    const sent = await message.reply(buildDeleteConfirmContainer().build());
    attachDeleteDataConfirm(sent, message.author.id);
  },
} satisfies PrefixCommand;
