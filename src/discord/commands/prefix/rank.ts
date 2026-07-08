import { resolveUserLocale } from '@/discord/context/locale.js';
import { sendResponseToMessage } from '@/discord/interactions/index.js';
import type { PrefixCommand } from '@/discord/registries/index.js';
import { runRankCommand } from '@/discord/features/rank/rank.service.js';

const command = {
  name: 'rank',
  aliases: ['grade', 'permission'],
  requirements: { scope: 'anywhere', authorization: 'normal' },
  async execute(message, _args) {
    const language = await resolveUserLocale(message.author.id);
    await sendResponseToMessage(
      message,
      await runRankCommand(message.author.id, language),
    );
  },
} satisfies PrefixCommand;

export default command;
