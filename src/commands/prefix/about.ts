import { lang } from '@/lang/index.js';
import { buildBotInfoContainer } from '@/services/presentations/about-presentation.js';
import type { PrefixCommand } from '@/types/command/command.js';

export const command = {
  name: 'about',
  aliases: ['botinfo'],
  description: lang.about.commandDescription,
  requirements: {
    scope: 'global',
  },

  async execute(message) {
    const reply = buildBotInfoContainer().build();
    await message.reply(reply);
  },
} satisfies PrefixCommand;
