import { resolveUserLocale } from '@/discord/context/locale.js';
import { mountInteractiveMessage } from '@/discord/interactions/index.js';
import {
  collectGuildOverview,
  createGuildListController,
} from '@/discord/features/guilds/guilds.service.js';
import type { PrefixCommand } from '@/discord/registries/index.js';

const command = {
  name: 'guilds',
  aliases: ['servers'],
  requirements: { scope: 'anywhere', authorization: 'owner' },
  async execute(message) {
    const locale = await resolveUserLocale(message.author.id);
    const overview = collectGuildOverview(message.client);
    if (message.channel.isSendable()) {
      await mountInteractiveMessage(
        message.channel,
        createGuildListController(overview, message.author.id, locale),
      );
    }
  },
} satisfies PrefixCommand;

export default command;
