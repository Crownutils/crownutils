import { resolveUserLocale } from '@/discord/context/locale.js';
import { mountInteractiveMessage } from '@/discord/interactions/index.js';
import { createCrowniclesHelpController } from '@/discord/features/crownicles-help/crownicles-help.service.js';
import type { PrefixCommand } from '@/discord/registries/index.js';

const command = {
  name: 'crownicles-help',
  aliases: ['chelp'],
  requirements: { scope: 'anywhere', authorization: 'normal' },
  async execute(message) {
    const locale = await resolveUserLocale(message.author.id);
    if (message.channel.isSendable()) {
      await mountInteractiveMessage(
        message.channel,
        createCrowniclesHelpController(message.author.id, locale),
      );
    }
  },
} satisfies PrefixCommand;

export default command;
