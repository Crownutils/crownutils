import {
  mountInteractiveMessage,
  sendResponseToMessage,
} from '@/discord/interactions/index.js';
import {
  canRegister,
  createRegisterController,
  runRegisterGateDenied,
} from '@/discord/usecases/index.js';
import { resolveUserLocale } from '@/discord/context/locale.js';
import type { PrefixCommand } from '@/discord/registries/index.js';

export const command = {
  name: 'register',
  requirements: { scope: 'guild', authorization: 'normal' },
  gate: (message) => canRegister(message.author.id),
  async onGateDenied(message) {
    const language = await resolveUserLocale(message.author.id);
    await sendResponseToMessage(
      message,
      await runRegisterGateDenied(message.author.id, language),
    );
  },
  async execute(message) {
    const channel = message.channel;
    if (!channel.isSendable()) return;

    const userId = message.author.id;
    const language = await resolveUserLocale(userId);

    await mountInteractiveMessage(
      channel,
      createRegisterController(userId, language),
    );
  },
} satisfies PrefixCommand;

export default command;
