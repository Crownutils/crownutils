import { mountInteractiveMessage } from '@/discord/interactions/index.js';
import { createLegalController } from '@/discord/features/legal/legal.service.js';
import { resolveUserLocale } from '@/discord/context/locale.js';
import type { PrefixCommand } from '@/discord/registries/index.js';

const command = {
  name: 'legal',
  requirements: { scope: 'anywhere', authorization: 'normal' },

  async execute(message) {
    const channel = message.channel;
    if (!channel.isSendable()) return;

    const language = await resolveUserLocale(message.author.id);
    await mountInteractiveMessage(
      channel,
      createLegalController(message.author.id, language),
    );
  },
} satisfies PrefixCommand;

export default command;
