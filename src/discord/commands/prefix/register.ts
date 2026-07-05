import {
  mountInteractiveMessage,
  sendResponseToMessage,
} from '@/discord/interactions/index.js';
import { createRegisterController } from '@/discord/usecases/index.js';
import { buildRegisterAlreadyContainer } from '@/discord/presentations/index.js';
import { getLegalAcceptance } from '@/core/repositories/index.js';
import { resolveUserLocale } from '@/discord/locale.js';
import type { PrefixCommand } from '@/discord/registries/index.js';

export const command = {
  name: 'register',
  requirements: { scope: 'guild', authorization: 'everyone' },

  async execute(message) {
    const channel = message.channel;
    if (!channel.isSendable()) return;

    const userId = message.author.id;
    const language = await resolveUserLocale(userId);

    const acceptance = await getLegalAcceptance(userId);
    if (acceptance) {
      await sendResponseToMessage(message, {
        container: buildRegisterAlreadyContainer(
          language,
          acceptance.acceptedVersion,
          acceptance.acceptedAt,
        ),
      });
      return;
    }

    await mountInteractiveMessage(
      channel,
      createRegisterController(userId, language),
    );
  },
} satisfies PrefixCommand;

export default command;
