import { getUserRank } from '@/core/repositories/index.js';
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
    const [locale, rank] = await Promise.all([
      resolveUserLocale(message.author.id),
      getUserRank(message.author.id),
    ]);
    const category = args[0] ? resolveCategoryArg(args[0]) : undefined;
    const controller = await createCrowniclesHelpController(
      message.author.id,
      locale,
      rank,
      category,
    );
    if (message.channel.isSendable()) {
      await mountInteractiveMessage(message.channel, controller);
    }
  },
} satisfies PrefixCommand;

export default command;
