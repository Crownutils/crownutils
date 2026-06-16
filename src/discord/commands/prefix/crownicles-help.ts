import { resolveAuthorization } from '@/core/permissions/index.js';
import { PREFIX } from '@/discord/constants.js';
import { lang } from '@/discord/lang/index.js';
import { buildCrowniclesHelpContainer } from '@/discord/presentations/crownicles-help/crownicles-help-presentation.js';
import { attachCrowniclesHelp } from '@/discord/presentations/crownicles-help/index.js';
import type { PrefixCommand } from '@/discord/types/command.js';

/** `c!crownicles-help [category]`: opens the Crownicles help center. */
export const command = {
  name: 'crownicles-help',
  description: lang.commands.crowniclesHelp.commandDescription,
  aliases: [
    'cc',
    'ch',
    'crownicleshelp',
    'crowniclescenter',
    'crownicles-center',
    'crh',
    'crc',
  ],
  requirements: {
    scope: 'global',
  },
  help: {
    usagePrefix: `${PREFIX}crownicles-help [category]`,
  },

  async execute(message, args) {
    const authorization = resolveAuthorization(message.author.id);
    const category = args[0];

    const container = buildCrowniclesHelpContainer(authorization, category);
    const sent = await message.reply(container.build());

    attachCrowniclesHelp(sent, message.author.id, authorization, category);
  },
} satisfies PrefixCommand;
