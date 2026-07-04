import { mountInteractiveMessage } from '@/discord/interactions/index.js';
import { createLanguageController } from '@/discord/usecases/index.js';
import { resolveUserLocale } from '@/discord/locale.js';
import type { PrefixCommand } from '@/discord/registries/index.js';

export const command = {
  name: 'language',
  aliases: ['lang'],
  requirements: { scope: 'guild', authorization: 'everyone' },

  async execute(message) {
    const channel = message.channel;
    if (!channel.isSendable()) return;

    const current = await resolveUserLocale(message.author.id);
    await mountInteractiveMessage(
      channel,
      createLanguageController(message.author.id, current),
    );
  },
} satisfies PrefixCommand;

export default command;
