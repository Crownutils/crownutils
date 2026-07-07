import { resolveUserLocale } from '@/discord/context/locale.js';
import { sendResponseToMessage } from '@/discord/interactions/index.js';
import { runDataCommand } from '@/discord/usecases/index.js';
import type { PrefixCommand } from '@/discord/registries/index.js';

const command = {
  name: 'data',
  requirements: { scope: 'dm', authorization: 'normal' },
  async execute(message) {
    const language = await resolveUserLocale(message.author.id);
    await sendResponseToMessage(
      message,
      await runDataCommand(message.author.id, language),
    );
  },
} satisfies PrefixCommand;

export default command;
