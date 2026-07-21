import { getUserRank } from '@/core/repositories/index.js';
import { resolveUserLocale } from '@/discord/context/locale.js';
import { mountInteractiveMessage } from '@/discord/interactions/index.js';
import { createHelpController } from '@/discord/features/help/help.service.js';
import type { PrefixCommand } from '@/discord/registries/index.js';

const command = {
  name: 'help',
  aliases: ['h', 'commands'],
  requirements: { scope: 'anywhere', authorization: 'normal' },
  async execute(message) {
    const [locale, rank] = await Promise.all([
      resolveUserLocale(message.author.id),
      getUserRank(message.author.id),
    ]);
    if (message.channel.isSendable()) {
      await mountInteractiveMessage(
        message.channel,
        createHelpController(
          message.author.id,
          locale,
          rank,
          message.client.registries,
        ),
      );
    }
  },
} satisfies PrefixCommand;

export default command;
