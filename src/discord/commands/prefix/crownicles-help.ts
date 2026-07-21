import { resolveUserLocale } from '@/discord/context/locale.js';
import { mountInteractiveMessage } from '@/discord/interactions/index.js';
import { createCrowniclesHelpController } from '@/discord/features/crownicles-help/crownicles-help.service.js';
import { resolveCategoryArg } from '@/discord/features/crownicles-help/pages/index.js';
import type { PrefixCommand } from '@/discord/registries/index.js';

const command = {
  name: 'crownicles-help',
  aliases: ['chelp', 'ch'],
  requirements: { scope: 'anywhere', authorization: 'normal' },
  async execute(message, args) {
    const locale = await resolveUserLocale(message.author.id);
    const category = args[0] ? resolveCategoryArg(args[0]) : undefined;
    const controller = await createCrowniclesHelpController(
      message.author.id,
      locale,
      category,
    );
    if (message.channel.isSendable()) {
      await mountInteractiveMessage(message.channel, controller);
    }
  },
} satisfies PrefixCommand;

export default command;
