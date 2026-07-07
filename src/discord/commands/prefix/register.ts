import {
  mountInteractiveMessage,
  sendResponseToMessage,
} from '@/discord/interactions/index.js';
import {
  createRegisterController,
  runRegisterAlreadyResponse,
} from '@/discord/usecases/index.js';
import { resolveUserLocale } from '@/discord/context/locale.js';
import type { PrefixCommand } from '@/discord/registries/index.js';

const command = {
  name: 'register',
  requirements: { scope: 'anywhere', authorization: 'normal' },
  async execute(message) {
    const channel = message.channel;
    if (!channel.isSendable()) return;

    const userId = message.author.id;
    const language = await resolveUserLocale(userId);

    const alreadyRegistered = await runRegisterAlreadyResponse(
      userId,
      language,
    );
    if (alreadyRegistered) {
      await sendResponseToMessage(message, alreadyRegistered);
      return;
    }

    await mountInteractiveMessage(
      channel,
      createRegisterController(userId, language),
    );
  },
} satisfies PrefixCommand;

export default command;
