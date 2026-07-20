import { listActiveReminders } from '@/core/repositories/index.js';
import { resolveUserLocale } from '@/discord/context/locale.js';
import { mountInteractiveMessage } from '@/discord/interactions/index.js';
import { createReminderListController } from '@/discord/features/reminder/reminder.service.js';
import type { PrefixCommand } from '@/discord/registries/index.js';

const command = {
  name: 'reminders',
  aliases: ['rl'],
  requirements: { scope: 'anywhere', authorization: 'normal' },
  async execute(message) {
    const locale = await resolveUserLocale(message.author.id);
    const reminders = await listActiveReminders(message.author.id);
    if (message.channel.isSendable()) {
      await mountInteractiveMessage(
        message.channel,
        createReminderListController(reminders, message.author.id, locale),
      );
    }
  },
} satisfies PrefixCommand;

export default command;
