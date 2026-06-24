import { PREFIX } from '@/discord/constants.js';
import { lang } from '@/discord/lang/index.js';
import { runDataCommand } from '@/discord/legal/data-command.js';
import type { PrefixCommand } from '@/discord/types/command.js';

/** `c!data`: shows the personal data the bot stores about the caller. */
export const command = {
  name: 'data',
  description: lang.commands.data.commandDescription,
  aliases: ['d'],
  requirements: {
    scope: 'everywhere',
  },
  help: {
    usagePrefix: `${PREFIX}data`,
  },

  async execute(message, args) {
    const requestedTargetId = args[0]?.replace(/\D/g, '') || undefined;
    const container = await runDataCommand(message.author.id, requestedTargetId);
    await message.reply(container.build());
  },
} satisfies PrefixCommand;
