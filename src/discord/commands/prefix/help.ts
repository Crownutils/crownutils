import { PREFIX } from '@/discord/constants.js';
import { attachHelpSelectCollector } from '@/discord/interactions/help-select.js';
import { lang } from '@/discord/lang/index.js';
import { buildHelpContainer } from '@/discord/presentations/help-presentation.js';
import { prefixCommands } from '@/discord/registries/prefix-registry.js';
import type { PrefixCommand } from '@/discord/types/command.js';

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
    const sent = await message.reply(buildHelpContainer(commands).build());
    attachHelpSelectCollector(sent, message.author.id, commands);
  },
} satisfies PrefixCommand;
