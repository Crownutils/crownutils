import { lang } from '@/lang/index.js';
import { buildReminderListContainer } from '@/lib/reminder-presentation.js';
import { attachReminderListCollector } from '@/interactions/reminder-list.js';
import { listReminders } from '@/services/reminder-service.js';
import type { PrefixCommand } from '@/types/command/command.js';

export const command = {
  name: 'reminders',
  description: lang.reminder.listDescription,
  aliases: ['rl'],
  requirements: {
    scope: 'global',
  },

  async execute(message) {
    const reminders = await listReminders(message.author.id);
    const sent = await message.reply(
      buildReminderListContainer(reminders).build(),
    );
    attachReminderListCollector(sent, message.author.id);
  },
} satisfies PrefixCommand;
