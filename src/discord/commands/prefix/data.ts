import { resolveUserLocale } from '@/discord/context/locale.js';
import { sendResponseToMessage } from '@/discord/interactions/index.js';
import {
  runDataCommand,
  runDataCommandViaDM,
} from '@/discord/features/data/data.service.js';
import type { PrefixCommand } from '@/discord/registries/index.js';

const command = {
  name: 'data',
  requirements: { scope: 'anywhere', authorization: 'normal' },
  async execute(message) {
    const language = await resolveUserLocale(message.author.id);

    // Already in DM: reply there directly, no need to relay through another DM.
    const response = message.inGuild()
      ? await runDataCommandViaDM(message.author.id, language, message.author)
      : await runDataCommand(message.author.id, language, false);

    await sendResponseToMessage(message, response);
  },
} satisfies PrefixCommand;

export default command;
