import { resolveAuthorization } from '@/core/permissions/index.js';
import { PREFIX } from '@/discord/constants.js';
import { attachHelpSelectCollector } from '@/discord/interactions/help-select.js';
import { lang } from '@/discord/lang/index.js';
import { buildHelpContainer } from '@/discord/presentations/help-presentation.js';
import { prefixCommands } from '@/discord/registries/prefix-registry.js';
import type { PrefixCommand } from '@/discord/types/command.js';

/** `c!help` (aliases `aide`, `h`): shows the interactive help menu. */
export const command = {
  name: 'help',
  description: lang.commands.help.commandDescription,
  aliases: ['aide', 'h'],
  requirements: {
    scope: 'global',
  },
  help: {
    usagePrefix: `${PREFIX}help`,
  },

  async execute(message, _args) {
    const commands = [...new Set(prefixCommands.values())];
    const userAuthorization = resolveAuthorization(message.author.id);
    const sent = await message.reply(
      buildHelpContainer(commands, userAuthorization).build(),
    );
    attachHelpSelectCollector(
      sent,
      message.author.id,
      commands,
      userAuthorization,
    );
  },
} satisfies PrefixCommand;
