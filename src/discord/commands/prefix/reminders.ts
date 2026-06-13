import { PREFIX } from '@/discord/constants.js';
import { lang } from '@/discord/lang/index.js';
import { buildReminderListContainer } from '@/discord/presentations/reminder-presentation.js';
import { attachReminderListCollector } from '@/discord/interactions/reminder-list.js';
import { listReminders } from '@/discord/reminders/reminder-bridge.js';
import type { PrefixCommand } from '@/discord/types/command.js';

/** `c!reminders` (alias `rl`): lists the caller's reminders with delete buttons. */
export const command = {
  name: 'reminders',
  description: lang.commands.reminders.commandDescription,
  aliases: ['rl'],
  requirements: {
    scope: 'global',
  },
  help: {
    usagePrefix: `${PREFIX}reminders`,
  },

  async execute(message, _args) {
    const reminders = await listReminders(message.author.id);
    const sent = await message.reply(
      buildReminderListContainer(reminders).build(),
    );
    attachReminderListCollector(sent, message.author.id, reminders);
  },
} satisfies PrefixCommand;
