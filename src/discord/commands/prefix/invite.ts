import { PREFIX } from '@/discord/constants.js';
import { lang } from '@/discord/lang/index.js';
import { buildInviteContainer } from '@/discord/presentations/invite-presentation.js';
import type { PrefixCommand } from '@/discord/types/command.js';

/** `c!invite`: shows the bot's invitation link. */
export const command = {
  name: 'invite',
  description: lang.commands.invite.commandDescription,
  requirements: {
    scope: 'global',
  },
  help: {
    usagePrefix: `${PREFIX}invite`,
  },

  async execute(message, _args) {
    await message.reply(buildInviteContainer().build());
  },
} satisfies PrefixCommand;
