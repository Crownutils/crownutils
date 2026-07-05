import { sendResponseToMessage } from '@/discord/interactions/index.js';
import { resolveUserLocale } from '@/discord/locale.js';
import type { PrefixCommand } from '@/discord/registries/index.js';
import { runAboutCommand } from '@/discord/usecases/about.js';

export const command = {
  name: 'about',
  aliases: ['botinfo'],
  requirements: { scope: 'guild', authorization: 'everyone' },

  async execute(message, _args) {
    const userLanguage = await resolveUserLocale(message.author.id);
    await sendResponseToMessage(message, runAboutCommand(userLanguage));
  },
} satisfies PrefixCommand;

export default command;
