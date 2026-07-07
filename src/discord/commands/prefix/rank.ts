import { resolveUserLocale } from '@/discord/context/locale.js';
import { sendResponseToMessage } from '@/discord/interactions/respond.js';
import type { PrefixCommand } from '@/discord/registries/types.js';
import { runRankCommand } from '@/discord/usecases/index.js';

const command = {
  name: 'rank',
  aliases: ['grade', 'permission'],
  requirements: { scope: 'guild', authorization: 'normal' },
  async execute(message, _args) {
    const language = await resolveUserLocale(message.author.id);
    await sendResponseToMessage(
      message,
      await runRankCommand(message.author.id, language),
    );
  },
} satisfies PrefixCommand;

export default command;
