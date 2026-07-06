import { rankLevel } from '@/core/permissions/index.js';
import { getUserRank } from '@/core/repositories/index.js';
import { resolveUserLocale } from '@/discord/context/locale.js';
import { sendResponseToMessage } from '@/discord/interactions/respond.js';
import type { PrefixCommand } from '@/discord/registries/types.js';
import { runRankCommand } from '@/discord/usecases/index.js';

const command = {
  name: 'rank',
  aliases: ['grade', 'permission'],
  requirements: { scope: 'guild', authorization: 'normal' },
  async execute(message, _args) {
    const userRank = await getUserRank(message.author.id);
    if (userRank === 'banned') {
      throw new Error('Unexpected banned user reached a command.');
    }

    const userRankLevel = rankLevel(userRank);
    await sendResponseToMessage(
      message,
      runRankCommand(
        await resolveUserLocale(message.author.id),
        userRank,
        userRankLevel,
      ),
    );
  },
} satisfies PrefixCommand;

export default command;
