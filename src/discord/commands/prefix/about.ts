import { sendResponseToMessage } from '@/discord/interactions/index.js';
import { resolveUserLocale } from '@/discord/context/locale.js';
import type { PrefixCommand } from '@/discord/registries/index.js';
import { runAboutCommand } from '@/discord/features/about/about.service.js';

const command = {
  name: 'about',
  aliases: ['botinfo'],
  requirements: { scope: 'anywhere', authorization: 'normal' },

  async execute(message, _args) {
    const userLanguage = await resolveUserLocale(message.author.id);
    await sendResponseToMessage(message, runAboutCommand(userLanguage));
  },
} satisfies PrefixCommand;

export default command;
