import { mountInteractiveMessage } from '@/discord/interactions/index.js';
import { createLanguageController } from '@/discord/features/language/language.service.js';
import { resolveUserLocale } from '@/discord/context/locale.js';
import type { PrefixCommand } from '@/discord/registries/index.js';

const command = {
  name: 'language',
  aliases: ['lang'],
  requirements: { scope: 'anywhere', authorization: 'normal' },

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
