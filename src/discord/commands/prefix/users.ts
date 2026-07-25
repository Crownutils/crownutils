import { resolveUserLocale } from '@/discord/context/locale.js';
import { mountInteractiveMessage } from '@/discord/interactions/index.js';
import {
  createUserListController,
  loadUserCensus,
} from '@/discord/features/users/users.service.js';
import type { PrefixCommand } from '@/discord/registries/index.js';

const command = {
  name: 'users',
  requirements: { scope: 'anywhere', authorization: 'owner' },
  async execute(message) {
    if (!message.channel.isSendable()) return;

    const locale = await resolveUserLocale(message.author.id);
    const census = await loadUserCensus();
    await mountInteractiveMessage(
      message.channel,
      await createUserListController(
        census,
        message.author.id,
        locale,
        message.client,
      ),
    );
  },
} satisfies PrefixCommand;

export default command;
