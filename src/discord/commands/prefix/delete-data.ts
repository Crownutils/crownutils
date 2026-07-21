import { resolveUserLocale } from '@/discord/context/locale.js';
import {
  mountInteractiveMessage,
  safeDiscord,
  sendResponseToMessage,
} from '@/discord/interactions/index.js';
import { lang } from '@/discord/lang/index.js';
import {
  buildErrorContainer,
  buildSuccessContainer,
} from '@/discord/utils/errors.js';
import { prepareDeleteData } from '@/discord/features/delete-data/delete-data.service.js';
import type { PrefixCommand } from '@/discord/registries/index.js';

const command = {
  name: 'delete-data',
  aliases: ['dd'],
  requirements: { scope: 'anywhere', authorization: 'normal' },
  async execute(message) {
    const locale = await resolveUserLocale(message.author.id);
    const prepared = await prepareDeleteData(message.author.id, locale);

    if (prepared.kind === 'empty') {
      await sendResponseToMessage(message, prepared.response);
      return;
    }

    // Already in a DM: the confirmation is private right here.
    if (!message.inGuild() && message.channel.isSendable()) {
      await mountInteractiveMessage(message.channel, prepared.controller);
      return;
    }

    // In a guild: drive the private confirmation in the user's DMs.
    const dmChannel = await safeDiscord(message.author.createDM(), {
      action: 'deleteDataDM',
    });
    const t = lang[locale];
    await sendResponseToMessage(message, {
      container: dmChannel
        ? buildSuccessContainer(t.commandDeleteData.messages.checkDm)
        : buildErrorContainer(t.common.dmFailed),
    });
    if (dmChannel) {
      await mountInteractiveMessage(dmChannel, prepared.controller);
    }
  },
} satisfies PrefixCommand;

export default command;
