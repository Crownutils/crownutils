import { lang } from '@/discord/lang/index.js';
import { buildBotInfoContainer } from '@/discord/presentations/about-presentation.js';
import type { PrefixCommand } from '@/discord/types/command.js';

export const command = {
  name: 'about',
  aliases: ['botinfo'],
  description: lang.commands.about.commandDescription,
  requirements: {
    scope: 'global',
  },

  async execute(message, _args) {
    const reply = buildBotInfoContainer().build();
    await message.reply(reply);
  },
} satisfies PrefixCommand;
